'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Divider,
} from '@mui/material';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import GroupIcon from '@mui/icons-material/Group';
import { MainLayout } from '@/components/layout';
import { EmptyState } from '@/components/common';
import { useChatStore } from '@/stores/chatStore';
import { mockChatRooms } from '@/lib/mockData';

export default function ChatsPage() {
  const router = useRouter();
  const { chatRooms, setChatRooms } = useChatStore();

  useEffect(() => {
    if (chatRooms.length === 0) {
      setChatRooms(mockChatRooms);
    }
  }, [chatRooms.length, setChatRooms]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, pb: 0 }}>
        <Typography variant="h2" sx={{ mb: 3 }}>
          채팅
        </Typography>
      </Box>

      {chatRooms.length === 0 ? (
        <EmptyState
          icon={<ChatBubbleIcon />}
          title="채팅방이 없습니다"
          description="파티에 참여하면 채팅방이 생성됩니다"
          actionLabel="파티 찾기"
          onAction={() => router.push('/party')}
        />
      ) : (
        <List sx={{ py: 0 }}>
          {chatRooms.map((room, index) => (
            <Box key={room.id}>
              <ListItem
                component="div"
                onClick={() => router.push(`/chats/${room.id}`)}
                sx={{
                  cursor: 'pointer',
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(4px)',
                  },
                  '&:active': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={room.unreadCount}
                    color="secondary"
                    overlap="circular"
                  >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <GroupIcon />
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography component="span" variant="body1" fontWeight={room.unreadCount ? 700 : 400}>
                        {room.title}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {room.lastMessageTime && formatTime(room.lastMessageTime)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography
                        component="span"
                        variant="body2"
                        color={room.unreadCount ? 'text.primary' : 'text.secondary'}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '70%',
                          fontWeight: room.unreadCount ? 500 : 400,
                        }}
                      >
                        {room.lastMessage || '새로운 채팅방입니다'}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.disabled">
                        {room.participants.length}명
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < chatRooms.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      )}
    </MainLayout>
  );
}
