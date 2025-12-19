import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Artist } from '@/types';
import { artistApi } from '@/api/client';

interface ArtistState {
  artists: Artist[];
  followingArtists: string[];
  isLoading: boolean;
  error: string | null;
}

interface ArtistActions {
  fetchArtists: () => Promise<void>;
  fetchFollowing: () => Promise<void>;
  followArtist: (artistId: string) => Promise<void>;
  followMultipleArtists: (artistIds: string[]) => Promise<void>;
  unfollowArtist: (artistId: string) => Promise<void>;
  toggleFollow: (artistId: string) => Promise<void>;
  isFollowing: (artistId: string) => boolean;
  getFollowingArtists: () => Artist[];
  // State setters (for React Query hooks)
  setArtists: (artists: Artist[]) => void;
  setFollowingArtists: (artistIds: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ArtistStore = ArtistState & ArtistActions;

export const useArtistStore = create<ArtistStore>()(
  persist(
    (set, get) => ({
      artists: [],
      followingArtists: [],
      isLoading: false,
      error: null,

      fetchArtists: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await artistApi.getAll();
          if (error) {
            throw new Error('Failed to fetch artists');
          }
          if (data?.artists) {
            const artists: Artist[] = data.artists.map((a) => ({
              id: String(a.artistId || 0),
              name: a.name || '',
              shortName: a.name?.substring(0, 2) || '',
              image: a.imageUrl,
              scheduleCount: 0,
              fanCount: 0,
            }));
            set({ artists, isLoading: false });
          }
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      fetchFollowing: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await artistApi.getFollowing();
          if (error) {
            throw new Error('Failed to fetch following artists');
          }
          if (data?.artists) {
            const followingArtists = data.artists
              .map((a) => String(a.artistId || 0))
              .filter(Boolean);
            set({ followingArtists, isLoading: false });
          }
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      followArtist: async (artistId: string) => {
        // 중복 체크는 현재 상태 기준
        if (get().followingArtists.includes(artistId)) return;

        set({ isLoading: true, error: null });
        try {
          const { error } = await artistApi.follow(Number(artistId));
          if (error) {
            throw new Error('Failed to follow artist');
          }
          // 함수형 업데이트로 최신 상태 기반 업데이트 (Race Condition 방지)
          set((state) => ({
            followingArtists: state.followingArtists.includes(artistId)
              ? state.followingArtists
              : [...state.followingArtists, artistId],
            isLoading: false
          }));
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      followMultipleArtists: async (artistIds: string[]) => {
        const { followingArtists } = get();
        const newArtistIds = artistIds.filter(id => !followingArtists.includes(id));

        if (newArtistIds.length === 0) return;

        set({ isLoading: true, error: null });

        const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

        // 순차적으로 API 호출 (병렬 호출 시 서버 부하 방지)
        // 개별 실패 시에도 계속 진행 (부분 성공 허용)
        for (const artistId of newArtistIds) {
          try {
            const { error } = await artistApi.follow(Number(artistId));
            if (error) {
              results.failed.push(artistId);
            } else {
              results.success.push(artistId);
            }
          } catch {
            results.failed.push(artistId);
          }
        }

        // 성공한 아티스트만 상태 업데이트
        if (results.success.length > 0) {
          set((state) => ({
            followingArtists: [...new Set([...state.followingArtists, ...results.success])],
            isLoading: false,
          }));
        } else {
          set({ isLoading: false });
        }

        // 일부 실패 시 경고 로그
        if (results.failed.length > 0) {
          console.warn(`일부 아티스트 팔로우 실패: ${results.failed.join(', ')}`);
        }

        // 모든 실패 시에만 에러 throw (호출자가 처리할 수 있도록)
        if (results.success.length === 0 && results.failed.length > 0) {
          throw new Error('모든 아티스트 팔로우에 실패했습니다.');
        }
      },

      unfollowArtist: async (artistId: string) => {
        const { followingArtists } = get();
        if (!followingArtists.includes(artistId)) return;

        set({ isLoading: true, error: null });
        try {
          const { error } = await artistApi.unfollow(Number(artistId));
          if (error) {
            throw new Error('Failed to unfollow artist');
          }
          set({
            followingArtists: followingArtists.filter((id) => id !== artistId),
            isLoading: false
          });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      toggleFollow: async (artistId: string) => {
        const { followingArtists, followArtist, unfollowArtist } = get();
        if (followingArtists.includes(artistId)) {
          await unfollowArtist(artistId);
        } else {
          await followArtist(artistId);
        }
      },

      isFollowing: (artistId: string) => {
        return get().followingArtists.includes(artistId);
      },

      getFollowingArtists: () => {
        const { artists, followingArtists } = get();
        return artists.filter((artist) => followingArtists.includes(artist.id));
      },

      // State setters for React Query hooks
      setArtists: (artists: Artist[]) => {
        set({ artists });
      },

      setFollowingArtists: (artistIds: string[]) => {
        set({ followingArtists: artistIds });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'artist-storage',
      partialize: (state) => ({
        followingArtists: state.followingArtists,
      }),
    }
  )
);
