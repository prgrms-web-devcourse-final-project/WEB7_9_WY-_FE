'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { partyApi } from '@/api/client';
import { usePartyStore } from '@/stores/partyStore';
import type { Party } from '@/types';

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

// Raw party data from API
type RawPartyData = {
  partyId?: number;
  partyName?: string;
  description?: string;
  partyType?: string;
  transportType?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  departureTime?: string;
  currentMembers?: number;
  maxMembers?: number;
  status?: string;
  hostId?: number;
  hostName?: string;
  scheduleId?: number;
  eventName?: string;
  preferredGender?: string;
  preferredAge?: string;
};

// Map API response to Party type
const mapPartyData = (p: RawPartyData): Party => ({
  id: String(p.partyId || ''),
  title: p.partyName || '',
  description: p.description,
  type: (p.partyType === 'LEAVE' ? 'departure' : 'return') as 'departure' | 'return',
  transportType: (p.transportType as Party['transportType']) || 'TAXI',
  departure: p.departureLocation || '',
  arrival: p.arrivalLocation || '',
  departureTime: p.departureTime || '',
  currentMembers: p.currentMembers || 0,
  maxMembers: p.maxMembers || 4,
  status: (p.status?.toLowerCase() || 'recruiting') as 'recruiting' | 'confirmed' | 'closed',
  hostId: String(p.hostId || ''),
  hostName: p.hostName,
  eventId: String(p.scheduleId || ''),
  eventName: p.eventName,
  preferredGender: (p.preferredGender as Party['preferredGender']) || 'ANY',
  preferredAge: (p.preferredAge as Party['preferredAge']) || 'NONE',
});

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

      const responseData = data as { content?: RawPartyData[] } | RawPartyData[] | null;
      const partiesArray: RawPartyData[] = Array.isArray(responseData)
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

      const responseData = data as { content?: RawPartyData[] } | RawPartyData[] | null;
      const partiesArray: RawPartyData[] = Array.isArray(responseData)
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

      const responseData = data as { content?: RawPartyData[] } | RawPartyData[] | null;
      const partiesArray: RawPartyData[] = Array.isArray(responseData)
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
