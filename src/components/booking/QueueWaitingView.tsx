'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { AccessTime, ConfirmationNumber, Close } from '@mui/icons-material';
import { useBookingSessionStore } from '@/stores/bookingSessionStore';
import { notifyBookingCancel } from '@/components/booking/BookingPopup';

interface QueueWaitingViewProps {
  scheduleId: number;
}

export default function QueueWaitingView({ scheduleId }: QueueWaitingViewProps) {
  const theme = useTheme();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const {
    queueStatus,
    position,
    performanceTitle,
    performanceDate,
    venue,
    isLoading,
    error,
    joinQueue,
    pollQueueStatus,
    createBookingSession,
    createReservation,
    fetchSeats,
    startPing,
    setStep,
  } = useBookingSessionStore();

  // 대기열 진입
  useEffect(() => {
    const initQueue = async () => {
      if (queueStatus === null && !isJoining) {
        setIsJoining(true);
        await joinQueue(scheduleId);
        setIsJoining(false);
      }
    };
    initQueue();
  }, [scheduleId, queueStatus, joinQueue, isJoining]);

  // 대기열 폴링 (10초 간격)
  useEffect(() => {
    if (queueStatus === 'WAITING') {
      const poll = async () => {
        const admitted = await pollQueueStatus(scheduleId);
        if (admitted) {
          // 대기열 통과 → 세션 생성 → 예매 생성 → 좌석 조회
          try {
            await createBookingSession(scheduleId);
            await createReservation(scheduleId);
            await fetchSeats(scheduleId);
            startPing(scheduleId);
            setStep('seats');
          } catch (err) {
            console.error('Failed to initialize booking session:', err);
          }
        }
      };

      // 즉시 한 번 폴링
      poll();

      // 10초 간격으로 폴링
      pollIntervalRef.current = setInterval(poll, 10000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [
    queueStatus,
    scheduleId,
    pollQueueStatus,
    createBookingSession,
    createReservation,
    fetchSeats,
    startPing,
    setStep,
  ]);

  // 예상 대기 시간 계산 (1인당 약 3초 가정)
  const estimatedWaitMinutes = position ? Math.ceil((position * 3) / 60) : null;

  const handleCancel = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    notifyBookingCancel();
    window.close();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
          {performanceTitle || '공연 예매'}
        </Typography>
        {(performanceDate || venue) && (
          <Typography variant="body2" color="text.secondary">
            {performanceDate && `${performanceDate}`}
            {performanceDate && venue && ' · '}
            {venue}
          </Typography>
        )}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        {error ? (
          // Error State
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="error.main" sx={{ mb: 2, fontWeight: 700 }}>
              오류가 발생했습니다
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                px: 4,
                py: 1.5,
                bgcolor: 'primary.main',
              }}
            >
              다시 시도
            </Button>
          </Box>
        ) : isLoading || isJoining ? (
          // Loading State
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={64} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.primary">
              대기열에 진입하는 중...
            </Typography>
          </Box>
        ) : queueStatus === 'WAITING' ? (
          // Waiting State
          <>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
              }}
            >
              <ConfirmationNumber sx={{ fontSize: 60, color: 'primary.main' }} />
            </Box>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              현재 대기 순번
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                mb: 4,
              }}
            >
              {position?.toLocaleString() ?? '-'}번
            </Typography>

            {estimatedWaitMinutes !== null && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 4,
                }}
              >
                <AccessTime sx={{ color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  예상 대기 시간: 약 <strong>{estimatedWaitMinutes}분</strong>
                </Typography>
              </Box>
            )}

            {/* Loading Indicator */}
            <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    animation: 'pulse 1.4s infinite ease-in-out both',
                    animationDelay: `${i * 0.16}s`,
                    '@keyframes pulse': {
                      '0%, 80%, 100%': {
                        transform: 'scale(0)',
                        opacity: 0.5,
                      },
                      '40%': {
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                    },
                  }}
                />
              ))}
            </Box>

            <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
              순서가 되면 자동으로 예매 페이지로 이동합니다.
              <br />
              이 창을 닫지 마세요.
            </Typography>
          </>
        ) : queueStatus === 'ADMITTED' ? (
          // Admitted State (transitioning)
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={64} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
              예매 페이지로 이동 중...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              잠시만 기다려주세요.
            </Typography>
          </Box>
        ) : null}
      </Box>

      {/* Footer - Cancel Button */}
      <Box
        sx={{
          p: 3,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Close />}
          onClick={handleCancel}
          sx={{
            py: 1.5,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          예매 취소
        </Button>
      </Box>
    </Box>
  );
}
