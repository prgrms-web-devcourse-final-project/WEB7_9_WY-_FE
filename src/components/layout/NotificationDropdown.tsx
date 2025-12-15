'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Popover,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import { useTheme, alpha, Theme } from '@mui/material/styles';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Notification, NotificationType } from '@/types';

interface NotificationDropdownProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'schedule':
      return <CalendarMonthIcon fontSize="small" />;
    case 'party_request':
    case 'party_accepted':
    case 'party_rejected':
    case 'party_kicked':
      return <GroupsIcon fontSize="small" />;
    case 'chat_message':
      return <ChatBubbleOutlineIcon fontSize="small" />;
    case 'booking_confirmed':
      return <ConfirmationNumberIcon fontSize="small" />;
    case 'success':
      return <CheckCircleOutlineIcon fontSize="small" />;
    case 'warning':
      return <WarningAmberIcon fontSize="small" />;
    case 'info':
    default:
      return <InfoOutlinedIcon fontSize="small" />;
  }
};

const getNotificationColor = (type: NotificationType, theme: Theme) => {
  switch (type) {
    case 'schedule':
      return theme.palette.primary.main;
    case 'party_request':
    case 'party_accepted':
      return theme.palette.secondary.main;
    case 'party_rejected':
    case 'party_kicked':
    case 'warning':
      return theme.palette.warning.main;
    case 'chat_message':
      return theme.palette.info.main;
    case 'booking_confirmed':
    case 'success':
      return theme.palette.success.main;
    case 'info':
    default:
      return theme.palette.text.secondary;
  }
};

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const router = useRouter();
  const theme = useTheme();
  const { markAsRead, removeNotification } = useNotificationStore();
  const iconColor = getNotificationColor(notification.type, theme);

  const handleClick = () => {
    markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.partyId) {
      router.push(`/party/${notification.partyId}`);
    } else if (notification.eventId) {
      router.push(`/event/${notification.eventId}`);
    } else if (notification.chatRoomId) {
      router.push(`/chats/${notification.chatRoomId}`);
    }

    onClose();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  const formatTime = (time?: string, createdAt?: string) => {
    if (time) return time;
    if (createdAt) {
      const date = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays < 7) return `${diffDays}일 전`;
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
    return '';
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        cursor: 'pointer',
        bgcolor: notification.read
          ? 'transparent'
          : alpha(theme.palette.primary.main, 0.04),
        borderLeft: notification.read ? 'none' : `3px solid ${theme.palette.primary.main}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(iconColor, 0.12),
          color: iconColor,
          flexShrink: 0,
        }}
      >
        {getNotificationIcon(notification.type)}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={notification.read ? 400 : 600}
          color="text.primary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {notification.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {notification.message}
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 0.5, display: 'block' }}
        >
          {formatTime(notification.time, notification.createdAt)}
        </Typography>
      </Box>

      {/* Remove button */}
      <IconButton
        size="small"
        onClick={handleRemove}
        sx={{
          opacity: 0.5,
          '&:hover': {
            opacity: 1,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.main,
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default function NotificationDropdown({
  anchorEl,
  onClose,
}: NotificationDropdownProps) {
  const theme = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            width: 360,
            maxHeight: 480,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8],
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            알림
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                px: 1,
                py: 0.25,
                borderRadius: 10,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            sx={{
              fontSize: '0.75rem',
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            모두 읽음
          </Button>
        )}
      </Box>

      {/* Notification List */}
      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: theme.palette.divider,
            borderRadius: 3,
          },
        }}
      >
        {notifications.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              color: theme.palette.text.secondary,
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">알림이 없습니다</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {notifications.slice(0, 10).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer - View all */}
      {notifications.length > 0 && (
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            p: 1.5,
            textAlign: 'center',
          }}
        >
          <Button
            size="small"
            onClick={() => {
              onClose();
              // Navigate to full notifications page if needed
            }}
            sx={{
              fontSize: '0.8125rem',
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
                bgcolor: 'transparent',
              },
            }}
          >
            모든 알림 보기
          </Button>
        </Box>
      )}
    </Popover>
  );
}
