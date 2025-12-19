'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import { MainLayout } from '@/components/layout';
import { EmptyState, PartyCard, LoadingSpinner, GradientButton } from '@/components/common';
import { ApplyConfirmModal } from '@/components/party';
import { usePartyStore } from '@/stores/partyStore';
import { scheduleApi, partyApi } from '@/api/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import type { Party } from '@/types';

function PartyPageContent() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { fetchParties, fetchBySchedule, getFilteredParties, setFilter } = usePartyStore();
  const [tabValue, setTabValue] = useState(0);
  const [schedules, setSchedules] = useState<{ scheduleId: number; title: string }[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | ''>('');

  // 파티 신청 모달 상태
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);

  useEffect(() => {
    if (!isAllowed) return;

    // URL 쿼리 파라미터에서 scheduleId 확인 (일정 상세에서 넘어온 경우)
    const scheduleIdParam = searchParams.get('scheduleId');
    if (scheduleIdParam) {
      const scheduleId = Number(scheduleIdParam);
      setSelectedSchedule(scheduleId);
      fetchBySchedule(scheduleId);
    } else {
      // Load party list
      fetchParties();
    }

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
  }, [fetchParties, fetchBySchedule, isAllowed, searchParams]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const partyType = newValue === 0 ? undefined : newValue === 1 ? 'LEAVE' : 'ARRIVE';

    if (selectedSchedule && partyType !== undefined) {
      fetchBySchedule(selectedSchedule, { partyType });
    } else if (selectedSchedule) {
      fetchBySchedule(selectedSchedule);
    } else if (partyType) {
      setFilter({ type: partyType });
    } else {
      fetchParties();
    }
  };

  const handleScheduleChange = (scheduleId: number | '') => {
    setSelectedSchedule(scheduleId);

    if (scheduleId === '') {
      fetchParties();
      return;
    }

    const partyType = tabValue === 0 ? undefined : tabValue === 1 ? 'LEAVE' : 'ARRIVE';
    fetchBySchedule(scheduleId, partyType ? { partyType } : undefined);
  };

  // 파티 카드 클릭 핸들러
  const handlePartyClick = (party: Party) => {
    // 내 파티거나 이미 신청한 파티면 모달 없이 상세로 이동
    if (party.isMyParty || party.isApplied) {
      router.push(`/party/${party.id}`);
      return;
    }
    // 모집중인 파티만 신청 가능
    if (party.status !== 'RECRUITING') {
      router.push(`/party/${party.id}`);
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
    if (selectedSchedule) {
      const partyType = tabValue === 0 ? undefined : tabValue === 1 ? 'LEAVE' : 'ARRIVE';
      fetchBySchedule(selectedSchedule, partyType ? { partyType } : undefined);
    } else {
      fetchParties();
    }
  };

  const filteredParties = getFilteredParties();

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h2">팬 파티 매칭</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <GradientButton
              size="small"
              startIcon={<AddIcon />}
              onClick={() => router.push('/party/create')}
            >
              파티 만들기
            </GradientButton>
            <Button
              size="small"
              variant="outlined"
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
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              내 파티
            </Button>
          </Stack>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>이벤트 선택</InputLabel>
          <Select
            value={selectedSchedule}
            label="이벤트 선택"
            onChange={(e) => handleScheduleChange(e.target.value as number | '')}
          >
            <MenuItem value="">전체</MenuItem>
            {schedules.map((schedule) => (
              <MenuItem key={schedule.scheduleId} value={schedule.scheduleId}>
                {schedule.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="전체" />
          <Tab label="출발" icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="귀가" icon={<HomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>

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
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
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
