'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import FolderIcon from '@mui/icons-material/Folder';
import { MainLayout } from '@/components/layout';
import { EmptyState, PartyCard, LoadingSpinner, GradientButton, PageHeader, Section } from '@/components/common';
import { ApplyConfirmModal } from '@/components/party';
import { ChatDialog } from '@/components/chat';
import { usePartyStore } from '@/stores/partyStore';
import { scheduleApi, partyApi } from '@/api/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import type { Party, PartyType, TransportType } from '@/types';

// 이동 수단 한글 라벨
const TRANSPORT_LABELS: Record<TransportType, string> = {
  TAXI: '택시',
  CARPOOL: '카풀',
  SUBWAY: '지하철',
  BUS: '버스',
  WALK: '도보',
};

function PartyPageContent() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { fetchParties, fetchBySchedule, getFilteredParties } = usePartyStore();

  // 필터 상태
  const [schedules, setSchedules] = useState<{ scheduleId: number; title: string }[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | ''>('');
  const [selectedPartyType, setSelectedPartyType] = useState<PartyType | ''>('');
  const [selectedTransportType, setSelectedTransportType] = useState<TransportType | ''>('');

  // 파티 신청 모달 상태
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  // 채팅 다이얼로그 상태
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatParty, setChatParty] = useState<Party | null>(null);

  // URL 쿼리 파라미터 업데이트 함수
  const updateQueryParams = useCallback((params: {
    scheduleId?: number | '';
    partyType?: PartyType | '';
    transportType?: TransportType | '';
  }) => {
    const url = new URLSearchParams();
    if (params.scheduleId) url.set('scheduleId', String(params.scheduleId));
    if (params.partyType) url.set('partyType', params.partyType);
    if (params.transportType) url.set('transportType', params.transportType);

    const queryString = url.toString();
    router.replace(queryString ? `/party?${queryString}` : '/party', { scroll: false });
  }, [router]);

  // 필터 적용 함수 (AND 조건)
  const applyFilters = useCallback((
    scheduleId: number | '',
    partyType: PartyType | '',
    transportType: TransportType | ''
  ) => {
    // 이벤트 선택 여부에 따라 API 분기
    if (scheduleId === '') {
      // 이벤트 미선택 시 전체 목록 조회 (클라이언트 사이드 필터링)
      fetchParties();
    } else {
      // 이벤트 선택 시 해당 이벤트의 파티만 조회 (서버 사이드 필터링)
      const params: {
        partyType?: PartyType;
        transportType?: TransportType;
      } = {};

      if (partyType !== '') {
        params.partyType = partyType;
      }
      if (transportType !== '') {
        params.transportType = transportType;
      }

      fetchBySchedule(scheduleId, Object.keys(params).length > 0 ? params : undefined);
    }
  }, [fetchParties, fetchBySchedule]);

  useEffect(() => {
    if (!isAllowed) return;

    // URL 쿼리 파라미터에서 필터 상태 복원
    const scheduleIdParam = searchParams.get('scheduleId');
    const partyTypeParam = searchParams.get('partyType') as PartyType | null;
    const transportTypeParam = searchParams.get('transportType') as TransportType | null;

    // 파싱된 값
    const parsedScheduleId = scheduleIdParam ? Number(scheduleIdParam) : '';
    const parsedPartyType = partyTypeParam && ['LEAVE', 'ARRIVE'].includes(partyTypeParam) ? partyTypeParam : '';
    const parsedTransportType = transportTypeParam && Object.keys(TRANSPORT_LABELS).includes(transportTypeParam) ? transportTypeParam : '';

    // 상태 업데이트
    setSelectedSchedule(parsedScheduleId);
    setSelectedPartyType(parsedPartyType);
    setSelectedTransportType(parsedTransportType);

    // 필터 적용
    applyFilters(parsedScheduleId, parsedPartyType, parsedTransportType);

    // Load schedule list for filter
    scheduleApi.getPartyList()
      .then((response) => {
        // API returns { events: [{ scheduleId, title }] }
        const data = response.data as { events?: { scheduleId: number; title: string }[] } | undefined;
        if (data?.events && Array.isArray(data.events)) {
          setSchedules(data.events);
        } else {
          setSchedules([]);
        }
      })
      .catch(() => {
        // API 에러 시 빈 배열 유지
        setSchedules([]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed, searchParams]);

  // 이벤트 선택 변경
  const handleScheduleChange = (scheduleId: number | '') => {
    setSelectedSchedule(scheduleId);
    applyFilters(scheduleId, selectedPartyType, selectedTransportType);
    updateQueryParams({ scheduleId, partyType: selectedPartyType, transportType: selectedTransportType });
  };

  // 파티 유형 변경
  const handlePartyTypeChange = (partyType: PartyType | '') => {
    setSelectedPartyType(partyType);
    applyFilters(selectedSchedule, partyType, selectedTransportType);
    updateQueryParams({ scheduleId: selectedSchedule, partyType, transportType: selectedTransportType });
  };

  // 이동 수단 변경
  const handleTransportTypeChange = (transportType: TransportType | '') => {
    setSelectedTransportType(transportType);
    applyFilters(selectedSchedule, selectedPartyType, transportType);
    updateQueryParams({ scheduleId: selectedSchedule, partyType: selectedPartyType, transportType });
  };

  // 파티 카드 클릭 핸들러
  const handlePartyClick = (party: Party) => {
    // 신청완료 상태면 채팅 다이얼로그 열기
    if (party.isApplied) {
      setChatParty(party);
      setChatDialogOpen(true);
      return;
    }
    // 내 파티면 내 파티 페이지로 이동
    if (party.isMyParty) {
      router.push('/party/my-parties');
      return;
    }
    // 모집중인 파티만 신청 가능
    if (party.status !== 'RECRUITING') {
      return;
    }
    // 신청 모달 열기
    setSelectedParty(party);
    setApplyModalOpen(true);
  };

  // 파티 신청 확인 핸들러
  const handleApplyConfirm = async () => {
    if (!selectedParty) return;

    await partyApi.apply(Number(selectedParty.id));
    // 신청 성공 후 목록 새로고침
    applyFilters(selectedSchedule, selectedPartyType, selectedTransportType);
  };

  // 클라이언트 사이드 필터링 (이벤트 미선택 시 파티유형/이동수단 필터 적용)
  const filteredParties = getFilteredParties().filter((party) => {
    // 이벤트가 선택된 경우 서버에서 이미 필터링됨
    if (selectedSchedule !== '') return true;

    // 이벤트 미선택 시 클라이언트 사이드 필터링
    if (selectedPartyType !== '' && party.type !== selectedPartyType) return false;
    if (selectedTransportType !== '' && party.transportType !== selectedTransportType) return false;
    return true;
  });

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Page Header */}
        <PageHeader
          title="팬 파티 매칭"
          subtitle="이벤트에 함께 갈 팬들을 찾아보세요"
          action={
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FolderIcon />}
                onClick={() => router.push('/party/my-parties')}
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  borderRadius: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                내 파티
              </Button>
              <GradientButton
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push('/party/create')}
              >
                파티 만들기
              </GradientButton>
            </>
          }
        />

        {/* Filters Section */}
        <Section title="필터">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {/* 이벤트 선택 */}
            <FormControl fullWidth size="small">
              <InputLabel>이벤트 선택</InputLabel>
              <Select
                value={selectedSchedule}
                label="이벤트 선택"
                onChange={(e) => handleScheduleChange(e.target.value as number | '')}
              >
                <MenuItem value="">전체 이벤트</MenuItem>
                {schedules.map((schedule) => (
                  <MenuItem key={schedule.scheduleId} value={schedule.scheduleId}>
                    {schedule.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 파티 유형 */}
            <FormControl fullWidth size="small">
              <InputLabel>파티 유형</InputLabel>
              <Select
                value={selectedPartyType}
                label="파티 유형"
                onChange={(e) => handlePartyTypeChange(e.target.value as PartyType | '')}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="LEAVE">출발팟</MenuItem>
                <MenuItem value="ARRIVE">귀가팟</MenuItem>
              </Select>
            </FormControl>

            {/* 이동 수단 */}
            <FormControl fullWidth size="small">
              <InputLabel>이동 수단</InputLabel>
              <Select
                value={selectedTransportType}
                label="이동 수단"
                onChange={(e) => handleTransportTypeChange(e.target.value as TransportType | '')}
              >
                <MenuItem value="">전체</MenuItem>
                {(Object.keys(TRANSPORT_LABELS) as TransportType[]).map((type) => (
                  <MenuItem key={type} value={type}>
                    {TRANSPORT_LABELS[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Section>

        {/* Parties Section */}
        <Section title="파티 목록" noBorder>
          {filteredParties.length === 0 ? (
            <EmptyState
              icon={<GroupIcon />}
              title="파티가 없습니다"
              description="새로운 파티를 만들어보세요!"
              actionLabel="파티 만들기"
              onAction={() => router.push('/party/create')}
            />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {filteredParties.map((party) => (
                <PartyCard
                  key={party.id}
                  id={party.id}
                  title={party.title}
                  type={party.type}
                  status={party.status}
                  eventName={party.eventName || ''}
                  venueName={party.venueName}
                  departure={party.departure}
                  arrival={party.arrival}
                  transportType={party.transportType}
                  currentMembers={party.currentMembers}
                  maxMembers={party.maxMembers}
                  leaderNickname={party.leaderNickname}
                  leaderAge={party.leaderAge}
                  leaderGender={party.leaderGender}
                  isMyParty={party.isMyParty}
                  isApplied={party.isApplied}
                  onClick={() => handlePartyClick(party)}
                />
              ))}
            </Box>
          )}
        </Section>
      </Box>

      {/* 파티 신청 동의 모달 */}
      <ApplyConfirmModal
        open={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setSelectedParty(null);
        }}
        onConfirm={handleApplyConfirm}
        party={selectedParty}
      />

      {/* 채팅 다이얼로그 */}
      {chatParty && (
        <ChatDialog
          open={chatDialogOpen}
          onClose={() => {
            setChatDialogOpen(false);
            setChatParty(null);
          }}
          partyId={chatParty.id}
          partyTitle={chatParty.title}
        />
      )}
    </MainLayout>
  );
}

export default function PartyPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="로딩 중..." />}>
      <PartyPageContent />
    </Suspense>
  );
}
