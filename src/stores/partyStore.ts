import { create } from 'zustand';
import { partyApi } from '@/api/client';
import type { Party, PartyApplicant, PartyFilter, PartyType, PartyStatus, RawPartyResponse, ApplicationStatus } from '@/types';

// partyType 한글 → 영문 변환
const convertPartyType = (partyType: string): PartyType => {
  if (partyType === '출발팟' || partyType === 'LEAVE') return 'LEAVE';
  if (partyType === '복귀팟' || partyType === 'ARRIVE') return 'ARRIVE';
  return 'LEAVE';
};

// 중첩 구조 API 응답인지 확인
const isNestedStructure = (data: Record<string, unknown>): boolean => {
  return 'partyId' in data && 'leader' in data && 'event' in data && 'partyInfo' in data;
};


// 내가 만든 파티 API 응답을 Party로 변환
const transformMyCreatedParty = (raw: Record<string, unknown>): Party => {
  const event = raw.event as { eventId: number; eventTitle: string; venueName: string; eventDateTime: string };
  const partyInfo = raw.partyInfo as {
    partyType: string;
    departureLocation: string;
    arrivalLocation: string;
    transportType: string;
    maxMembers: number;
    currentMembers: number;
    status: string;
  };

  return {
    id: String(raw.partyId),
    title: (raw.description as string) || `${event.eventTitle} 파티`,
    type: convertPartyType(partyInfo.partyType),
    status: partyInfo.status as PartyStatus,
    eventId: String(event.eventId),
    eventName: event.eventTitle,
    venueName: event.venueName,
    eventDate: event.eventDateTime,
    departure: partyInfo.departureLocation,
    arrival: partyInfo.arrivalLocation,
    transportType: partyInfo.transportType as Party['transportType'],
    maxMembers: partyInfo.maxMembers,
    currentMembers: partyInfo.currentMembers,
    description: raw.description as string,
    createdAt: raw.createdAt as string,
    isMyParty: true, // 내가 만든 파티
  };
};

// 내가 신청한 파티 API 응답을 Party로 변환
const transformMyApplicationParty = (raw: Record<string, unknown>): Party => {
  const party = raw.party as {
    partyId: number;
    leader: { userId: number; nickname: string; profileImage: string | null };
    event: { eventId: number; eventTitle: string; venueName: string; eventDateTime: string };
    partyInfo: { partyType: string; departureLocation: string; currentMembers: number; maxMembers: number };
  };
  const applicationStatus = raw.status as string; // PENDING, APPROVED, REJECTED

  return {
    id: String(party.partyId),
    title: party.event.eventTitle,
    type: convertPartyType(party.partyInfo.partyType),
    status: applicationStatus === 'APPROVED' ? 'CLOSED' : 'RECRUITING' as PartyStatus,
    eventId: String(party.event.eventId),
    eventName: party.event.eventTitle,
    venueName: party.event.venueName,
    eventDate: party.event.eventDateTime,
    hostId: String(party.leader.userId),
    hostName: party.leader.nickname,
    leaderNickname: party.leader.nickname,
    leaderProfileImage: party.leader.profileImage || undefined,
    departure: party.partyInfo.departureLocation,
    arrival: '', // API에 없음
    maxMembers: party.partyInfo.maxMembers,
    currentMembers: party.partyInfo.currentMembers,
    isMyParty: false, // 내가 신청한 파티
    applicationId: raw.applicationId as number,
    applicationStatus: applicationStatus as 'PENDING' | 'APPROVED' | 'REJECTED',
  };
};

// 중첩 구조 API 응답을 Party로 변환
const transformNestedParty = (raw: RawPartyResponse): Party => ({
  id: String(raw.partyId),
  title: raw.partyInfo.partyName,
  type: convertPartyType(raw.partyInfo.partyType),
  status: raw.partyInfo.status,
  eventId: String(raw.event.eventId),
  eventName: raw.event.eventTitle,
  venueName: raw.event.venueName,
  hostId: String(raw.leader.userId),
  hostName: raw.leader.nickname,
  leaderNickname: raw.leader.nickname,
  leaderAge: raw.leader.age,
  leaderGender: raw.leader.gender,
  leaderProfileImage: raw.leader.profileImage || undefined,
  departure: raw.partyInfo.departureLocation,
  arrival: raw.partyInfo.arrivalLocation,
  transportType: raw.partyInfo.transportType,
  maxMembers: raw.partyInfo.maxMembers,
  currentMembers: raw.partyInfo.currentMembers,
  description: raw.partyInfo.description,
  isMyParty: raw.isMyParty,
  isApplied: raw.isApplied,
});

