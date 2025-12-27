'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatIcon from '@mui/icons-material/Chat';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import StarIcon from '@mui/icons-material/Star';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import DirectionsSubwayIcon from '@mui/icons-material/DirectionsSubway';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';
import { MainLayout } from '@/components/layout';
import { EmptyState, GradientButton, LoadingSpinner, PageHeader, Section } from '@/components/common';
import { ApplicantListModal } from '@/components/party';
import { usePartyStore } from '@/stores/partyStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import type { Party, TransportType } from '@/types';

const transportConfig: Record<TransportType, { icon: React.ReactNode; label: string }> = {
  TAXI: { icon: <LocalTaxiIcon sx={{ fontSize: 14 }} />, label: '택시' },
  CARPOOL: { icon: <DriveEtaIcon sx={{ fontSize: 14 }} />, label: '카풀' },
  SUBWAY: { icon: <DirectionsSubwayIcon sx={{ fontSize: 14 }} />, label: '지하철' },
  BUS: { icon: <DirectionsBusIcon sx={{ fontSize: 14 }} />, label: '버스' },
  WALK: { icon: <DirectionsWalkIcon sx={{ fontSize: 14 }} />, label: '도보' },
};

export default function MyPartiesPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const theme = useTheme();
  const router = useRouter();
  const {
    myCreatedParties,
    myApplicationParties,
    getMyCreated,
    getMyApplications,
    getApplicants,
    acceptApplicant,
    rejectApplicant,
    cancelApplication,
    deleteParty,
    isLoading,
  } = usePartyStore();
  const { user, isLoggedIn } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [applicantModalParty, setApplicantModalParty] = useState<Party | null>(null);

  // Fetch both APIs on mount
  useEffect(() => {
    if (!isAllowed || !isLoggedIn) return;
    getMyCreated();
    getMyApplications();
  }, [isAllowed, isLoggedIn]);

  // 모든 파티 통합 (내가 만든 파티 + 신청/참여 파티)
  const allParties = useMemo(() => {
    const createdWithFlag = myCreatedParties.map(p => ({ ...p, isMyParty: true }));
    const applicationWithFlag = myApplicationParties.map(p => ({ ...p, isMyParty: false }));
    return [...createdWithFlag, ...applicationWithFlag];
  }, [myCreatedParties, myApplicationParties]);

  // Tab에 따른 파티 필터링
  const filteredParties = useMemo(() => {
    switch (tabValue) {
      case 0: // 내가 만든 파티
        return allParties.filter((p) => p.isMyParty);
      case 1: // 신청중
        return allParties.filter((p) => !p.isMyParty && p.applicationStatus === 'PENDING');
      case 2: // 참여중 (내가 만든 파티 제외, 승인된 파티만)
        return allParties.filter((p) =>
          !p.isMyParty && p.applicationStatus === 'APPROVED' && p.status !== 'COMPLETED'
        );
      case 3: // 종료
        return allParties.filter((p) => p.status === 'COMPLETED');
      default:
        return allParties;
    }
  }, [allParties, tabValue]);

  // 탭별 카운트
  const tabCounts = useMemo(() => ({
    created: myCreatedParties.length,
    pending: myApplicationParties.filter((p) => p.applicationStatus === 'PENDING').length,
    participating: myApplicationParties.filter((p) =>
      p.applicationStatus === 'APPROVED' && p.status !== 'COMPLETED'
    ).length,
    completed: allParties.filter((p) => p.status === 'COMPLETED').length,
  }), [allParties, myCreatedParties, myApplicationParties]);

  // Local state management functions - TODO: Replace with actual API calls
  const leaveParty = (partyId: string, _userId: string) => {
    console.log(`User ${_userId} left party ${partyId} - not yet implemented`);
  };

  const statusConfig = {
    RECRUITING: {
      label: '모집중',
      color: theme.palette.success.main,
    },
    CLOSED: {
      label: '모집마감',
      color: theme.palette.warning.main,
    },
    COMPLETED: {
      label: '종료',
      color: theme.palette.text.disabled,
    },
    CANCELLED: {
      label: '취소됨',
      color: theme.palette.error.main,
    },
  };

  const renderPartyItem = (party: Party, actions?: React.ReactNode, showApplicants?: boolean) => {
    const partyApplicants = showApplicants ? getApplicants(party.id) : [];
    const pendingApplicants = partyApplicants.filter((a) => a.status === 'PENDING');

    return (
      <Box
        key={party.id}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper,
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          width: '100%',
          minWidth: 0,
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
          },
        }}
        onClick={() => router.push(`/party/${party.id}`)}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              icon={party.type === 'LEAVE' ? <DirectionsCarIcon /> : <HomeIcon />}
              label={party.type === 'LEAVE' ? '출발팟' : '복귀팟'}
              sx={{
                bgcolor: alpha(
                  party.type === 'LEAVE' ? theme.palette.primary.main : theme.palette.secondary.main,
                  0.15
                ),
                color: party.type === 'LEAVE' ? theme.palette.primary.main : theme.palette.secondary.main,
                border: '1px solid',
                borderColor: party.type === 'LEAVE' ? theme.palette.primary.main : theme.palette.secondary.main,
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
            {party.isMyParty && (
              <Chip
                size="small"
                icon={<StarIcon sx={{ fontSize: 14 }} />}
                label="파티장"
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.15),
                  color: theme.palette.warning.main,
                  border: '1px solid',
                  borderColor: theme.palette.warning.main,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
            )}
            {!party.isMyParty && party.applicationStatus === 'PENDING' && (
              <Chip
                size="small"
                icon={<HourglassEmptyIcon sx={{ fontSize: 14 }} />}
                label="신청중"
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.15),
                  color: theme.palette.info.main,
                  border: '1px solid',
                  borderColor: theme.palette.info.main,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
            )}
            {!party.isMyParty && party.applicationStatus === 'APPROVED' && party.status !== 'COMPLETED' && (
              <Chip
                size="small"
                icon={<CheckIcon sx={{ fontSize: 14 }} />}
                label="참여중"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.15),
                  color: theme.palette.success.main,
                  border: '1px solid',
                  borderColor: theme.palette.success.main,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
            )}
            {party.transportType && transportConfig[party.transportType] && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  color: theme.palette.text.secondary,
                }}
              >
                {transportConfig[party.transportType].icon}
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                  {transportConfig[party.transportType].label}
                </Typography>
              </Box>
            )}
          </Box>
          <Chip
            size="small"
            label={statusConfig[party.status].label}
            sx={{
              bgcolor: 'transparent',
              color: statusConfig[party.status].color,
              border: '1px solid',
              borderColor: statusConfig[party.status].color,
              flexShrink: 0,
            }}
          />
        </Box>

        {/* Title & Event */}
        <Typography variant="h6" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
          {party.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: party.venueName ? 0.5 : 1 }}>
          {party.eventName}
        </Typography>
        {party.venueName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">
              {party.venueName}
            </Typography>
          </Box>
        )}

        {/* Route & Members */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {party.departure} → {party.arrival}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <GroupIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
            <Typography variant="body2" color={theme.palette.success.main} fontWeight={600}>
              {party.currentMembers}/{party.maxMembers}
            </Typography>
          </Box>
        </Box>

        {/* Applicants Section (for created parties) */}
        {showApplicants && pendingApplicants.length > 0 && (
          <>
            <Divider sx={{ borderColor: theme.palette.divider, my: 1.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              신청자 ({pendingApplicants.length}명)
            </Typography>
            <Stack spacing={1}>
              {pendingApplicants.slice(0, 3).map((applicant) => (
                <Box
                  key={applicant.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    bgcolor: theme.palette.background.default,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.secondary.main }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Typography variant="body2" color="text.primary">
                      {applicant.userName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptApplicant(Number(party.id), Number(applicant.id));
                      }}
                      sx={{
                        color: theme.palette.success.main,
                        '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) },
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectApplicant(Number(party.id), Number(applicant.id));
                      }}
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        )}

        {/* Actions */}
        {actions && (
          <>
            <Divider sx={{ borderColor: theme.palette.divider, my: 1.5 }} />
            <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
              {actions}
            </Stack>
          </>
        )}
      </Box>
    );
  };

  // Get action buttons based on party state
  const getPartyActions = (party: Party): React.ReactNode => {
    // 종료된 파티 - 리뷰 작성
    if (party.status === 'COMPLETED') {
      return (
        <Button
          size="small"
          fullWidth
          startIcon={<StarIcon />}
          onClick={() => {
            // TODO: Open review modal
          }}
          sx={{
            color: theme.palette.warning.main,
            borderColor: theme.palette.warning.main,
            border: '1px solid',
            '&:hover': {
              bgcolor: alpha(theme.palette.warning.main, 0.1),
            },
          }}
        >
          리뷰 작성
        </Button>
      );
    }

    // 내가 만든 파티
    if (party.isMyParty) {
      return (
        <>
          <Button
            size="small"
            startIcon={<PeopleIcon />}
            onClick={(e) => { e.stopPropagation(); setApplicantModalParty(party); }}
            sx={{
              flex: 1,
              color: theme.palette.info.main,
              borderColor: theme.palette.info.main,
              border: '1px solid',
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.1),
              },
            }}
          >
            신청자 관리
          </Button>
          <Button
            size="small"
            startIcon={<ChatIcon />}
            onClick={(e) => { e.stopPropagation(); router.push(`/chats/${party.id}`); }}
            sx={{
              flex: 1,
              color: theme.palette.secondary.main,
              borderColor: theme.palette.secondary.main,
              border: '1px solid',
              '&:hover': {
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
              },
            }}
          >
            채팅
          </Button>
          <Button
            size="small"
            startIcon={<DeleteIcon />}
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm('정말 파티를 삭제하시겠습니까?')) {
                try {
                  await deleteParty(Number(party.id));
                  await getMyCreated();
                } catch {
                  // Error handled by store
                }
              }
            }}
            sx={{
              flex: 1,
              color: theme.palette.error.main,
              borderColor: theme.palette.error.main,
              border: '1px solid',
              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
            }}
          >
            파티 삭제
          </Button>
        </>
      );
    }

    // 신청한 파티 (대기중 - PENDING)
    if (party.applicationStatus === 'PENDING') {
      return (
        <Button
          size="small"
          fullWidth
          onClick={(e) => { e.stopPropagation(); cancelApplication(Number(party.id), party.applicationId || 0); }}
          sx={{
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main,
            border: '1px solid',
            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
          }}
        >
          신청 취소
        </Button>
      );
    }

    // 참여중인 파티 (승인됨 - APPROVED)
    if (party.applicationStatus === 'APPROVED') {
      return (
        <>
          <Button
            size="small"
            startIcon={<ChatIcon />}
            onClick={(e) => { e.stopPropagation(); router.push(`/chats/${party.id}`); }}
            sx={{
              flex: 1,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            채팅하기
          </Button>
          <Button
            size="small"
            startIcon={<ExitToAppIcon />}
            onClick={(e) => { e.stopPropagation(); leaveParty(party.id, user?.id || ''); }}
            sx={{
              flex: 1,
              color: theme.palette.error.main,
              borderColor: theme.palette.error.main,
              border: '1px solid',
              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
            }}
          >
            나가기
          </Button>
        </>
      );
    }

    return null;
  };

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <Box sx={{ p: 3, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Page Header */}
        <PageHeader
          title="내 파티"
          subtitle="내가 만든 파티와 참여 중인 파티를 관리하세요"
          showBack
          action={
            <GradientButton
              size="small"
              startIcon={<AddIcon />}
              onClick={() => router.push('/party/create')}
            >
              파티 만들기
            </GradientButton>
          }
        />

        {/* Filter Tabs */}
        <Section title="필터">
          <Tabs
            value={tabValue}
            onChange={(_e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 1,
                px: 2,
                minWidth: 'auto',
              },
            }}
          >
            <Tab
              label={`내가 만든 (${tabCounts.created})`}
              icon={<StarIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
            <Tab
              label={`신청중 (${tabCounts.pending})`}
              icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
            <Tab
              label={`참여중 (${tabCounts.participating})`}
              icon={<CheckIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
            <Tab
              label={`종료 (${tabCounts.completed})`}
              icon={<HistoryIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Section>

        {/* Party List */}
        <Section title={`파티 목록 (${filteredParties.length})`} noBorder>
          {filteredParties.length === 0 ? (
            tabValue === 0 ? (
              <EmptyState
                icon={<FolderIcon />}
                title="만든 파티가 없습니다"
                description="새 파티를 만들어보세요!"
                actionLabel="파티 만들기"
                onAction={() => router.push('/party/create')}
              />
            ) : allParties.length === 0 ? (
              <EmptyState
                icon={<FolderIcon />}
                title="파티가 없습니다"
                description="파티를 만들거나 참여해보세요!"
                actionLabel="파티 찾기"
                onAction={() => router.push('/party')}
              />
            ) : (
              <EmptyState
                icon={<GroupIcon />}
                title="해당하는 파티가 없습니다"
                description="다른 필터를 선택해보세요"
              />
            )
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {filteredParties.map((party) =>
                renderPartyItem(party, getPartyActions(party), party.isMyParty)
              )}
            </Box>
          )}
        </Section>
      </Box>

      {/* 신청자 관리 모달 */}
      <ApplicantListModal
        open={applicantModalParty !== null}
        onClose={() => setApplicantModalParty(null)}
        partyId={applicantModalParty?.id || ''}
        partyTitle={applicantModalParty?.title || ''}
      />
    </MainLayout>
  );
}
