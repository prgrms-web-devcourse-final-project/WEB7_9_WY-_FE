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
  setChatRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (roomId: string | null) => void;
  addChatRoom: (room: ChatRoom) => void;
  removeChatRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string, senderId: string, senderName: string) => void;
  addSystemMessage: (roomId: string, content: string) => void;
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  setParticipants: (roomId: string, participants: ChatParticipant[]) => void;
  kickParticipant: (roomId: string, participantId: string) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  getCurrentRoom: () => ChatRoom | undefined;
  getRoomByPartyId: (partyId: string) => ChatRoom | undefined;
  getCurrentMessages: () => ChatMessage[];
  getCurrentParticipants: () => ChatParticipant[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()((set, get) => ({
  chatRooms: [],
  currentRoomId: null,
  messages: {},
  participants: {},
  isLoading: false,
  error: null,

  setChatRooms: (rooms: ChatRoom[]) => {
    set({ chatRooms: rooms });
  },

  setCurrentRoom: (roomId: string | null) => {
    set({ currentRoomId: roomId });
  },

  addChatRoom: (room: ChatRoom) => {
    set((state) => ({
      chatRooms: [...state.chatRooms, room],
    }));
  },

  removeChatRoom: (roomId: string) => {
    set((state) => ({
      chatRooms: state.chatRooms.filter((r) => r.id !== roomId),
      currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
    }));
  },

  sendMessage: (roomId: string, content: string, senderId: string, senderName: string) => {
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

  addSystemMessage: (roomId: string, content: string) => {
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

  setMessages: (roomId: string, messages: ChatMessage[]) => {
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
    }));
  },

  setParticipants: (roomId: string, participants: ChatParticipant[]) => {
    set((state) => ({
      participants: { ...state.participants, [roomId]: participants },
    }));
  },

  kickParticipant: (roomId: string, participantId: string) => {
    const { participants } = get();
    const roomParticipants = participants[roomId] || [];
    const kickedParticipant = roomParticipants.find((p) => p.id === participantId);

    if (kickedParticipant) {
      set((state) => ({
        participants: {
          ...state.participants,
          [roomId]: roomParticipants.filter((p) => p.id !== participantId),
        },
      }));

      get().addSystemMessage(roomId, `${kickedParticipant.name}님이 강퇴되었습니다.`);
    }
  },

  leaveRoom: (roomId: string, userId: string) => {
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

  getCurrentRoom: () => {
    const { chatRooms, currentRoomId } = get();
    return chatRooms.find((r) => r.id === currentRoomId || r.partyId === currentRoomId);
  },

  getRoomByPartyId: (partyId: string) => {
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

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
