'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Avatar,
  Badge,
  CircularProgress,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import GroupIcon from '@mui/icons-material/Group';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { MainLayout } from '@/components/layout';
import { EmptyState, LoadingSpinner, PageHeader, Section } from '@/components/common';
import { useChatStore } from '@/stores/chatStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useChatRooms } from '@/hooks/useChat';

export default function ChatsPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const theme = useTheme();
  const { setChatRooms } = useChatStore();

  // API에서 채팅방 목록 조회
  const { data: chatRooms = [], isLoading: isLoadingRooms, error } = useChatRooms();

  // 스토어 동기화
  useEffect(() => {
    if (chatRooms.length > 0) {
      setChatRooms(chatRooms);
    }
  }, [chatRooms, setChatRooms]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
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
          title="채팅"
          subtitle="파티 멤버들과 대화하세요"
        />

        {/* Chat Rooms Section */}
        <Section title={`대화 (${chatRooms.length})`} noBorder>
          {isLoadingRooms ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 8,
              }}
            >
              <CircularProgress size={32} />
            </Box>
          ) : error ? (
            <EmptyState
              icon={<ChatBubbleIcon />}
              title="채팅방을 불러올 수 없습니다"
              description="잠시 후 다시 시도해주세요"
              actionLabel="다시 시도"
              onAction={() => window.location.reload()}
            />
          ) : chatRooms.length === 0 ? (
            <EmptyState
              icon={<ChatBubbleIcon />}
              title="채팅방이 없습니다"
              description="파티에 참여하면 채팅방이 생성됩니다"
              actionLabel="파티 찾기"
              onAction={() => router.push('/party')}
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
              {chatRooms.map((room, index) => (
                <Box
                  key={room.id}
                  onClick={() => router.push(`/chats/${room.partyId}`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    cursor: 'pointer',
                    borderBottom: index < chatRooms.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  {/* Avatar with Badge */}
                  <Badge
                    badgeContent={room.unreadCount}
                    color="secondary"
                    overlap="circular"
                  >
                    <Avatar
                      sx={{
                        bgcolor: room.unreadCount ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.6),
                        width: 48,
                        height: 48,
                      }}
                    >
                      <GroupIcon />
                    </Avatar>
                  </Badge>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography
                        variant="body1"
                        fontWeight={room.unreadCount ? 600 : 400}
                        noWrap
                        sx={{ flex: 1, mr: 1 }}
                      >
                        {room.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {formatTime(room.lastMessageTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        color={room.unreadCount ? 'text.primary' : 'text.secondary'}
                        fontWeight={room.unreadCount ? 500 : 400}
                        noWrap
                        sx={{ flex: 1, mr: 1 }}
                      >
                        {room.lastMessage || '새로운 채팅방입니다'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                        {room.participants?.length || 0}명
                      </Typography>
                    </Box>
                  </Box>

                  {/* Chevron */}
                  <ChevronRightIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
                </Box>
              ))}
            </Box>
          )}
        </Section>
      </Box>
    </MainLayout>
  );
}
