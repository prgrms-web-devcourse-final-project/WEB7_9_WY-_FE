import { create } from 'zustand';
import { partyApi } from '@/api/client';
import type { Party, PartyApplicant, PartyFilter, PartyType, PartyStatus } from '@/types';

// API 응답 데이터를 프론트엔드 타입으로 변환
const transformParty = (apiParty: Record<string, unknown>): Party => {
  // partyType: 'LEAVE' | 'ARRIVE' -> type: 'departure' | 'return'
  const typeMap: Record<string, PartyType> = {
    'LEAVE': 'departure',
    'ARRIVE': 'return',
  };

  // status: 'RECRUITING' | 'CLOSED' | 'COMPLETED' | 'CANCELLED' -> status: 'recruiting' | 'confirmed' | 'closed'
  const statusMap: Record<string, PartyStatus> = {
    'RECRUITING': 'recruiting',
    'CLOSED': 'closed',
    'COMPLETED': 'closed',
    'CANCELLED': 'closed',
  };

  // Get the raw status and map it
  const rawStatus = (apiParty.status as string) || '';
  const mappedStatus = statusMap[rawStatus] || statusMap[rawStatus.toUpperCase()] || 'recruiting';

  // Get the raw type and map it
  const rawType = (apiParty.partyType as string) || (apiParty.type as string) || '';
  const mappedType = typeMap[rawType] || typeMap[rawType.toUpperCase()] || 'departure';

  return {
    id: String(apiParty.id || ''),
    title: (apiParty.partyName as string) || (apiParty.title as string) || '',
    eventId: String(apiParty.scheduleId || apiParty.eventId || ''),
    eventName: (apiParty.eventName as string) || (apiParty.scheduleName as string) || '',
    eventDate: (apiParty.eventDate as string) || (apiParty.scheduleTime as string) || undefined,
    hostId: String(apiParty.leaderId || apiParty.hostId || ''),
    hostName: (apiParty.leaderName as string) || (apiParty.hostName as string) || undefined,
    type: mappedType,
    departure: (apiParty.departureLocation as string) || (apiParty.departure as string) || '',
    arrival: (apiParty.arrivalLocation as string) || (apiParty.arrival as string) || '',
    departureTime: (apiParty.departureTime as string) || undefined,
    maxMembers: (apiParty.maxMembers as number) || 4,
    currentMembers: (apiParty.currentMembers as number) || 1,
    status: mappedStatus,
    description: (apiParty.description as string) || undefined,
    createdAt: (apiParty.createdAt as string) || undefined,
    transportType: apiParty.transportType as Party['transportType'],
    preferredGender: apiParty.preferredGender as Party['preferredGender'],
    preferredAge: apiParty.preferredAge as Party['preferredAge'],
  };
};

interface PartyState {
  parties: Party[];
  myParties: Party[];
  applicants: Record<string, PartyApplicant[]>;
  currentParty: Party | null;
  filter: PartyFilter;
  isLoading: boolean;
  error: string | null;
}

