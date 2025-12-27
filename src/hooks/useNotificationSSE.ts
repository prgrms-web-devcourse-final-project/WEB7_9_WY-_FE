'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getAccessToken, API_BASE_URL } from '@/api/client';
import { useNotificationStore } from '@/stores/notificationStore';
import { mapNotificationResponse } from '@/lib/notificationMapper';
import type { BackendNotificationResponse } from '@/types';

export type SSEConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface UseNotificationSSEOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onNotification?: (notification: BackendNotificationResponse) => void;
  onError?: (error: Error) => void;
}

const SSE_URL = `${API_BASE_URL}/api/v1/notifications/subscribe`;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * SSE를 통한 실시간 알림 구독 훅
 * @microsoft/fetch-event-source 사용 (Authorization 헤더 지원)
 */
export function useNotificationSSE(options: UseNotificationSSEOptions = {}) {
  const { enabled = true, onConnect, onNotification, onError } = options;
  const { addNotification } = useNotificationStore();

  const [connectionState, setConnectionState] = useState<SSEConnectionState>('disconnected');
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      console.warn('[SSE] No access token available');
      setConnectionState('disconnected');
      return;
    }

    // 기존 연결 정리
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setConnectionState('connecting');

    try {
      await fetchEventSource(SSE_URL, {
        signal: abortController.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(lastEventIdRef.current && { 'Last-Event-ID': lastEventIdRef.current }),
        },
        openWhenHidden: true, // 탭이 백그라운드여도 연결 유지

        onopen: async (response) => {
          if (response.ok) {
            console.log('[SSE] Connection opened');
            setConnectionState('connected');
            reconnectAttempts.current = 0;
          } else if (response.status === 401) {
            console.error('[SSE] Unauthorized - token may be expired');
            setConnectionState('error');
            throw new Error('Unauthorized');
          } else {
            console.error('[SSE] Failed to open connection:', response.status);
            setConnectionState('error');
            throw new Error(`Failed to connect: ${response.status}`);
          }
        },

        onmessage: (event) => {
          // Last-Event-ID 저장 (재연결 시 유실 데이터 복구용)
          if (event.id) {
            lastEventIdRef.current = event.id;
          }

          // 이벤트 타입별 처리
          if (event.event === 'connect') {
            console.log('[SSE] Connected:', event.data);
            onConnect?.();
            return;
          }

          if (event.event === 'notification') {
            try {
              const data: BackendNotificationResponse = JSON.parse(event.data);
              console.log('[SSE] Notification received:', data);

              // FE 포맷으로 변환하여 스토어에 추가
              const notification = mapNotificationResponse(data);
              addNotification({
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
                read: false,
                partyId: notification.partyId,
                eventId: notification.eventId,
              });

              onNotification?.(data);
            } catch (parseError) {
              console.error('[SSE] Failed to parse notification:', parseError);
            }
          }
        },

        onerror: (error) => {
          console.error('[SSE] Connection error:', error);
          setConnectionState('error');
          onError?.(error instanceof Error ? error : new Error('SSE connection error'));

          // 재연결 로직
          if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            console.error('[SSE] Max reconnect attempts reached');
          }

          // fetchEventSource가 자동 재시도하지 않도록 에러를 throw
          throw error;
        },

        onclose: () => {
          console.log('[SSE] Connection closed');
          setConnectionState('disconnected');
        },
      });
    } catch (error) {
      // AbortError는 의도적인 종료이므로 무시
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[SSE] Connection aborted');
        return;
      }
      console.error('[SSE] Connection failed:', error);
      setConnectionState('error');
    }
  }, [addNotification, onConnect, onNotification, onError]);

  const disconnect = useCallback(() => {
    // 재연결 타이머 정리
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // SSE 연결 종료
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setConnectionState('disconnected');
    reconnectAttempts.current = 0;
  }, []);

  // enabled 상태에 따라 연결/해제
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    hasError: connectionState === 'error',
    connect,
    disconnect,
  };
}