// 플랫 구조 API 응답을 Party로 변환 (레거시 지원)
const transformFlatParty = (apiParty: Record<string, unknown>): Party => {
  const rawType = ((apiParty.partyType as string) || (apiParty.type as string) || 'LEAVE').toUpperCase() as PartyType;
  const rawStatus = ((apiParty.status as string) || 'RECRUITING').toUpperCase() as PartyStatus;

  return {
    id: String(apiParty.id || apiParty.partyId || ''),
    title: (apiParty.partyName as string) || (apiParty.title as string) || '',
    eventId: String(apiParty.scheduleId || apiParty.eventId || ''),
    eventName: (apiParty.eventName as string) || (apiParty.scheduleName as string) || '',
    eventDate: (apiParty.eventDate as string) || (apiParty.scheduleTime as string) || undefined,
    hostId: String(apiParty.leaderId || apiParty.hostId || ''),
    hostName: (apiParty.leaderName as string) || (apiParty.hostName as string) || undefined,
    type: rawType,
    departure: (apiParty.departureLocation as string) || (apiParty.departure as string) || '',
    arrival: (apiParty.arrivalLocation as string) || (apiParty.arrival as string) || '',
    departureTime: (apiParty.departureTime as string) || undefined,
    maxMembers: (apiParty.maxMembers as number) || 4,
    currentMembers: (apiParty.currentMembers as number) || 1,
    status: rawStatus,
    description: (apiParty.description as string) || undefined,
    createdAt: (apiParty.createdAt as string) || undefined,
    transportType: apiParty.transportType as Party['transportType'],
    preferredGender: apiParty.preferredGender as Party['preferredGender'],
    preferredAge: apiParty.preferredAge as Party['preferredAge'],
  };
};

// API 응답 데이터를 프론트엔드 타입으로 변환 (중첩/플랫 구조 모두 지원)
const transformParty = (apiParty: Record<string, unknown>): Party => {
  if (isNestedStructure(apiParty)) {
    return transformNestedParty(apiParty as unknown as RawPartyResponse);
  }
  return transformFlatParty(apiParty);
};

// ApplicationInfo API 응답을 PartyApplicant로 변환
interface ApplicationInfoResponse {
  applicationId?: number;
  applicant?: {
    userId?: number;
    nickname?: string;
    profileImage?: string;
  };
  status?: string;
  appliedAt?: string;
}

const transformApplicant = (app: ApplicationInfoResponse, partyId: string): PartyApplicant => ({
  id: String(app.applicationId || ''),
  partyId,
  userId: String(app.applicant?.userId || ''),
  userName: app.applicant?.nickname || '',
  userAvatar: app.applicant?.profileImage,
  appliedAt: app.appliedAt || '',
  status: (app.status || 'PENDING') as ApplicationStatus,
});

interface PartyState {
  parties: Party[];
  myParties: Party[];
  myCreatedParties: Party[];
  myApplicationParties: Party[];
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
    preferredAge: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'ANY';
  }) => Promise<Party>;
  updateParty: (partyId: number, data: {
    partyName?: string;
    description?: string;
    departureLocation?: string;
    arrivalLocation?: string;
    transportType?: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
    maxMembers?: number;
    preferredGender?: 'MALE' | 'FEMALE' | 'ANY';
    preferredAge?: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'ANY';
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
  myCreatedParties: [],
  myApplicationParties: [],
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
        // API 응답은 { partyId, applications, summary } 구조
        const responseData = response.data as {
          applications?: ApplicationInfoResponse[];
        };
        const applicantsData = (responseData.applications || []).map((app) =>
          transformApplicant(app, partyId.toString())
        );
        set((state) => ({
          applicants: {
            ...state.applicants,
            [partyId.toString()]: applicantsData,
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
        // CreatePartyResponse는 { partyId, leaderId, status } 형태로 간단함
        // 파티 목록에 추가하지 않고, 생성된 파티 ID만 반환
        // 페이지에서 목록을 다시 fetch하도록 함
        const responseData = response.data as { partyId?: number; leaderId?: number; status?: string };
        const newParty: Party = {
          id: String(responseData.partyId || ''),
          title: data.partyName,
          type: data.partyType,
          status: 'RECRUITING', // 새로 생성된 파티는 항상 RECRUITING
          eventId: String(data.scheduleId),
          eventName: '',
          departure: data.departureLocation,
          arrival: data.arrivalLocation,
          transportType: data.transportType,
          maxMembers: data.maxMembers,
          currentMembers: 1,
          description: data.description,
          isMyParty: true,
        };
        set({ isLoading: false });
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
      // 신청 취소 후 내 신청 목록 갱신
      await get().getMyApplications();
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
        const myCreatedParties = rawParties.map(transformMyCreatedParty);
        set({ myCreatedParties, isLoading: false });
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
        const myApplicationParties = rawParties.map(transformMyApplicationParty);
        set({ myApplicationParties, isLoading: false });
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
