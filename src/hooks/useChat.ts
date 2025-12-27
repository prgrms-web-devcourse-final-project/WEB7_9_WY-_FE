'use client';

import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/api/client';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import type { ChatRoom, ChatMessage, ChatParticipant } from '@/types';

// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  room: (partyId: number) => [...chatKeys.all, 'room', partyId] as const,
  messages: (partyId: number) => [...chatKeys.all, 'messages', partyId] as const,
  participants: (partyId: number) => [...chatKeys.all, 'participants', partyId] as const,
};

// Type mappers
const mapChatRoom = (item: {
  partyId?: number;
  partyName?: string;
  participantCount?: number;
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  unreadCount?: number;
  maxParticipants?: number;
  isActive?: boolean;
}): ChatRoom => ({
  id: String(item.partyId || ''),
  partyId: String(item.partyId || ''),
  title: item.partyName || '',
  participants: [],
  isOwner: false,
  lastMessage: item.lastMessage || undefined,
  lastMessageTime: item.lastMessageTime || undefined,
  unreadCount: item.unreadCount || 0,
  participantCount: item.participantCount || 0,
  maxParticipants: item.maxParticipants,
  isActive: item.isActive,
});

const mapChatMessage = (
  msg: {
    messageId?: number;
    partyId?: number;
    type?: string;
    senderId?: number;
    senderNickname?: string;
    senderProfileImage?: string | null;
    message?: string | null;
    timestamp?: string;
    kickedByLeaderId?: number;
    kickedByLeaderNickname?: string;
  },
  currentUserId?: string
): ChatMessage => ({
  id: String(msg.messageId || Date.now()),
  roomId: String(msg.partyId || ''),
  type: (msg.type as ChatMessage['type']) || 'CHAT',
  senderId: String(msg.senderId || ''),
  senderName: msg.senderNickname || '',
  senderAvatar: msg.senderProfileImage || undefined,
  content: msg.message || '',
  timestamp: msg.timestamp || new Date().toISOString(),
  isSystem: msg.type !== 'CHAT',
  isOwn: currentUserId ? String(msg.senderId) === currentUserId : false,
  kickedByLeaderId: msg.kickedByLeaderId ? String(msg.kickedByLeaderId) : undefined,
  kickedByLeaderNickname: msg.kickedByLeaderNickname,
});

const mapParticipant = (p: {
  userId?: number;
  nickname?: string;
  profileImage?: string | null;
  isLeader?: boolean;
  isOnline?: boolean;
}): ChatParticipant => ({
  id: String(p.userId || ''),
  name: p.nickname || '',
  avatar: p.profileImage || undefined,
  isOwner: p.isLeader || false,
  isOnline: p.isOnline || false,
  role: p.isLeader ? 'LEADER' : 'MEMBER',
});

// Hooks
export function useChatRooms() {
  const { setChatRooms } = useChatStore();

  return useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: async () => {
      const { data, error } = await chatApi.getRooms();
      if (error) throw new Error('채팅방 목록을 불러오는데 실패했습니다.');

      const rooms = (data?.chatRooms || []).map(mapChatRoom);
      setChatRooms(rooms);
      return rooms;
    },
    staleTime: 1000 * 60,
  });
}

export function useChatRoomInfo(partyId: number) {
  return useQuery({
    queryKey: chatKeys.room(partyId),
    queryFn: async () => {
      const { data, error, response } = await chatApi.getRoomInfo(partyId);

      // 404 에러: 채팅방이 존재하지 않음
      if (response?.status === 404) {
        throw new Error('CHAT_ROOM_NOT_FOUND');
      }

      if (error) throw new Error('채팅방 정보를 불러오는데 실패했습니다.');

      return {
        partyId: data?.partyId,
        partyName: data?.partyName,
        participantCount: data?.participantCount,
        maxParticipants: data?.maxParticipants,
        isActive: data?.isActive,
        createdAt: data?.createdAt,
      };
    },
    enabled: !!partyId,
    staleTime: 1000 * 30,
    retry: (failureCount, error) => {
      // 404 에러는 재시도하지 않음
      if (error instanceof Error && error.message === 'CHAT_ROOM_NOT_FOUND') {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useChatMessages(partyId: number) {
  const { user } = useAuthStore();
  const { setMessages, appendMessages } = useChatStore();
  const currentUserId = user?.id;

  return useInfiniteQuery({
    queryKey: chatKeys.messages(partyId),
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await chatApi.getMessages(partyId, {
        page: pageParam,
        size: 50,
      });
      if (error) throw new Error('채팅 히스토리를 불러오는데 실패했습니다.');

      const messages = (data?.messages || []).map((msg) =>
        mapChatMessage(msg, currentUserId)
      );

      // 첫 페이지면 setMessages, 이후 페이지면 appendMessages (prepend)
      if (pageParam === 0) {
        setMessages(String(partyId), messages);
      } else {
        appendMessages(String(partyId), messages);
      }

      return {
        messages,
        currentPage: data?.currentPage || 0,
        totalPages: data?.totalPages || 0,
        totalMessages: data?.totalMessages || 0,
        hasNext: data?.hasNext || false,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 0,
    enabled: !!partyId,
  });
}

export function useChatParticipants(partyId: number) {
  const { setParticipants } = useChatStore();

  return useQuery({
    queryKey: chatKeys.participants(partyId),
    queryFn: async () => {
      const { data, error } = await chatApi.getParticipants(partyId);
      if (error) throw new Error('참여자 목록을 불러오는데 실패했습니다.');

      const participants = (data?.participants || []).map(mapParticipant);
      setParticipants(String(partyId), participants);
      return participants;
    },
    enabled: !!partyId,
    staleTime: 1000 * 30,
  });
}

// Invalidation helper
export function useInvalidateChatQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateRooms: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() }),
    invalidateMessages: (partyId: number) =>
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(partyId) }),
    invalidateParticipants: (partyId: number) =>
      queryClient.invalidateQueries({ queryKey: chatKeys.participants(partyId) }),
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.all }),
  };
}
