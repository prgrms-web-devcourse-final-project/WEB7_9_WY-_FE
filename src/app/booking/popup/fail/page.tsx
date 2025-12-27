'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import { useBookingSessionStore } from '@/stores/bookingSessionStore';
import { notifyBookingError } from '@/components/booking/BookingPopup';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';
  const message = searchParams.get('message') || '결제에 실패했습니다.';

  const { setStep } = useBookingSessionStore();

  const handleRetry = () => {
    // 결제 단계로 돌아가기
    setStep('payment');
    window.location.href = '/booking/popup';
  };

  const handleClose = () => {
    // 부모에게 에러 알림 후 창 닫기
    notifyBookingError(message);
    window.close();
  };

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
      <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />

      <Typography variant="h4" color="text.primary" sx={{ mb: 2, fontWeight: 700 }}>
        결제 실패
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: 'center', mb: 1 }}
      >
        {message}
      </Typography>

      {code && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mb: 4 }}
        >
          오류 코드: {code}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            px: 4,
            py: 1.5,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
            },
          }}
        >
          창 닫기
        </Button>
        <Button
          variant="contained"
          onClick={handleRetry}
          sx={{
            px: 4,
            py: 1.5,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          다시 시도
        </Button>
      </Box>
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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentFailContent />
    </Suspense>
  );
}
