'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import { MainLayout } from '@/components/layout';
import { EmptyState, GradientButton, LoadingSpinner } from '@/components/common';
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


interface FilterState {
  applied: boolean;   // 신청한 (PENDING)
  joined: boolean;    // 참여중 (APPROVED)
  completed: boolean; // 종료 (COMPLETED)
}

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
    isLoading,
  } = usePartyStore();
  const { user, isLoggedIn } = useAuthStore();
  const [filters, setFilters] = useState<FilterState>({
    applied: false,
    joined: false,
    completed: false,
  });

  // Fetch both APIs on mount
  useEffect(() => {
    if (!isAllowed || !isLoggedIn) return;
    getMyCreated();
    getMyApplications();
  }, [isAllowed, isLoggedIn]);

  // Toggle filter function
  const toggleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Combine all parties
  const allParties = [...myCreatedParties, ...myApplicationParties];

  // Apply filters
  const filteredParties = allParties.filter((party) => {
    // No filter selected → show all parties
    if (!filters.applied && !filters.joined && !filters.completed) {
      return true;
    }

    // Show parties matching selected filters
    // 신청한: 대기중인 신청 (PENDING)
    if (filters.applied && !party.isMyParty && party.applicationStatus === 'PENDING') {
      return true;
    }
    // 참여중: 종료되지 않은 활성 파티 (내가 만든 파티 OR 승인된 파티)
    if (filters.joined && party.status !== 'COMPLETED') {
      const isMyActiveParty = party.isMyParty;
      const isApprovedParty = !party.isMyParty && party.applicationStatus === 'APPROVED';
      if (isMyActiveParty || isApprovedParty) {
        return true;
      }
    }
    // 종료: 완료된 파티
    if (filters.completed && party.status === 'COMPLETED') {
      return true;
    }

    return false;
  });

  // Local state management functions - TODO: Replace with actual API calls
  const updatePartyStatus = (partyId: string, status: 'RECRUITING' | 'CLOSED' | 'COMPLETED' | 'CANCELLED') => {
    // TODO: Implement with partyStore.updateParty API call
    console.log(`Update party ${partyId} to status ${status} - not yet implemented`);
  };

  const leaveParty = (partyId: string, _userId: string) => {
    // TODO: Implement with leave party API call
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

  const renderPartyCard = (party: Party, actions?: React.ReactNode, showApplicants?: boolean) => {
    const partyApplicants = showApplicants ? getApplicants(party.id) : [];
    const pendingApplicants = partyApplicants.filter((a) => a.status === 'PENDING');

    return (
      <Card
        key={party.id}
        sx={{
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.25)}`,
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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
              {/* 파티장 뱃지 */}
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
              {/* Transport Type */}
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
              }}
            />
          </Box>

          {/* Title & Event */}
          <Typography variant="h4" color="text.primary" sx={{ mb: 0.5 }}>
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
                        onClick={() => acceptApplicant(Number(party.id), Number(applicant.id))}
                        sx={{
                          color: theme.palette.success.main,
                          '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) },
                        }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => rejectApplicant(Number(party.id), Number(applicant.id))}
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
              <Stack direction="row" spacing={1}>
                {actions}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
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
            startIcon={<ChatIcon />}
            onClick={() => router.push(`/chats/${party.id}`)}
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
          {party.status === 'RECRUITING' && (
            <Button
              size="small"
              onClick={() => updatePartyStatus(party.id, 'CLOSED')}
              sx={{
                flex: 1,
                bgcolor: theme.palette.success.main,
                color: theme.palette.background.default,
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                },
              }}
            >
              모집 마감
            </Button>
          )}
          {party.status === 'CLOSED' && (
            <Button
              size="small"
              onClick={() => updatePartyStatus(party.id, 'COMPLETED')}
              sx={{
                flex: 1,
                color: theme.palette.text.disabled,
                borderColor: theme.palette.divider,
                border: '1px solid',
                '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.05) },
              }}
            >
              파티 종료
            </Button>
          )}
        </>
      );
    }

    // 신청한 파티 (대기중 - PENDING)
    if (party.applicationStatus === 'PENDING') {
      return (
        <Button
          size="small"
          fullWidth
          onClick={() => cancelApplication(Number(party.id), party.applicationId || 0)}
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
            onClick={() => router.push(`/chats/${party.id}`)}
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
            onClick={() => leaveParty(party.id, user?.id || '')}
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
      <MainLayout hideNavigation>
        <Box sx={{ p: 3, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideNavigation>
      <Box sx={{ p: 2, bgcolor: theme.palette.background.default, minHeight: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => router.back()}
              sx={{
                mr: 1,
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h2" color="text.primary">
              내 파티
            </Typography>
          </Box>
          <GradientButton size="small" startIcon={<AddIcon />} onClick={() => router.push('/party/create')}>
            파티 만들기
          </GradientButton>
        </Box>

        {/* Checkbox Filters */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
            '& .MuiFormControlLabel-root': {
              mr: 0,
            },
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.applied}
                onChange={() => toggleFilter('applied')}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={<Typography variant="body2" color="text.secondary">신청한</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.joined}
                onChange={() => toggleFilter('joined')}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={<Typography variant="body2" color="text.secondary">참여중</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.completed}
                onChange={() => toggleFilter('completed')}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={<Typography variant="body2" color="text.secondary">종료</Typography>}
          />
        </Box>

        {/* Party List */}
        <Stack spacing={2}>
          {filteredParties.length === 0 ? (
            allParties.length === 0 ? (
              <EmptyState
                icon={<AddIcon sx={{ fontSize: 48 }} />}
                title="파티가 없습니다"
                description="새로운 파티를 만들거나 참여해보세요!"
                actionLabel="파티 만들기"
                onAction={() => router.push('/party/create')}
              />
            ) : (
              <EmptyState
                icon={<GroupIcon sx={{ fontSize: 48 }} />}
                title="해당하는 파티가 없습니다"
                description="다른 필터를 선택해보세요"
              />
            )
          ) : (
            filteredParties.map((party) =>
              renderPartyCard(party, getPartyActions(party), party.isMyParty)
            )
          )}
        </Stack>
      </Box>
    </MainLayout>
  );
}
