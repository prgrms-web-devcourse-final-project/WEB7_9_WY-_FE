'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useBookingSessionStore } from '@/stores/bookingSessionStore';
import { notifyBookingComplete } from '@/components/booking/BookingPopup';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const { reservationId, setStep } = useBookingSessionStore();

  useEffect(() => {
    const confirmPayment = async () => {
      if (!paymentKey || !orderId || !amount) {
        return;
      }

      try {
        // TODO: 백엔드에 결제 승인 요청
        // const response = await bookingApi.confirmPayment({
        //   paymentKey,
        //   orderId,
        //   amount: parseInt(amount, 10),
        // });

        // 결제 완료 처리
        setStep('complete');

        // 부모 창에 알림
        const bookingNumber = orderId; // 임시로 orderId를 bookingNumber로 사용
        notifyBookingComplete(reservationId ?? 0, bookingNumber);

        // 완료 페이지로 이동 대신 complete step 표시
        // 자동으로 complete view가 렌더링됨
      } catch (error) {
        console.error('Payment confirmation failed:', error);
        // 실패 페이지로 리다이렉트
        window.location.href = `/booking/popup/fail?message=${encodeURIComponent('결제 승인에 실패했습니다.')}`;
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, reservationId, setStep]);

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
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
      <Typography variant="h4" color="text.primary" sx={{ mb: 2, fontWeight: 700 }}>
        결제 처리 중
      </Typography>
      <CircularProgress size={32} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
        결제를 확인하고 있습니다.
        <br />
        잠시만 기다려주세요...
      </Typography>
    </Box>
  );
}

function LoadingFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={48} />
    </Box>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
