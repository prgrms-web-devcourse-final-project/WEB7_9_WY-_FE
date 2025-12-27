'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useChatMessages, useChatParticipants } from '@/hooks/useChat';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { ChatConnectionStatus } from './ChatConnectionStatus';

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  partyId: string;
  partyTitle: string;
}

export function ChatDialog({ open, onClose, partyId, partyTitle }: ChatDialogProps) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    getRoomByPartyId,
    setCurrentRoom,
    addChatRoom,
    messages: storeMessages,
  } = useChatStore();

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const partyIdNum = parseInt(partyId, 10);

  // API hooks
  const {
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(open ? partyIdNum : 0);

  const { data: participants } = useChatParticipants(open ? partyIdNum : 0);

  // WebSocket hook
  const { connectionState, isConnected, sendMessage: wsSendMessage } = useChatWebSocket({
    partyId: open ? partyIdNum : 0,
    autoJoin: open,
  });

  // 현재 채팅방 메시지 (스토어에서 가져옴)
  const messages = storeMessages[partyId] || [];

  // 채팅방 설정
  useEffect(() => {
    if (open && partyId) {
      const existingRoom = getRoomByPartyId(partyId);

      if (!existingRoom) {
        const newRoom = {
          id: partyId,
          partyId,
          title: partyTitle,
          participants: [],
          isOwner: false,
          unreadCount: 0,
        };
        addChatRoom(newRoom);
        setCurrentRoom(newRoom.id);
      } else {
        setCurrentRoom(existingRoom.id);
      }
    }
  }, [open, partyId, partyTitle, getRoomByPartyId, setCurrentRoom, addChatRoom]);

  // 스크롤 to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!message.trim() || !isConnected) return;

    wsSendMessage(message.trim());
    setMessage('');
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

  const participantCount = participants?.length || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          height: { xs: '80vh', sm: '70vh' },
          maxHeight: 600,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
          <GroupIcon />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {partyTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {participantCount > 0 ? `${participantCount}명 참여중` : '파티 채팅방'}
            </Typography>
            <ChatConnectionStatus state={connectionState} showLabel={false} />
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Messages */}
      <DialogContent
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflowY: 'auto',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        {/* Load more button */}
        {hasNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <IconButton
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              {isFetchingNextPage ? (
                <CircularProgress size={20} />
              ) : (
                <Typography variant="caption">이전 메시지 불러오기</Typography>
              )}
            </IconButton>
          </Box>
        )}

        {isLoadingMessages ? (
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
        ) : messages.length === 0 ? (
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
          messages.map((msg) => {
            const isOwn = user ? msg.senderId === user.id : msg.isOwn;

            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.isSystem ? 'center' : isOwn ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.isSystem ? (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 10,
                      bgcolor: alpha(theme.palette.text.secondary, 0.1),
                      color: 'text.secondary',
                    }}
                  >
                    {msg.content}
                  </Typography>
                ) : (
                  <>
                    {!isOwn && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, ml: 1 }}>
                        {msg.senderAvatar && (
                          <Avatar src={msg.senderAvatar} sx={{ width: 16, height: 16 }} />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {msg.senderName}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{
                        maxWidth: '75%',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: isOwn
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                        color: isOwn
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.primary,
                        boxShadow: isOwn
                          ? 'none'
                          : `0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {msg.content}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 0.5, mx: 1 }}
                    >
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </>
                )}
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </DialogContent>

      <Divider />

      {/* Input */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder={isConnected ? '메시지를 입력하세요...' : '연결 중...'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: theme.palette.background.default,
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!message.trim() || !isConnected}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            '&.Mui-disabled': {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
              color: alpha(theme.palette.primary.contrastText, 0.5),
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Dialog>
  );
}
