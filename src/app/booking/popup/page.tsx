'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useBookingSessionStore } from '@/stores/bookingSessionStore';
import { useAuthStore } from '@/stores/authStore';
import { notifyBookingCancel, notifySessionExpired } from '@/components/booking/BookingPopup';

// Step Components (will be created in Phase 4)
import QueueWaitingView from '@/components/booking/QueueWaitingView';
import SeatSelectionView from '@/components/booking/SeatSelectionView';
import DeliveryInfoView from '@/components/booking/DeliveryInfoView';
import PaymentView from '@/components/booking/PaymentView';
import BookingCompleteView from '@/components/booking/BookingCompleteView';

function BookingPopupContent() {
  const searchParams = useSearchParams();
  const scheduleId = parseInt(searchParams.get('scheduleId') || '0', 10);
  const performanceTitle = searchParams.get('title') || '';
  const performanceDate = searchParams.get('date') || '';
  const venue = searchParams.get('venue') || '';

  const { isLoggedIn, getMe } = useAuthStore();
  const {
    currentStep,
    setScheduleInfo,
    leaveSession,
    stopPing,
    reset,
  } = useBookingSessionStore();

  // 인증 확인
  useEffect(() => {
    if (!isLoggedIn) {
      getMe();
    }
  }, [isLoggedIn, getMe]);

  // 공연 정보 설정
  useEffect(() => {
    if (scheduleId > 0) {
      setScheduleInfo({
        scheduleId,
        title: performanceTitle,
        date: performanceDate,
        venue,
      });
    }
  }, [scheduleId, performanceTitle, performanceDate, venue, setScheduleInfo]);

  // 창 닫힘 시 세션 정리
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // 진행 중인 예매가 있으면 경고
      if (currentStep !== 'queue' && currentStep !== 'complete') {
        e.preventDefault();
        e.returnValue = '예매가 진행 중입니다. 정말 나가시겠습니까?';
      }

      // 세션 정리
      stopPing();
      if (scheduleId > 0) {
        await leaveSession(scheduleId);
      }
    };

    const handleUnload = () => {
      // 팝업이 닫힐 때 부모에게 알림
      if (currentStep !== 'complete') {
        notifyBookingCancel();
      }
      reset();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [currentStep, scheduleId, leaveSession, stopPing, reset]);

  // 세션 만료 감지
  const { remainingSeconds } = useBookingSessionStore();
  useEffect(() => {
    if (remainingSeconds <= 0 && currentStep !== 'queue' && currentStep !== 'complete') {
      notifySessionExpired();
      reset();
    }
  }, [remainingSeconds, currentStep, reset]);

  // 인증 필요
  if (!isLoggedIn) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Typography variant="h5" color="text.primary" sx={{ mb: 2, fontWeight: 700 }}>
          로그인이 필요합니다
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
          예매를 진행하려면 로그인이 필요합니다.
          <br />
          메인 창에서 로그인 후 다시 시도해주세요.
        </Typography>
      </Box>
    );
  }

  // 유효하지 않은 scheduleId
  if (!scheduleId || scheduleId <= 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Typography variant="h5" color="error" sx={{ mb: 2, fontWeight: 700 }}>
          잘못된 접근입니다
        </Typography>
        <Typography variant="body1" color="text.secondary">
          올바른 공연 정보가 없습니다. 창을 닫고 다시 시도해주세요.
        </Typography>
      </Box>
    );
  }

  // Step별 컴포넌트 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 'queue':
        return <QueueWaitingView scheduleId={scheduleId} />;
      case 'seats':
        return <SeatSelectionView scheduleId={scheduleId} />;
      case 'delivery':
        return <DeliveryInfoView />;
      case 'payment':
        return <PaymentView />;
      case 'complete':
        return <BookingCompleteView />;
      default:
        return <QueueWaitingView scheduleId={scheduleId} />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {renderStep()}
    </Box>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        예매 페이지를 불러오는 중...
      </Typography>
    </Box>
  );
}

export default function BookingPopupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingPopupContent />
    </Suspense>
  );
}
