'use client';

import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArrowBack,
  CreditCard,
  ConfirmationNumber,
  Person,
  LocationOn,
} from '@mui/icons-material';
import {
  useBookingSessionStore,
  useSelectedSeatsDetails,
  useSelectedSeatsTotal,
} from '@/stores/bookingSessionStore';
import type { TossPaymentsInstance } from '@tosspayments/payment-sdk';

export default function PaymentView() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [tossPayments, setTossPayments] = useState<TossPaymentsInstance | null>(null);

  const {
    reservationId,
    scheduleId,
    performanceTitle,
    performanceDate,
    venue,
    deliveryMethod,
    recipient,
    stopPing,
    leaveSession,
    setStep,
    error,
  } = useBookingSessionStore();

  const selectedSeatsDetails = useSelectedSeatsDetails();
  const totalAmount = useSelectedSeatsTotal();

  // TossPayments SDK 로드
  useEffect(() => {
    const loadTossPayments = async () => {
      if (typeof window !== 'undefined' && !tossPayments) {
        try {
          const { loadTossPayments: loadTP } = await import('@tosspayments/payment-sdk');
          const clientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENT_CLIENT_KEY;
          if (clientKey) {
            const tp = await loadTP(clientKey);
            setTossPayments(tp);
          }
        } catch (err) {
          console.error('Failed to load TossPayments SDK:', err);
        }
      }
    };
    loadTossPayments();
  }, [tossPayments]);

  const handleBack = () => {
    setStep('delivery');
  };

  const handlePayment = async () => {
    if (!tossPayments || !reservationId) {
      return;
    }

    setIsLoading(true);

    try {
      // Ping 중단 및 세션 종료
      stopPing();
      if (scheduleId) {
        await leaveSession(scheduleId);
      }

      // 주문 ID 생성
      const orderId = `ORDER-${reservationId}-${Date.now()}`;

      // 결제 요청
      await tossPayments.requestPayment('카드', {
        amount: totalAmount,
        orderId,
        orderName: performanceTitle || '공연 티켓',
        successUrl: `${window.location.origin}/booking/popup/success`,
        failUrl: `${window.location.origin}/booking/popup/fail`,
        customerName: recipient?.name || '',
        customerEmail: recipient?.email || '',
      });
    } catch (err: unknown) {
      console.error('Payment failed:', err);
      const error = err as { code?: string; message?: string };
      // 사용자가 취소한 경우
      if (error.code === 'USER_CANCEL') {
        return;
      }
      // 다른 에러는 fail 페이지로 리다이렉트
      window.location.href = `/booking/popup/fail?code=${error.code || 'UNKNOWN'}&message=${encodeURIComponent(error.message || '결제에 실패했습니다.')}`;
    } finally {
      setIsLoading(false);
    }
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
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{
            color: 'text.secondary',
            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
          }}
        >
          이전
        </Button>

        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
          결제
        </Typography>

        <Box sx={{ width: 72 }} /> {/* Spacer for centering */}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Stack spacing={3}>
          {/* Order Summary */}
          <Box
            sx={{
              p: 3,
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Typography
              variant="subtitle1"
              color="primary.main"
              sx={{
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <ConfirmationNumber /> 예매 정보
            </Typography>

            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  공연
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                  {performanceTitle}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  일시 및 장소
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {performanceDate} · {venue}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  좌석 ({selectedSeatsDetails.length}석)
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {selectedSeatsDetails.map((s) => `${s.block} ${s.rowNumber}열 ${s.seatNumber}번`).join(', ')}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Recipient Info */}
          <Box
            sx={{
              p: 3,
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              color="primary.main"
              sx={{
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Person /> 수령인 정보
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2" color="text.primary">
                {recipient?.name} · {recipient?.phone}
              </Typography>
              {recipient?.email && (
                <Typography variant="body2" color="text.secondary">
                  {recipient.email}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Delivery Info */}
          <Box
            sx={{
              p: 3,
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              color="primary.main"
              sx={{
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <LocationOn /> 수령 방법
            </Typography>

            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {deliveryMethod === 'DELIVERY' ? '배송 수령' : '현장 수령'}
            </Typography>

            {deliveryMethod === 'DELIVERY' && recipient?.address && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ({recipient.zipCode}) {recipient.address} {recipient.addressDetail}
              </Typography>
            )}

            {deliveryMethod === 'PICKUP' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                공연 당일 현장에서 신분증과 예매번호 제시 후 수령
              </Typography>
            )}
          </Box>

          {/* Payment Method */}
          <Box
            sx={{
              p: 3,
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              color="primary.main"
              sx={{
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CreditCard /> 결제 수단
            </Typography>

            <Typography variant="body2" color="text.secondary">
              토스페이먼츠를 통해 안전하게 결제됩니다.
              <br />
              신용카드, 체크카드로 결제 가능합니다.
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: 1,
                borderColor: 'error.main',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="error.main">
                {error}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="body1" color="text.primary">
            총 결제금액
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'primary.main',
            }}
          >
            {totalAmount.toLocaleString()}원
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!tossPayments || isLoading}
          onClick={handlePayment}
          sx={{
            py: 2,
            bgcolor: 'primary.main',
            fontWeight: 700,
            fontSize: '1.1rem',
            '&:disabled': {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
              color: alpha(theme.palette.common.white, 0.5),
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={28} sx={{ color: 'inherit' }} />
          ) : (
            `${totalAmount.toLocaleString()}원 결제하기`
          )}
        </Button>

        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}
        >
          결제 버튼을 클릭하면 토스페이먼츠 결제창이 열립니다.
        </Typography>
      </Box>
    </Box>
  );
}
