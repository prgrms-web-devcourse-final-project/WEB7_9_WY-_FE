'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
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
import { LoadingSpinner, PageHeader, Section, EmptyState } from '@/components/common';
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
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

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

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

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
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Page Header */}
        <PageHeader
          title="알림"
          subtitle="새로운 소식을 확인하세요"
          action={
            unreadCount > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={markAllAsRead}
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                모두 읽음
              </Button>
            )
          }
        />

        {/* Filter Tabs */}
        <Section title="필터">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 1,
              },
            }}
          >
            <Tab label="전체" />
            <Tab label="이벤트" icon={<EventIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
            <Tab label="파티" icon={<GroupIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
            <Tab label="채팅" icon={<ChatIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          </Tabs>
        </Section>

        {/* Notifications List */}
        <Section title={`알림 (${filteredNotifications.length})`} noBorder>
          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon={<NotificationsIcon />}
              title="알림이 없습니다"
              description="새로운 알림이 오면 여기에 표시됩니다"
            />
          ) : (
            <Box
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper,
                overflow: 'hidden',
              }}
            >
              {filteredNotifications.map((notification, index) => (
                <Box
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                    borderBottom: index < filteredNotifications.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {/* Avatar */}
                  <Avatar sx={{ bgcolor: getNotificationColor(notification.type), width: 44, height: 44 }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="body1"
                        fontWeight={notification.read ? 400 : 600}
                        noWrap
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: theme.palette.primary.main,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatTime(notification)}
                    </Typography>
                  </Box>

                  {/* Delete Button */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                    sx={{
                      color: 'text.disabled',
                      '&:hover': {
                        color: theme.palette.error.main,
                        bgcolor: alpha(theme.palette.error.main, 0.08),
                      },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Section>
      </Box>
    </MainLayout>
  );
}
