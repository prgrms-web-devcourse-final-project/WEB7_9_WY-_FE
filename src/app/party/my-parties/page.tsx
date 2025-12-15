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
  Tabs,
  Tab,
  Button,
  Avatar,
  Badge,
  Divider,
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
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { MainLayout } from '@/components/layout';
import { EmptyState, GradientButton } from '@/components/common';
import { usePartyStore } from '@/stores/partyStore';
import { useAuthStore } from '@/stores/authStore';
import { mockParties } from '@/lib/mockData';
import type { Party } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ pt: 2, display: value === index ? 'block' : 'none' }}
    >
      {children}
    </Box>
  );
}

export default function MyPartiesPage() {
  const theme = useTheme();
  const router = useRouter();
  const {
    parties,
    setParties,
    getApplicants,
    acceptApplicant,
    rejectApplicant,
    cancelApplication,
  } = usePartyStore();
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);

  const userId = user?.id || 'user-1';

  useEffect(() => {
    if (parties.length === 0) {
      setParties(mockParties);
    }
  }, [parties.length, setParties]);

  // Local filtering functions (to be replaced with API calls later)
  const myCreatedParties = parties.filter((p) => p.hostId === userId);
  const myAppliedParties = parties.filter(
    (p) => p.hostId !== userId && p.status === 'recruiting'
  );
  const myJoinedParties = parties.filter(
    (p) => p.hostId !== userId && p.status === 'confirmed'
  );
  const myCompletedParties = parties.filter((p) => p.status === 'closed');

  // Local state management functions
  const updatePartyStatus = (partyId: string, status: 'recruiting' | 'confirmed' | 'closed') => {
    const updatedParties = parties.map((p) =>
      p.id === partyId ? { ...p, status } : p
    );
    setParties(updatedParties);
  };

  const leaveParty = (partyId: string, _userId: string) => {
    // In production, this would be an API call
    console.log(`User ${_userId} left party ${partyId}`);
  };

  const statusConfig = {
    recruiting: {
      label: '모집중',
      color: theme.palette.success.main,
    },
    confirmed: {
      label: '확정',
      color: theme.palette.secondary.main,
    },
    closed: {
      label: '종료',
      color: theme.palette.text.disabled,
    },
  };

  const renderPartyCard = (party: Party, actions?: React.ReactNode, showApplicants?: boolean) => {
    const partyApplicants = showApplicants ? getApplicants(party.id) : [];
    const pendingApplicants = partyApplicants.filter((a) => a.status === 'pending');

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Chip
              size="small"
              icon={party.type === 'departure' ? <DirectionsCarIcon /> : <HomeIcon />}
              label={party.type === 'departure' ? '출발' : '귀가'}
              sx={{
                bgcolor: alpha(
                  party.type === 'departure' ? theme.palette.primary.main : theme.palette.secondary.main,
                  0.15
                ),
                color: party.type === 'departure' ? theme.palette.primary.main : theme.palette.secondary.main,
                border: '1px solid',
                borderColor: party.type === 'departure' ? theme.palette.primary.main : theme.palette.secondary.main,
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {party.eventName}
          </Typography>

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

  // Tab 0: 내가 만든 파티
  const renderCreatedParties = () => (
    <Stack spacing={2}>
      {myCreatedParties.length === 0 ? (
        <EmptyState
          icon={<AddIcon sx={{ fontSize: 48 }} />}
          title="만든 파티가 없습니다"
          description="새로운 파티를 만들어보세요!"
          actionLabel="파티 만들기"
          onAction={() => router.push('/party/create')}
        />
      ) : (
        myCreatedParties.map((party) =>
          renderPartyCard(
            party,
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
              {party.status === 'recruiting' && (
                <Button
                  size="small"
                  onClick={() => updatePartyStatus(party.id, 'confirmed')}
                  sx={{
                    flex: 1,
                    bgcolor: theme.palette.success.main,
                    color: theme.palette.background.default,
                    '&:hover': {
                      bgcolor: theme.palette.success.dark,
                    },
                  }}
                >
                  모집 확정
                </Button>
              )}
              {party.status === 'confirmed' && (
                <Button
                  size="small"
                  onClick={() => updatePartyStatus(party.id, 'closed')}
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
            </>,
            true
          )
        )
      )}
    </Stack>
  );

  // Tab 1: 신청한 파티
  const renderAppliedParties = () => (
    <Stack spacing={2}>
      {myAppliedParties.length === 0 ? (
        <EmptyState
          icon={<HourglassEmptyIcon sx={{ fontSize: 48 }} />}
          title="신청한 파티가 없습니다"
          description="마음에 드는 파티에 신청해보세요!"
          actionLabel="파티 찾기"
          onAction={() => router.push('/party')}
        />
      ) : (
        myAppliedParties.map((party) =>
          renderPartyCard(
            party,
            <Button
              size="small"
              fullWidth
              onClick={() => cancelApplication(Number(party.id), 0 /* TODO: Get actual applicationId */)}
              sx={{
                color: theme.palette.error.main,
                borderColor: theme.palette.error.main,
                border: '1px solid',
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
              }}
            >
              신청 취소
            </Button>
          )
        )
      )}
    </Stack>
  );

  // Tab 2: 참여중인 파티
  const renderJoinedParties = () => (
    <Stack spacing={2}>
      {myJoinedParties.length === 0 ? (
        <EmptyState
          icon={<GroupIcon sx={{ fontSize: 48 }} />}
          title="참여중인 파티가 없습니다"
          description="파티에 참여해 함께 이동해요!"
          actionLabel="파티 찾기"
          onAction={() => router.push('/party')}
        />
      ) : (
        myJoinedParties.map((party) =>
          renderPartyCard(
            party,
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
              {party.hostId !== userId && (
                <Button
                  size="small"
                  startIcon={<ExitToAppIcon />}
                  onClick={() => leaveParty(party.id, userId)}
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
              )}
            </>
          )
        )
      )}
    </Stack>
  );

  // Tab 3: 종료된 파티
  const renderCompletedParties = () => (
    <Stack spacing={2}>
      {myCompletedParties.length === 0 ? (
        <EmptyState
          icon={<StarIcon sx={{ fontSize: 48 }} />}
          title="종료된 파티가 없습니다"
          description="아직 완료된 파티가 없어요"
        />
      ) : (
        myCompletedParties.map((party) =>
          renderPartyCard(
            party,
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
          )
        )
      )}
    </Stack>
  );

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

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            '& .MuiTabs-indicator': {
              bgcolor: theme.palette.primary.main,
            },
            '& .MuiTab-root': {
              color: theme.palette.text.secondary,
              fontWeight: 500,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <Tab
            label={
              <Badge
                badgeContent={myCreatedParties.length}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                  },
                }}
              >
                <Box sx={{ pr: 2 }}>내가 만든</Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge
                badgeContent={myAppliedParties.length}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText,
                  },
                }}
              >
                <Box sx={{ pr: 2 }}>신청한</Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge
                badgeContent={myJoinedParties.length}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: theme.palette.success.main,
                    color: theme.palette.background.default,
                  },
                }}
              >
                <Box sx={{ pr: 2 }}>참여중</Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge
                badgeContent={myCompletedParties.length}
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: theme.palette.text.disabled,
                    color: theme.palette.background.default,
                  },
                }}
              >
                <Box sx={{ pr: 2 }}>종료</Box>
              </Badge>
            }
          />
        </Tabs>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {renderCreatedParties()}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderAppliedParties()}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {renderJoinedParties()}
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          {renderCompletedParties()}
        </TabPanel>
      </Box>
    </MainLayout>
  );
}
