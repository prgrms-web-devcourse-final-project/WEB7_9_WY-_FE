import { create } from 'zustand';
import type { ChatRoom, ChatMessage, ChatParticipant } from '@/types';

interface ChatState {
  chatRooms: ChatRoom[];
  currentRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  participants: Record<string, ChatParticipant[]>;
  isLoading: boolean;
  error: string | null;
}

interface ChatActions {
  // State setters
  setChatRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (roomId: string | null) => void;
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  setParticipants: (roomId: string, participants: ChatParticipant[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Room actions
  addChatRoom: (room: ChatRoom) => void;
  removeChatRoom: (roomId: string) => void;
  updateRoomLastMessage: (roomId: string, message: string, timestamp: string) => void;

  // Message actions (for WebSocket)
  addMessage: (roomId: string, message: ChatMessage) => void;
  appendMessages: (roomId: string, messages: ChatMessage[]) => void;

  // Participant actions
  updateParticipants: (roomId: string, participants: ChatParticipant[]) => void;
  removeParticipant: (roomId: string, participantId: string) => void;

  // Legacy actions (for backward compatibility)
  sendMessage: (roomId: string, content: string, senderId: string, senderName: string) => void;
  addSystemMessage: (roomId: string, content: string) => void;
  kickParticipant: (roomId: string, participantId: string) => void;
  leaveRoom: (roomId: string, userId: string) => void;

  // Getters
  getCurrentRoom: () => ChatRoom | undefined;
  getRoomByPartyId: (partyId: string) => ChatRoom | undefined;
  getCurrentMessages: () => ChatMessage[];
  getCurrentParticipants: () => ChatParticipant[];
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()((set, get) => ({
  chatRooms: [],
  currentRoomId: null,
  messages: {},
  participants: {},
  isLoading: false,
  error: null,

  // State setters
  setChatRooms: (rooms) => set({ chatRooms: rooms }),

  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
    })),

  setParticipants: (roomId, participants) =>
    set((state) => ({
      participants: { ...state.participants, [roomId]: participants },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // Room actions
  addChatRoom: (room) =>
    set((state) => ({
      chatRooms: [...state.chatRooms, room],
    })),

  removeChatRoom: (roomId) =>
    set((state) => ({
      chatRooms: state.chatRooms.filter((r) => r.id !== roomId),
      currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
    })),

  updateRoomLastMessage: (roomId, message, timestamp) =>
    set((state) => ({
      chatRooms: state.chatRooms.map((room) =>
        room.id === roomId || room.partyId === roomId
          ? { ...room, lastMessage: message, lastMessageTime: timestamp }
          : room
      ),
    })),

  // Message actions
  addMessage: (roomId, message) =>
    set((state) => {
      const roomMessages = state.messages[roomId] || [];
      // 중복 메시지 방지
      if (roomMessages.some((m) => m.id === message.id)) {
        return state;
      }

      return {
        messages: {
          ...state.messages,
          [roomId]: [...roomMessages, message],
        },
        // 마지막 메시지 업데이트 (CHAT 메시지만)
        chatRooms:
          message.type === 'CHAT' || !message.type
            ? state.chatRooms.map((room) =>
                room.id === roomId || room.partyId === roomId
                  ? {
                      ...room,
                      lastMessage: message.content,
                      lastMessageTime: message.timestamp,
                    }
                  : room
              )
            : state.chatRooms,
      };
    }),

  appendMessages: (roomId, messages) =>
    set((state) => {
      const existingMessages = state.messages[roomId] || [];
      const existingIds = new Set(existingMessages.map((m) => m.id));
      const newMessages = messages.filter((m) => !existingIds.has(m.id));

      return {
        messages: {
          ...state.messages,
          [roomId]: [...newMessages, ...existingMessages],
        },
      };
    }),

  // Participant actions
  updateParticipants: (roomId, participants) =>
    set((state) => ({
      participants: { ...state.participants, [roomId]: participants },
    })),

  removeParticipant: (roomId, participantId) =>
    set((state) => ({
      participants: {
        ...state.participants,
        [roomId]: (state.participants[roomId] || []).filter(
          (p) => p.id !== participantId
        ),
      },
    })),

  // Legacy actions
  sendMessage: (roomId, content, senderId, senderName) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), newMessage],
      },
      chatRooms: state.chatRooms.map((room) =>
        room.id === roomId
          ? { ...room, lastMessage: content, lastMessageTime: newMessage.timestamp }
          : room
      ),
    }));
  },

  addSystemMessage: (roomId, content) => {
    const systemMessage: ChatMessage = {
      id: `sys-${Date.now()}`,
      roomId,
      senderId: 'system',
      senderName: '시스템',
      content,
      timestamp: new Date().toISOString(),
      isSystem: true,
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), systemMessage],
      },
    }));
  },

  kickParticipant: (roomId, participantId) => {
    const { participants, addSystemMessage } = get();
    const roomParticipants = participants[roomId] || [];
    const kickedParticipant = roomParticipants.find((p) => p.id === participantId);

    if (kickedParticipant) {
      set((state) => ({
        participants: {
          ...state.participants,
          [roomId]: roomParticipants.filter((p) => p.id !== participantId),
        },
      }));

      addSystemMessage(roomId, `${kickedParticipant.name}님이 강퇴되었습니다.`);
    }
  },

  leaveRoom: (roomId, userId) => {
    const { participants } = get();
    const roomParticipants = participants[roomId] || [];
    const leavingParticipant = roomParticipants.find((p) => p.id === userId);

    if (leavingParticipant) {
      set((state) => ({
        participants: {
          ...state.participants,
          [roomId]: roomParticipants.filter((p) => p.id !== userId),
        },
        chatRooms: state.chatRooms.filter((r) => r.id !== roomId),
        currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
      }));
    }
  },

  // Getters
  getCurrentRoom: () => {
    const { chatRooms, currentRoomId } = get();
    return chatRooms.find((r) => r.id === currentRoomId || r.partyId === currentRoomId);
  },

  getRoomByPartyId: (partyId) => {
    const { chatRooms } = get();
    return chatRooms.find((r) => r.partyId === partyId);
  },

  getCurrentMessages: () => {
    const { messages, currentRoomId } = get();
    return currentRoomId ? messages[currentRoomId] || [] : [];
  },

  getCurrentParticipants: () => {
    const { participants, currentRoomId } = get();
    return currentRoomId ? participants[currentRoomId] || [] : [];
  },
}));
