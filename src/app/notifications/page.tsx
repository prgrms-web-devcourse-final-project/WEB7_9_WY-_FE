'use client';

import { useState } from 'react';
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
import CampaignIcon from '@mui/icons-material/Campaign';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { MainLayout } from '@/components/layout';

interface Notification {
  id: string;
  type: 'event' | 'party' | 'chat' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'BTS 콘서트 D-5',
    message: 'BTS WORLD TOUR 2025가 5일 앞으로 다가왔습니다!',
    time: '방금 전',
    read: false,
  },
  {
    id: '2',
    type: 'party',
    title: '파티 참여 승인',
    message: '"BTS 콘서트 같이 가실 분!" 파티에 참여가 승인되었습니다.',
    time: '1시간 전',
    read: false,
  },
  {
    id: '3',
    type: 'chat',
    title: '새 메시지',
    message: '아미팬님이 채팅방에 새 메시지를 보냈습니다.',
    time: '2시간 전',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: '앱 업데이트',
    message: '새로운 기능이 추가되었습니다. 지금 확인해보세요!',
    time: '1일 전',
    read: true,
  },
  {
    id: '5',
    type: 'event',
    title: 'NewJeans 음악방송 D-10',
    message: 'NewJeans 음악방송 출연이 10일 앞으로 다가왔습니다!',
    time: '2일 전',
    read: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return notification.type === 'event';
    if (tabValue === 2) return notification.type === 'party';
    if (tabValue === 3) return notification.type === 'chat';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return <EventIcon />;
      case 'party':
        return <GroupIcon />;
      case 'chat':
        return <ChatIcon />;
      case 'system':
        return <CampaignIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'event':
        return 'primary.main';
      case 'party':
        return 'secondary.main';
      case 'chat':
        return 'info.main';
      case 'system':
        return 'warning.main';
      default:
        return 'grey.500';
    }
  };

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
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderBottom: index < filteredNotifications.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => deleteNotification(notification.id)}
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
                            {notification.time}
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
