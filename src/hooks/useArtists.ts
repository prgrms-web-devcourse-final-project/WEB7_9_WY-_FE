'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { artistApi } from '@/api/client';
import { useArtistStore } from '@/stores/artistStore';
import type { Artist } from '@/types';

// Query keys
export const artistKeys = {
  all: ['artists'] as const,
  list: () => [...artistKeys.all, 'list'] as const,
  following: () => [...artistKeys.all, 'following'] as const,
  detail: (id: string) => [...artistKeys.all, 'detail', id] as const,
};

// Get all artists
export function useArtists() {
  const { setArtists } = useArtistStore();

  return useQuery({
    queryKey: artistKeys.list(),
    queryFn: async () => {
      const { data, error } = await artistApi.getAll();
      if (error) {
        throw new Error('아티스트 목록을 불러오는데 실패했습니다.');
      }

      // Map API response to Artist type
      const artistsData = data?.artists || [];
      const artists: Artist[] = artistsData.map((a: { artistId?: number; artistName?: string; shortName?: string; artistImage?: string; scheduleCount?: number; followerCount?: number }) => ({
        id: String(a.artistId || ''),
        name: a.artistName || '',
        shortName: a.shortName || a.artistName?.substring(0, 3) || '',
        image: a.artistImage,
        scheduleCount: a.scheduleCount || 0,
        fanCount: a.followerCount || 0,
      }));

      setArtists(artists);
      return artists;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get following artists
interface UseFollowingArtistsOptions {
  enabled?: boolean;
}

export function useFollowingArtists(options: UseFollowingArtistsOptions = {}) {
  const { enabled = true } = options;
  const { setFollowingArtists } = useArtistStore();

  return useQuery({
    queryKey: artistKeys.following(),
    queryFn: async () => {
      const { data, error } = await artistApi.getFollowing();
      if (error) {
        throw new Error('팔로잉 아티스트를 불러오는데 실패했습니다.');
      }

      const followingData = data?.artists || [];
      const followingIds = followingData.map((a: { artistId?: number }) => String(a.artistId || ''));

      setFollowingArtists(followingIds);
      return followingIds;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}

// Follow artist mutation
export function useFollowArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      const { error } = await artistApi.follow(Number(artistId));
      if (error) {
        const errorMessage = (error as { message?: string }).message || '팔로우에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artistKeys.following() });
    },
  });
}

// Unfollow artist mutation
export function useUnfollowArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artistId: string) => {
      const { error } = await artistApi.unfollow(Number(artistId));
      if (error) {
        const errorMessage = (error as { message?: string }).message || '언팔로우에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artistKeys.following() });
    },
  });
}

// Toggle follow (convenience hook)
export function useToggleFollow() {
  const followMutation = useFollowArtist();
  const unfollowMutation = useUnfollowArtist();
  const { isFollowing } = useArtistStore();

  return {
    mutate: (artistId: string) => {
      if (isFollowing(artistId)) {
        unfollowMutation.mutate(artistId);
      } else {
        followMutation.mutate(artistId);
      }
    },
    isPending: followMutation.isPending || unfollowMutation.isPending,
    isError: followMutation.isError || unfollowMutation.isError,
    error: followMutation.error || unfollowMutation.error,
  };
}
