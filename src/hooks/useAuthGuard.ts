'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

// Routes accessible without login
const GUEST_ALLOWED_ROUTES = [
  '/',
  '/onboarding',
  '/login',
  '/signup',
  '/kalendar',
];

// Check if path matches allowed routes (including dynamic segments)
const isRouteAllowed = (pathname: string): boolean => {
  return GUEST_ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
};

interface AuthGuardReturn {
  isHydrated: boolean;
  isAllowed: boolean;
  isLoading: boolean;
}

export function useAuthGuard(): AuthGuardReturn {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Logged in users can access all routes
    if (isLoggedIn) return;

    // Guest mode or not logged in: check route permissions
    if (!isRouteAllowed(pathname)) {
      router.replace('/login');
    }
  }, [isHydrated, isLoggedIn, pathname, router]);

  return {
    isHydrated,
    isAllowed: isLoggedIn || isRouteAllowed(pathname),
    isLoading: !isHydrated,
  };
}
