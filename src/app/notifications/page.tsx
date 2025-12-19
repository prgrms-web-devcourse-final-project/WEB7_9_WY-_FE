'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/common';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useNotificationStore } from '@/stores/notificationStore';
import type { NotificationType } from '@/types';

// 알림 타입을 UI 탭 카테고리로 매핑
const getTabCategory = (type: NotificationType): 'event' | 'party' | 'chat' | 'system' => {
  switch (type) {
    case 'schedule':
    case 'booking_confirmed':
      return 'event';
    case 'party_request':
    case 'party_accepted':
    case 'party_rejected':
    case 'party_kicked':
      return 'party';
    case 'chat_message':
      return 'chat';
    case 'info':
    case 'success':
    case 'warning':
    case 'error':
    default:
      return 'system';
  }
};

// 알림 타입별 아이콘
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'schedule':
      return <EventIcon />;
    case 'party_request':
    case 'party_accepted':
    case 'party_rejected':
    case 'party_kicked':
      return <GroupIcon />;
    case 'chat_message':
      return <ChatIcon />;
    case 'booking_confirmed':
      return <ConfirmationNumberIcon />;
    case 'info':
      return <InfoIcon />;
    case 'success':
      return <CheckCircleIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'error':
      return <ErrorIcon />;
    default:
      return <NotificationsIcon />;
  }
};

// 알림 타입별 색상
const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'schedule':
    case 'booking_confirmed':
      return 'primary.main';
    case 'party_request':
    case 'party_accepted':
    case 'party_rejected':
    case 'party_kicked':
      return 'secondary.main';
    case 'chat_message':
      return 'info.main';
    case 'success':
      return 'success.main';
    case 'warning':
      return 'warning.main';
    case 'error':
      return 'error.main';
    case 'info':
    default:
      return 'grey.500';
  }
};

// 시간 포맷팅 함수
const formatTime = (notification: { time?: string; createdAt?: string }): string => {
  const timeStr = notification.time || notification.createdAt;
  if (!timeStr) return '';

  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  } catch {
    return timeStr;
  }
};

export default function NotificationsPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);

  // Zustand 스토어에서 알림 상태와 액션 가져오기
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 탭별 필터링된 알림 목록
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const category = getTabCategory(notification.type);
      if (tabValue === 0) return true;
      if (tabValue === 1) return category === 'event';
      if (tabValue === 2) return category === 'party';
      if (tabValue === 3) return category === 'chat';
      return true;
    });
  }, [notifications, tabValue]);

  // 알림 클릭 핸들러 - 읽음 처리 및 네비게이션
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // 읽음 처리
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // 관련 페이지로 이동
    if (notification.partyId) {
      router.push(`/party/${notification.partyId}`);
    } else if (notification.eventId) {
      router.push(`/event/${notification.eventId}`);
    } else if (notification.chatRoomId) {
      router.push(`/chats/${notification.chatRoomId}`);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    removeNotification(id);
  };

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <MainLayout hideNavigation>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h2">알림</Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.25,
                  bgcolor: 'error.main',
                  color: 'white',
                  borderRadius: 10,
                }}
              >
                {unreadCount}
              </Typography>
            )}
          </Box>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              모두 읽음
            </Button>
          )}
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label="전체" />
          <Tab label="이벤트" />
          <Tab label="파티" />
          <Tab label="채팅" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {filteredNotifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
              }}
            >
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h4" color="text.secondary" gutterBottom>
                알림이 없습니다
              </Typography>
              <Typography variant="body2" color="text.disabled">
                새로운 알림이 오면 여기에 표시됩니다
              </Typography>
            </Box>
          ) : (
            <Card>
              <List disablePadding>
                {filteredNotifications.map((notification, index) => (
                  <ListItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderBottom: index < filteredNotifications.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getNotificationColor(notification.type) }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body1"
                            fontWeight={notification.read ? 400 : 600}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatTime(notification)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
}