interface PartyActions {
  fetchParties: (params?: { page?: number; size?: number }) => Promise<void>;
  fetchBySchedule: (scheduleId: number, params?: {
    partyType?: 'LEAVE' | 'ARRIVE';
    transportType?: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
    page?: number;
    size?: number;
  }) => Promise<void>;
  fetchPartyMembers: (partyId: number) => Promise<void>;
  fetchPartyApplicants: (partyId: number) => Promise<void>;
  setParties: (parties: Party[]) => void;
  setMyParties: (parties: Party[]) => void;
  createParty: (data: {
    scheduleId: number;
    partyType: 'LEAVE' | 'ARRIVE';
    partyName: string;
    description?: string;
    departureLocation: string;
    arrivalLocation: string;
    transportType: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
    maxMembers: number;
    preferredGender: 'MALE' | 'FEMALE' | 'ANY';
    preferredAge: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE';
  }) => Promise<Party>;
  updateParty: (partyId: number, data: {
    partyName?: string;
    description?: string;
    departureLocation?: string;
    arrivalLocation?: string;
    transportType?: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
    maxMembers?: number;
    preferredGender?: 'MALE' | 'FEMALE' | 'ANY';
    preferredAge?: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE';
  }) => Promise<void>;
  deleteParty: (partyId: number) => Promise<void>;
  applyToParty: (partyId: number) => Promise<void>;
  acceptApplicant: (partyId: number, applicationId: number) => Promise<void>;
  rejectApplicant: (partyId: number, applicationId: number) => Promise<void>;
  cancelApplication: (partyId: number, applicationId: number) => Promise<void>;
  getMyCreated: (params?: { status?: string; page?: number; size?: number }) => Promise<void>;
  getMyApplications: (params?: { status?: string; page?: number; size?: number }) => Promise<void>;
  setCurrentParty: (party: Party | null) => void;
  setFilter: (filter: Partial<PartyFilter>) => void;
  getFilteredParties: () => Party[];
  getPartyById: (partyId: string) => Party | undefined;
  getApplicants: (partyId: string) => PartyApplicant[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type PartyStore = PartyState & PartyActions;

export const usePartyStore = create<PartyStore>()((set, get) => ({
  parties: [],
  myParties: [],
  applicants: {},
  currentParty: null,
  filter: {},
  isLoading: false,
  error: null,

  fetchParties: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partyApi.getAll(params);
      if (response.data) {
        // Transform API response to Party type
        const data = response.data as { content?: Record<string, unknown>[] } | Record<string, unknown>[];
        const rawParties = Array.isArray(data) ? data : (data.content || []);
        const parties = rawParties.map(transformParty);
        set({ parties, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '파티 목록을 불러오는데 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  fetchBySchedule: async (scheduleId, params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partyApi.getBySchedule(scheduleId, params);
      if (response.data) {
        const data = response.data as { content?: Record<string, unknown>[] } | Record<string, unknown>[];
        const rawParties = Array.isArray(data) ? data : (data.content || []);
        const parties = rawParties.map(transformParty);
        set({ parties, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '파티 목록을 불러오는데 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  fetchPartyMembers: async (partyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partyApi.getMembers(partyId);
      if (response.data) {
        // Store members data if needed
        set({ isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '파티 멤버를 불러오는데 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  fetchPartyApplicants: async (partyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partyApi.getApplicants(partyId);
      if (response.data) {
        const applicantsData = response.data as PartyApplicant[];
        set((state) => ({
          applicants: {
            ...state.applicants,
            [partyId.toString()]: applicantsData || [],
          },
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '신청자 목록을 불러오는데 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  setParties: (parties: Party[]) => {
    set({ parties });
  },

  setMyParties: (parties: Party[]) => {
    set({ myParties: parties });
  },

  createParty: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partyApi.create(data);
      if (response.data) {
        const newParty = transformParty(response.data as Record<string, unknown>);
        set((state) => ({
          parties: [newParty, ...state.parties],
          myParties: [newParty, ...state.myParties],
          isLoading: false,
        }));
        return newParty;
      }
      throw new Error('파티 생성에 실패했습니다.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '파티 생성에 실패했습니다.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateParty: async (partyId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partyApi.update(partyId, data);
      if (response.data) {
        const updatedParty = transformParty(response.data as Record<string, unknown>);
        set((state) => ({
          parties: state.parties.map((p) =>
            p.id === partyId.toString() ? updatedParty : p
          ),
          isLoading: false,
        }));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '파티 수정에 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  deleteParty: async (partyId) => {
    set({ isLoading: true, error: null });
    try {
      await partyApi.delete(partyId);
      set((state) => ({
        parties: state.parties.filter((p) => p.id !== partyId.toString()),
        myParties: state.myParties.filter((p) => p.id !== partyId.toString()),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '파티 삭제에 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  applyToParty: async (partyId) => {
    set({ isLoading: true, error: null });
    try {
      await partyApi.apply(partyId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '파티 신청에 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  acceptApplicant: async (partyId, applicationId) => {
    set({ isLoading: true, error: null });
    try {
      await partyApi.acceptApplication(partyId, applicationId);
      // Refresh applicants list
      await get().fetchPartyApplicants(partyId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '신청 승인에 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  rejectApplicant: async (partyId, applicationId) => {
    set({ isLoading: true, error: null });
    try {
      await partyApi.rejectApplication(partyId, applicationId);
      // Refresh applicants list
      await get().fetchPartyApplicants(partyId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '신청 거절에 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  cancelApplication: async (partyId, applicationId) => {
    set({ isLoading: true, error: null });
    try {
      await partyApi.cancelApplication(partyId, applicationId);
      set({ isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '신청 취소에 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  getMyCreated: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partyApi.getMyCreated(params);
      if (response.data) {
        const data = response.data as { content?: Record<string, unknown>[] } | Record<string, unknown>[];
        const rawParties = Array.isArray(data) ? data : (data.content || []);
        const myParties = rawParties.map(transformParty);
        set({ myParties, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '내 파티 목록을 불러오는데 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  getMyApplications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await partyApi.getMyApplications(params);
      if (response.data) {
        const data = response.data as { content?: Record<string, unknown>[] } | Record<string, unknown>[];
        const rawParties = Array.isArray(data) ? data : (data.content || []);
        const myApplications = rawParties.map(transformParty);
        set({ myParties: myApplications, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '내 신청 목록을 불러오는데 실패했습니다.';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  setCurrentParty: (party: Party | null) => {
    set({ currentParty: party });
  },

  setFilter: (filter: Partial<PartyFilter>) => {
    set((state) => ({ filter: { ...state.filter, ...filter } }));
  },

  getFilteredParties: () => {
    const { parties, filter } = get();
    return parties.filter((party) => {
      if (filter.type && party.type !== filter.type) return false;
      if (filter.status && party.status !== filter.status) return false;
      if (filter.eventId && party.eventId !== filter.eventId) return false;
      return true;
    });
  },

  getPartyById: (partyId: string) => {
    return get().parties.find((p) => p.id === partyId);
  },

  getApplicants: (partyId: string) => {
    return get().applicants[partyId] || [];
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
