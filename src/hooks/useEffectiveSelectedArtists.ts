'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useArtistStore } from '@/stores/artistStore';
import { useFollowingArtists } from './useArtists';

/**
 * 로그인/게스트 모드에 따라 적절한 팔로우 아티스트 목록을 반환하는 훅
 *
 * - 로그인 상태: 서버 API (artistApi.getFollowing())에서 팔로우 목록 조회
 * - 게스트 모드: localStorage의 guestSelectedArtists 사용
 */
export function useEffectiveSelectedArtists() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isLoggedIn, isGuestMode, guestSelectedArtists } = useAuthStore();
  const { followingArtists: storeFollowing } = useArtistStore();

  // Hydration 완료 체크
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 로그인 상태에서만 API 호출
  const shouldFetchFromServer = isHydrated && isLoggedIn && !isGuestMode;

  const {
    data: serverFollowing,
    isLoading,
    error,
    refetch,
  } = useFollowingArtists({
    enabled: shouldFetchFromServer,
  });

  const effectiveArtists = useMemo(() => {
    // Hydration 전: 빈 배열 반환 (SSR 일관성)
    if (!isHydrated) return [];

    // 로그인 상태: 서버 데이터 우선, 없으면 store fallback
    if (isLoggedIn && !isGuestMode) {
      return serverFollowing ?? storeFollowing;
    }

    // 게스트/비로그인: localStorage 데이터
    return guestSelectedArtists;
  }, [
    isHydrated,
    isLoggedIn,
    isGuestMode,
    serverFollowing,
    storeFollowing,
    guestSelectedArtists,
  ]);

  return {
    effectiveArtists,
    isHydrated,
    isLoading: shouldFetchFromServer && isLoading,
    error,
    isLoggedIn,
    isGuestMode,
    refetch,
  };
}
