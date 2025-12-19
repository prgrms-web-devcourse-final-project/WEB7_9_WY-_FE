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
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { LoadingSpinner } from '@/components/common';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const {
    chatRooms,
    addChatRoom,
    setCurrentRoom,
    getCurrentRoom,
    messages,
    sendMessage,
    participants,
    setParticipants,
    kickParticipant,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isAllowed) return;
    // TODO: Fetch chat rooms from API when available
    setCurrentRoom(chatId);

    // Check if room exists in store (for newly created parties)
    const existingRoom = chatRooms.find((r) => r.id === chatId || r.partyId === chatId);

    if (!existingRoom && user) {
      // Create a new chat room for newly created party
      const newRoom = {
        id: chatId,
        partyId: chatId,
        title: '새 파티 채팅방',
        participants: [
          {
            id: user.id,
            name: user.name,
            isOwner: true,
          },
        ],
        isOwner: true,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      };
      addChatRoom(newRoom);
      setParticipants(chatId, newRoom.participants);
    }
  }, [chatId, chatRooms, setCurrentRoom, participants, setParticipants, user, addChatRoom, isAllowed]);

  const currentRoom = getCurrentRoom();
  const actualRoomId = currentRoom?.id || chatId;

  const currentMessages = messages[actualRoomId];
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const roomMessages = messages[actualRoomId] || [];
  const roomParticipants = participants[actualRoomId] || [];

  const handleSend = () => {
    if (!inputMessage.trim() || !user) return;
    sendMessage(actualRoomId, inputMessage.trim(), user.id, user.name);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  if (!currentRoom) {
    return null;
  }

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
            <Typography variant="h4" fontWeight={600}>{currentRoom.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {roomParticipants.length}명 참여 중
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
        {roomMessages.map((message, index) => {
          const isOwn = message.senderId === user?.id || message.senderId === 'user-1';
          const isSystem = message.isSystem;

          if (isSystem) {
            return (
              <Box
                key={message.id}
                sx={{
                  textAlign: 'center',
                  my: 2,
                  animation: `${fadeInUp} 0.3s ease-out`,
                  animationDelay: `${index * 0.05}s`,
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
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'both',
              }}
            >
              {!isOwn && (
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {message.senderName.charAt(0)}
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
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
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
        })}
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
            placeholder="메시지를 입력하세요..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
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
            disabled={!inputMessage.trim()}
            sx={{
              width: 40,
              height: 40,
              background: inputMessage.trim()
                ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                : alpha(theme.palette.action.disabled, 0.3),
              color: 'white',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: inputMessage.trim() ? 'scale(1.1)' : 'none',
                boxShadow: inputMessage.trim()
                  ? `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`
                  : 'none',
              },
              '&:active': {
                transform: inputMessage.trim() ? 'scale(0.95)' : 'none',
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
            참여자 ({roomParticipants.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List disablePadding>
            {roomParticipants.map((participant) => (
              <ListItem key={participant.id} disableGutters>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {participant.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {participant.name}
                      {participant.isOwner && (
                        <Typography variant="caption" color="secondary.main">
                          방장
                        </Typography>
                      )}
                    </Box>
                  }
                />
                {currentRoom.isOwner && !participant.isOwner && (
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => kickParticipant(actualRoomId, participant.id)}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Button fullWidth variant="outlined" color="error" onClick={() => router.push('/chats')}>
            채팅방 나가기
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
