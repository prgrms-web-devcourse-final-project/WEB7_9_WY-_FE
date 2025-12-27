'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNotificationSSE } from '@/hooks/useNotificationSSE';

interface NotificationSSEProviderProps {
  children: React.ReactNode;
}

/**
 * SSE 알림 구독 프로바이더
 * 로그인 상태일 때만 SSE 연결을 유지합니다.
 */
export function NotificationSSEProvider({ children }: NotificationSSEProviderProps) {
  const { isLoggedIn } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();

  // SSE 연결 시 초기 알림 fetch
  const handleConnect = useCallback(() => {
    fetchNotifications(0);
  }, [fetchNotifications]);

  // SSE 연결 - 로그인 상태일 때만 활성화
  useNotificationSSE({
    enabled: isLoggedIn,
    onConnect: handleConnect,
  });

  // 로그인 상태 변경 시 초기 알림 fetch
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications(0);
    }
  }, [isLoggedIn, fetchNotifications]);

  return <>{children}</>;
}
