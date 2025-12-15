'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import ChatIcon from '@mui/icons-material/Chat';
import { MainLayout } from '@/components/layout';
import { usePartyStore } from '@/stores/partyStore';
import { useAuthStore } from '@/stores/authStore';
import { mockParties, mockPartyApplicants, mockEvents, mockChatRooms } from '@/lib/mockData';

export default function PartyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partyId = params.id as string;

  const { parties, setParties } = usePartyStore();
  const { isLoggedIn, user } = useAuthStore();
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (parties.length === 0) {
      setParties(mockParties);
    }
  }, [parties.length, setParties]);

  const party = (parties.length > 0 ? parties : mockParties).find(p => p.id === partyId);
  const event = party ? mockEvents.find(e => e.id === party.eventId) : null;
  const applicants = mockPartyApplicants[partyId] || [];
  // chatRoom available for future use: mockChatRooms.find(r => r.partyId === partyId)
  void mockChatRooms;

  // Check if user is the host
  const isHost = user && party && party.hostId === user.id;

  // Check if user has already applied
  const userApplication = user ? applicants.find(a => a.userId === user.id) : null;

  const statusConfig = {
    recruiting: { label: '모집중', color: 'success' as const },
    confirmed: { label: '확정', color: 'primary' as const },
    closed: { label: '마감', color: 'default' as const },
  };

  const handleApply = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setApplyDialogOpen(true);
  };

  const handleSubmitApplication = () => {
    // In a real app, this would submit to the backend
    setHasApplied(true);
    setApplyDialogOpen(false);
    setApplyMessage('');
  };

  const handleGoToChat = () => {
    router.push(`/chats/${partyId}`);
  };

  if (!party) {
    return (
      <MainLayout hideNavigation>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>파티를 찾을 수 없습니다.</Typography>
          <Button onClick={() => router.back()} sx={{ mt: 2 }}>
            돌아가기
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideNavigation>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
          }}
        >
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">파티 상세</Typography>
        </Box>

        {/* Party Info Card */}
        <Box sx={{ p: 2 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    size="small"
                    icon={party.type === 'departure' ? <DirectionsCarIcon /> : <HomeIcon />}
                    label={party.type === 'departure' ? '출발' : '귀가'}
                    color={party.type === 'departure' ? 'primary' : 'secondary'}
                  />
                  <Chip
                    size="small"
                    label={statusConfig[party.status].label}
                    color={statusConfig[party.status].color}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GroupIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {party.currentMembers}/{party.maxMembers}명
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h3" sx={{ mb: 2 }}>
                {party.title}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2">{party.eventName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PlaceIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {party.departure} → {party.arrival}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {party.departureTime} 출발
                  </Typography>
                </Box>
              </Box>

              {party.description && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {party.description}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Host Info */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h4" sx={{ mb: 2 }}>
                파티장
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {party.hostName?.charAt(0) || 'H'}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {party.hostName || '호스트'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    파티장
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Event Info */}
          {event && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  이벤트 정보
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.date} {event.time && `· ${event.time}`}
                  </Typography>
                  {event.venue && (
                    <Typography variant="body2" color="text.secondary">
                      {event.venue}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Applicants (only for host) */}
          {isHost && applicants.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  신청 목록 ({applicants.length})
                </Typography>
                <List disablePadding>
                  {applicants.map((applicant, index) => (
                    <ListItem
                      key={applicant.id}
                      sx={{
                        px: 0,
                        borderBottom: index < applicants.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          {applicant.userName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={applicant.userName}
                        secondary={applicant.message}
                      />
                      <Chip
                        size="small"
                        label={
                          applicant.status === 'pending' ? '대기' :
                          applicant.status === 'accepted' ? '승인' : '거절'
                        }
                        color={
                          applicant.status === 'pending' ? 'warning' :
                          applicant.status === 'accepted' ? 'success' : 'error'
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Bottom Action Button */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {isHost || (userApplication?.status === 'accepted') ? (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<ChatIcon />}
              onClick={handleGoToChat}
              sx={{ borderRadius: 2 }}
            >
              채팅방 입장
            </Button>
          ) : hasApplied || userApplication ? (
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="large"
              disabled
              sx={{ borderRadius: 2 }}
            >
              {userApplication?.status === 'pending' ? '승인 대기중' :
               userApplication?.status === 'rejected' ? '신청이 거절되었습니다' : '신청 완료'}
            </Button>
          ) : party.status === 'closed' || party.currentMembers >= party.maxMembers ? (
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="large"
              disabled
              sx={{ borderRadius: 2 }}
            >
              모집이 마감되었습니다
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleApply}
              sx={{ borderRadius: 2 }}
            >
              참여 신청하기
            </Button>
          )}
        </Box>

        {/* Apply Dialog */}
        <Dialog
          open={applyDialogOpen}
          onClose={() => setApplyDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>파티 참여 신청</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              파티장에게 전달할 메시지를 입력해주세요.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="예: 안녕하세요! 같이 가고 싶습니다~"
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplyDialogOpen(false)}>취소</Button>
            <Button variant="contained" onClick={handleSubmitApplication}>
              신청하기
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
