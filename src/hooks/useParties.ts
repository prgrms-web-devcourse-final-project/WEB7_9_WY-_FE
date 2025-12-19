'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { partyApi } from '@/api/client';
import { usePartyStore } from '@/stores/partyStore';
import type { Party, RawPartyResponse, PartyType, PartyStatus } from '@/types';

// Query keys
export const partyKeys = {
  all: ['parties'] as const,
  list: (filters?: { scheduleId?: number }) => [...partyKeys.all, 'list', filters] as const,
  myCreated: () => [...partyKeys.all, 'myCreated'] as const,
  myApplied: () => [...partyKeys.all, 'myApplied'] as const,
  detail: (id: string) => [...partyKeys.all, 'detail', id] as const,
  members: (id: string) => [...partyKeys.all, 'members', id] as const,
  applicants: (id: string) => [...partyKeys.all, 'applicants', id] as const,
};

// 중첩 구조 API 응답인지 확인
const isNestedStructure = (data: Record<string, unknown>): boolean => {
  return 'partyId' in data && 'leader' in data && 'event' in data && 'partyInfo' in data;
};

// 중첩 구조 API 응답을 Party로 변환
const mapNestedPartyData = (raw: RawPartyResponse): Party => ({
  id: String(raw.partyId),
  title: raw.partyInfo.partyName,
  type: raw.partyInfo.partyType,
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
const mapFlatPartyData = (p: Record<string, unknown>): Party => ({
  id: String(p.partyId || p.id || ''),
  title: (p.partyName as string) || '',
  description: p.description as string | undefined,
  type: ((p.partyType as string)?.toUpperCase() || 'LEAVE') as PartyType,
  transportType: (p.transportType as Party['transportType']) || 'TAXI',
  departure: (p.departureLocation as string) || '',
  arrival: (p.arrivalLocation as string) || '',
  departureTime: (p.departureTime as string) || '',
  currentMembers: (p.currentMembers as number) || 0,
  maxMembers: (p.maxMembers as number) || 4,
  status: ((p.status as string)?.toUpperCase() || 'RECRUITING') as PartyStatus,
  hostId: String(p.hostId || ''),
  hostName: p.hostName as string | undefined,
  eventId: String(p.scheduleId || ''),
  eventName: p.eventName as string | undefined,
  preferredGender: (p.preferredGender as Party['preferredGender']) || 'ANY',
  preferredAge: (p.preferredAge as Party['preferredAge']) || 'NONE',
});

// Map API response to Party type (중첩/플랫 구조 모두 지원)
const mapPartyData = (p: Record<string, unknown>): Party => {
  if (isNestedStructure(p)) {
    return mapNestedPartyData(p as unknown as RawPartyResponse);
  }
  return mapFlatPartyData(p);
};

// Get all parties
export function useParties(scheduleId?: number) {
  const { setParties } = usePartyStore();

  return useQuery({
    queryKey: partyKeys.list({ scheduleId }),
    queryFn: async () => {
      let data, error;

      if (scheduleId) {
        const result = await partyApi.getBySchedule(scheduleId);
        data = result.data;
        error = result.error;
      } else {
        const result = await partyApi.getAll();
        data = result.data;
        error = result.error;
      }

      if (error) {
        throw new Error('파티 목록을 불러오는데 실패했습니다.');
      }

      const responseData = data as { content?: Record<string, unknown>[] } | Record<string, unknown>[] | null;
      const partiesArray: Record<string, unknown>[] = Array.isArray(responseData)
        ? responseData
        : (responseData?.content || []);

      const parties = partiesArray.map(mapPartyData);
      setParties(parties);
      return parties;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get my created parties
export function useMyCreatedParties() {
  return useQuery({
    queryKey: partyKeys.myCreated(),
    queryFn: async () => {
      const { data, error } = await partyApi.getMyCreated();
      if (error) {
        throw new Error('내가 만든 파티를 불러오는데 실패했습니다.');
      }

      const responseData = data as { content?: Record<string, unknown>[] } | Record<string, unknown>[] | null;
      const partiesArray: Record<string, unknown>[] = Array.isArray(responseData)
        ? responseData
        : (responseData?.content || []);

      return partiesArray.map(mapPartyData);
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Get my applied parties
export function useMyAppliedParties() {
  return useQuery({
    queryKey: partyKeys.myApplied(),
    queryFn: async () => {
      const { data, error } = await partyApi.getMyApplications();
      if (error) {
        throw new Error('신청한 파티를 불러오는데 실패했습니다.');
      }

      const responseData = data as { content?: Record<string, unknown>[] } | Record<string, unknown>[] | null;
      const partiesArray: Record<string, unknown>[] = Array.isArray(responseData)
        ? responseData
        : (responseData?.content || []);

      return partiesArray.map(mapPartyData);
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Get party members
export function usePartyMembers(partyId: string) {
  return useQuery({
    queryKey: partyKeys.members(partyId),
    queryFn: async () => {
      const { data, error } = await partyApi.getMembers(Number(partyId));
      if (error) {
        throw new Error('파티 멤버를 불러오는데 실패했습니다.');
      }
      return data?.members || [];
    },
    enabled: !!partyId,
    staleTime: 1000 * 60,
  });
}

// Get party applicants (for host)
export function usePartyApplicants(partyId: string) {
  return useQuery({
    queryKey: partyKeys.applicants(partyId),
    queryFn: async () => {
      const { data, error } = await partyApi.getApplicants(Number(partyId));
      if (error) {
        throw new Error('신청 목록을 불러오는데 실패했습니다.');
      }
      return data?.applications || [];
    },
    enabled: !!partyId,
    staleTime: 1000 * 60,
  });
}

// Create party mutation
export function useCreateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
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
    }) => {
      const { data: response, error } = await partyApi.create(data);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '파티 생성에 실패했습니다.';
        throw new Error(errorMessage);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
    },
  });
}

// Update party mutation
export function useUpdateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partyId, data }: {
      partyId: number;
      data: {
        partyName?: string;
        description?: string;
        departureLocation?: string;
        arrivalLocation?: string;
        transportType?: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
        maxMembers?: number;
        preferredGender?: 'MALE' | 'FEMALE' | 'ANY';
        preferredAge?: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE';
      };
    }) => {
      const { error } = await partyApi.update(partyId, data);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '파티 수정에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, { partyId }) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(String(partyId)) });
      queryClient.invalidateQueries({ queryKey: partyKeys.list() });
    },
  });
}

// Delete party mutation
export function useDeleteParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partyId: number) => {
      const { error } = await partyApi.delete(partyId);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '파티 삭제에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
    },
  });
}

// Apply to party mutation
export function useApplyToParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partyId }: { partyId: number }) => {
      const { error } = await partyApi.apply(partyId);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '파티 신청에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, { partyId }) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(String(partyId)) });
      queryClient.invalidateQueries({ queryKey: partyKeys.myApplied() });
    },
  });
}

// Accept applicant mutation
export function useAcceptApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partyId, applicationId }: { partyId: number; applicationId: number }) => {
      const { error } = await partyApi.acceptApplication(partyId, applicationId);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '신청 승인에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, { partyId }) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.applicants(String(partyId)) });
      queryClient.invalidateQueries({ queryKey: partyKeys.members(String(partyId)) });
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(String(partyId)) });
    },
  });
}

// Reject applicant mutation
export function useRejectApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partyId, applicationId }: { partyId: number; applicationId: number }) => {
      const { error } = await partyApi.rejectApplication(partyId, applicationId);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '신청 거절에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, { partyId }) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.applicants(String(partyId)) });
    },
  });
}

// Cancel application mutation
export function useCancelApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partyId, applicationId }: { partyId: number; applicationId: number }) => {
      const { error } = await partyApi.cancelApplication(partyId, applicationId);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '신청 취소에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partyKeys.myApplied() });
    },
  });
}
