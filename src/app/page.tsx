'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/common';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isOnboarded, isGuestMode, guestSelectedArtists } = useAuthStore();

  useEffect(() => {
    // Guest mode with selected artists -> show kalendar
    if (!isLoggedIn && isGuestMode && guestSelectedArtists.length > 0) {
      router.replace('/kalendar');
      return;
    }

    // Not logged in and no guest selections -> go to onboarding (guest mode available)
    if (!isLoggedIn && !isGuestMode) {
      router.replace('/onboarding');
      return;
    }

    // Logged in but not onboarded -> onboarding
    if (isLoggedIn && !isOnboarded) {
      router.replace('/onboarding');
      return;
    }

    // Logged in and onboarded -> kalendar
    if (isLoggedIn && isOnboarded) {
      router.replace('/kalendar');
      return;
    }
  }, [isLoggedIn, isOnboarded, isGuestMode, guestSelectedArtists, router]);

  return <LoadingSpinner fullScreen message="로딩 중..." />;
}
