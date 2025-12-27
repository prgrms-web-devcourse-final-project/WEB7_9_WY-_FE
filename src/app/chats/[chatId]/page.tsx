'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
  keyframes,
  CircularProgress,
  Alert,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import GroupIcon from '@mui/icons-material/Group';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { LoadingSpinner } from '@/components/common';
import { useChatMessages, useChatParticipants, useChatRoomInfo } from '@/hooks/useChat';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { ChatConnectionStatus } from '@/components/chat';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export default function ChatRoomPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const chatId = params.chatId as string;
  const partyIdNum = parseInt(chatId, 10);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const {
    messages: storeMessages,
    setCurrentRoom,
    addChatRoom,
    getRoomByPartyId,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // API hooks
  const { data: roomInfo, isLoading: isLoadingRoom, error: roomError, isError: isRoomError } = useChatRoomInfo(partyIdNum);
  const {
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(partyIdNum);
  const { data: participants = [] } = useChatParticipants(partyIdNum);

  // 채팅방 에러 처리 (404 등)
  const isChatRoomNotFound = isRoomError && roomError instanceof Error && roomError.message === 'CHAT_ROOM_NOT_FOUND';

  // WebSocket hook
  const {
    connectionState,
    isConnected,
    sendMessage: wsSendMessage,
    leaveRoom: wsLeaveRoom,
    kickMember: wsKickMember,
  } = useChatWebSocket({
    partyId: partyIdNum,
    autoJoin: true,
  });

  // 현재 채팅방 메시지 (스토어에서 가져옴)
  const roomMessages = storeMessages[chatId] || [];

  // 채팅방 설정
  useEffect(() => {
    if (!isAllowed || !chatId) return;

    const existingRoom = getRoomByPartyId(chatId);
    if (!existingRoom && roomInfo) {
      const newRoom = {
        id: chatId,
        partyId: chatId,
        title: roomInfo.partyName || '파티 채팅방',
        participants: [],
        isOwner: false,
        unreadCount: 0,
      };
      addChatRoom(newRoom);
    }
    setCurrentRoom(chatId);
  }, [chatId, isAllowed, roomInfo, getRoomByPartyId, addChatRoom, setCurrentRoom]);

  // 스크롤 to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length]);

  // 무한 스크롤 핸들러
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // 상단에 도달하면 이전 메시지 로드
    if (container.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSend = () => {
    if (!inputMessage.trim() || !isConnected) return;
    wsSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLeaveRoom = () => {
    wsLeaveRoom();
    router.push('/chats');
  };

  const handleKickMember = (memberId: string) => {
    wsKickMember(parseInt(memberId, 10));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  // 현재 유저가 파티장인지 확인
  const isLeader = participants.some(
    (p) => p.id === user?.id && p.role === 'LEADER'
  );

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  if (isLoadingRoom) {
    return <LoadingSpinner fullScreen message="채팅방 로딩 중..." />;
  }

  // 채팅방을 찾을 수 없는 경우 에러 UI 표시
  if (isChatRoomNotFound || isRoomError) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          gap: 3,
          p: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', opacity: 0.8 }} />
        <Typography variant="h5" fontWeight={600} textAlign="center">
          {isChatRoomNotFound ? '채팅방을 찾을 수 없습니다' : '채팅방 로딩 실패'}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {isChatRoomNotFound
            ? '삭제되었거나 존재하지 않는 채팅방입니다.'
            : '채팅방 정보를 불러오는 중 오류가 발생했습니다.'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/chats')}
          sx={{ mt: 2 }}
        >
          채팅 목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  const roomTitle = roomInfo?.partyName || '파티 채팅방';

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header with glassmorphism */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: 1,
          borderColor: alpha(theme.palette.divider, 0.3),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => router.back()}
            sx={{
              mr: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                transform: 'translateX(-2px)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={600}>{roomTitle}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatConnectionStatus state={connectionState} showLabel={false} />
              <Typography variant="caption" color="text.secondary">
                {participants.length}명 참여 중
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              transform: 'rotate(90deg)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Messages with gradient background */}
      <Box
        ref={messagesContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 1)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
        }}
      >
        {/* Load more indicator */}
        {isFetchingNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Loading state */}
        {isLoadingMessages && roomMessages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        ) : roomMessages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <GroupIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography variant="body2">아직 메시지가 없습니다</Typography>
            <Typography variant="caption" color="text.disabled">
              첫 메시지를 보내보세요!
            </Typography>
          </Box>
        ) : (
          roomMessages.map((message, index) => {
            const isOwn = user ? message.senderId === user.id : message.isOwn;
            const isSystem = message.isSystem;

            if (isSystem) {
              return (
                <Box
                  key={message.id}
                  sx={{
                    textAlign: 'center',
                    my: 2,
                    animation: `${fadeInUp} 0.3s ease-out`,
                    animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
                    animationFillMode: 'both',
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 10,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {message.content}
                    </Typography>
                  </Box>
                </Box>
              );
            }

            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: isOwn ? 'row-reverse' : 'row',
                  gap: 1,
                  alignItems: 'flex-end',
                  animation: isOwn ? `${slideInRight} 0.3s ease-out` : `${slideIn} 0.3s ease-out`,
                  animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
                  animationFillMode: 'both',
                }}
              >
                {!isOwn && (
                  <Avatar
                    src={message.senderAvatar}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: 'primary.main',
                      fontSize: 14,
                      fontWeight: 600,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    {message.senderName?.charAt(0) || '?'}
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!isOwn && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        mb: 0.5,
                        ml: 1,
                        fontWeight: 500,
                      }}
                    >
                      {message.senderName}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      position: 'relative',
                      bgcolor: isOwn
                        ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                        : alpha(theme.palette.background.paper, 0.9),
                      background: isOwn
                        ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                        : alpha(theme.palette.background.paper, 0.9),
                      color: isOwn ? 'white' : 'text.primary',
                      px: 2,
                      py: 1.5,
                      borderRadius: 2.5,
                      borderTopRightRadius: isOwn ? 4 : 20,
                      borderTopLeftRadius: isOwn ? 20 : 4,
                      boxShadow: isOwn
                        ? `0 4px 16px ${alpha(theme.palette.secondary.main, 0.3)}`
                        : `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                      backdropFilter: !isOwn ? 'blur(10px)' : 'none',
                      border: !isOwn ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.disabled',
                      mt: 0.5,
                      mx: 1,
                      fontSize: 10,
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Enhanced Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          borderTop: 1,
          borderColor: alpha(theme.palette.divider, 0.3),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0.5,
            pl: 2,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.default, 0.8),
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.2),
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                transform: 'rotate(15deg)',
              },
            }}
          >
            <EmojiEmotionsIcon fontSize="small" />
          </IconButton>
          <TextField
            fullWidth
            size="small"
            placeholder={isConnected ? '메시지를 입력하세요...' : '연결 중...'}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              '& .MuiInputBase-input': {
                py: 1,
              },
            }}
          />
          <IconButton
            size="small"
            sx={{
              color: 'text.secondary',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                transform: 'rotate(-15deg)',
              },
            }}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handleSend}
            disabled={!inputMessage.trim() || !isConnected}
            sx={{
              width: 40,
              height: 40,
              background: inputMessage.trim() && isConnected
                ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                : alpha(theme.palette.action.disabled, 0.3),
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: inputMessage.trim() && isConnected ? 'scale(1.1)' : 'none',
                boxShadow: inputMessage.trim() && isConnected
                  ? `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`
                  : 'none',
              },
              '&:active': {
                transform: inputMessage.trim() && isConnected ? 'scale(0.95)' : 'none',
              },
              '&:disabled': {
                color: 'text.disabled',
              },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Participants Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            참여자 ({participants.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            {participants.map((participant) => (
              <ListItem key={participant.id} disableGutters>
                <ListItemAvatar>
                  <Avatar src={participant.avatar} sx={{ bgcolor: 'primary.main' }}>
                    {participant.name?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {participant.name}
                      {participant.role === 'LEADER' && (
                        <Typography variant="caption" color="secondary.main">
                          방장
                        </Typography>
                      )}
                    </Box>
                  }
                />
                {isLeader && participant.role !== 'LEADER' && participant.id !== user?.id && (
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleKickMember(participant.id)}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Button fullWidth variant="outlined" color="error" onClick={handleLeaveRoom}>
            채팅방 나가기
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
