'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { stompClient, ConnectionState } from '@/lib/stomp';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { chatKeys } from './useChat';
import type { ChatMessage, ChatMessageType } from '@/types';

interface WebSocketMessage {
  type?: ChatMessageType;
  partyId?: number;
  // CHAT 메시지
  senderId?: number;
  senderNickname?: string;
  senderProfileImage?: string;
  message?: string;
  timestamp?: string;
  // JOIN/LEAVE 메시지
  userId?: number;
  userNickname?: string;
  userProfileImage?: string;
  participantCount?: number;
  // KICK 메시지
  kickedMemberId?: number;
  kickedMemberNickname?: string;
  kickedByLeaderId?: number;
  kickedByLeaderNickname?: string;
}

interface UseChatWebSocketOptions {
  partyId: number;
  onMessage?: (message: ChatMessage) => void;
  autoJoin?: boolean;
}

export function useChatWebSocket({
  partyId,
  onMessage,
  autoJoin = true,
}: UseChatWebSocketOptions) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { addMessage } = useChatStore();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasJoinedRef = useRef(false);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (frame: { body: string }) => {
      try {
        const data: WebSocketMessage = JSON.parse(frame.body);
        const type = data.type || 'CHAT';

        let senderId: string;
        let senderName: string;
        let senderAvatar: string | undefined;
        let content: string;

        switch (type) {
          case 'CHAT':
            senderId = String(data.senderId || '');
            senderName = data.senderNickname || '';
            senderAvatar = data.senderProfileImage;
            content = data.message || '';
            break;
          case 'JOIN':
          case 'LEAVE':
            senderId = String(data.userId || '');
            senderName = data.userNickname || '';
            senderAvatar = data.userProfileImage;
            content = data.message || `${senderName}님이 ${type === 'JOIN' ? '입장' : '퇴장'}하셨습니다.`;
            break;
          case 'KICK':
            senderId = String(data.kickedMemberId || '');
            senderName = data.kickedMemberNickname || '';
            content = data.message || `${senderName}님이 강퇴되었습니다.`;
            break;
          default:
            senderId = '';
            senderName = '';
            content = '';
        }

        const message: ChatMessage = {
          id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          roomId: String(partyId),
          type,
          senderId,
          senderName,
          senderAvatar,
          content,
          timestamp: data.timestamp || new Date().toISOString(),
          isSystem: type !== 'CHAT',
          isOwn: user ? senderId === user.id : false,
          kickedByLeaderId: data.kickedByLeaderId
            ? String(data.kickedByLeaderId)
            : undefined,
          kickedByLeaderNickname: data.kickedByLeaderNickname,
        };

        // Update store
        addMessage(String(partyId), message);

        // Invalidate participants on JOIN/LEAVE/KICK
        if (type !== 'CHAT') {
          queryClient.invalidateQueries({
            queryKey: chatKeys.participants(partyId),
          });
        }

        // Callback
        onMessage?.(message);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    },
    [partyId, user, addMessage, queryClient, onMessage]
  );

  // Connect and subscribe
  useEffect(() => {
    if (!partyId) return;

    // Connect to STOMP
    stompClient.connect();

    // Subscribe to connection state changes
    const unsubscribeState = stompClient.onStateChange((state) => {
      setConnectionState(state);

      // Re-subscribe and join when reconnected
      if (state === 'connected') {
        unsubscribeRef.current = stompClient.subscribe(partyId, handleMessage);

        // Auto-join room (only once per session)
        if (autoJoin && !hasJoinedRef.current) {
          stompClient.joinRoom(partyId);
          hasJoinedRef.current = true;
        }
      }
    });

    // Initial subscription if already connected
    if (stompClient.isConnected()) {
      unsubscribeRef.current = stompClient.subscribe(partyId, handleMessage);
      if (autoJoin && !hasJoinedRef.current) {
        stompClient.joinRoom(partyId);
        hasJoinedRef.current = true;
      }
    }

    return () => {
      unsubscribeRef.current?.();
      unsubscribeState();
      hasJoinedRef.current = false;
    };
  }, [partyId, handleMessage, autoJoin]);

  // Actions
  const sendMessage = useCallback(
    (content: string) => {
      if (content.trim()) {
        stompClient.sendMessage(partyId, content.trim());
      }
    },
    [partyId]
  );

  const leaveRoom = useCallback(() => {
    stompClient.leaveRoom(partyId);
    hasJoinedRef.current = false;
  }, [partyId]);

  const kickMember = useCallback(
    (targetMemberId: number) => {
      stompClient.kickMember(partyId, targetMemberId);
    },
    [partyId]
  );

  const disconnect = useCallback(() => {
    unsubscribeRef.current?.();
    hasJoinedRef.current = false;
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    hasError: connectionState === 'error',
    sendMessage,
    leaveRoom,
    kickMember,
    disconnect,
  };
}
