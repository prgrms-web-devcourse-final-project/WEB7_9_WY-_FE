'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { BookingPopupMessage } from '@/types/booking';

interface BookingPopupProps {
  scheduleId: number;
  performanceTitle?: string;
  performanceDate?: string;
  venue?: string;
  onComplete?: (reservationId: number, bookingNumber?: string) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

/**
 * BookingPopup - 예매 팝업 창 관리 컴포넌트
 *
 * window.open으로 새 창을 열고, postMessage로 부모 창과 통신합니다.
 * 예매 완료/취소/에러 시 콜백을 통해 부모 컴포넌트에 알립니다.
 */
export function useBookingPopup({
  scheduleId,
  performanceTitle,
  performanceDate,
  venue,
  onComplete,
  onCancel,
  onError,
}: BookingPopupProps) {
  const popupRef = useRef<Window | null>(null);

  // 팝업에서 오는 메시지 수신
  useEffect(() => {
    const handleMessage = (event: MessageEvent<BookingPopupMessage>) => {
      // 보안: 같은 origin에서 온 메시지만 처리
      if (event.origin !== window.location.origin) return;

      const { type, payload } = event.data;

      switch (type) {
        case 'BOOKING_COMPLETED':
          onComplete?.(payload?.reservationId ?? 0, payload?.bookingNumber);
          popupRef.current?.close();
          break;
        case 'BOOKING_CANCELLED':
          onCancel?.();
          popupRef.current?.close();
          break;
        case 'BOOKING_ERROR':
          onError?.(payload?.error ?? '알 수 없는 오류가 발생했습니다.');
          break;
        case 'SESSION_EXPIRED':
          onError?.('세션이 만료되었습니다. 다시 예매해주세요.');
          popupRef.current?.close();
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onComplete, onCancel, onError]);

  // 팝업 열기
  const openBookingPopup = useCallback(() => {
    // 기존 팝업이 열려있으면 포커스
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    // 팝업 URL 구성
    const params = new URLSearchParams({
      scheduleId: scheduleId.toString(),
      ...(performanceTitle && { title: performanceTitle }),
      ...(performanceDate && { date: performanceDate }),
      ...(venue && { venue }),
    });

    const popupUrl = `/booking/popup?${params.toString()}`;

    // 팝업 창 옵션
    const width = 600;
    const height = 800;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popupOptions = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      'resizable=yes',
      'scrollbars=yes',
      'status=no',
      'menubar=no',
      'toolbar=no',
      'location=no',
    ].join(',');

    // 팝업 열기
    popupRef.current = window.open(popupUrl, 'booking-popup', popupOptions);

    // 팝업이 차단된 경우
    if (!popupRef.current) {
      onError?.('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      return;
    }

    // 팝업 창 닫힘 감지 (폴링)
    const checkClosed = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(checkClosed);
        // 사용자가 직접 창을 닫은 경우
        onCancel?.();
      }
    }, 500);

    return () => {
      clearInterval(checkClosed);
    };
  }, [scheduleId, performanceTitle, performanceDate, venue, onError, onCancel]);

  // 팝업 닫기
  const closeBookingPopup = useCallback(() => {
    popupRef.current?.close();
  }, []);

  return {
    openBookingPopup,
    closeBookingPopup,
    isPopupOpen: popupRef.current && !popupRef.current.closed,
  };
}

/**
 * 팝업 내부에서 부모 창으로 메시지 전송하는 유틸리티
 */
export function sendToOpener(message: BookingPopupMessage) {
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(message, window.location.origin);
  }
}

/**
 * 예매 완료 메시지 전송
 */
export function notifyBookingComplete(reservationId: number, bookingNumber?: string) {
  sendToOpener({
    type: 'BOOKING_COMPLETED',
    payload: { reservationId, bookingNumber },
  });
}

/**
 * 예매 취소 메시지 전송
 */
export function notifyBookingCancel() {
  sendToOpener({
    type: 'BOOKING_CANCELLED',
  });
}

/**
 * 예매 에러 메시지 전송
 */
export function notifyBookingError(error: string) {
  sendToOpener({
    type: 'BOOKING_ERROR',
    payload: { error },
  });
}

/**
 * 세션 만료 메시지 전송
 */
export function notifySessionExpired() {
  sendToOpener({
    type: 'SESSION_EXPIRED',
  });
}

export default useBookingPopup;
