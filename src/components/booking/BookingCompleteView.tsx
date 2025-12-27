'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  CheckCircle,
  ConfirmationNumber,
  CalendarMonth,
  LocationOn,
  Person,
  ContentCopy,
} from '@mui/icons-material';
import {
  useBookingSessionStore,
  useSelectedSeatsDetails,
  useSelectedSeatsTotal,
} from '@/stores/bookingSessionStore';
import { notifyBookingComplete } from '@/components/booking/BookingPopup';

export default function BookingCompleteView() {
  const theme = useTheme();

  const {
    reservationId,
    performanceTitle,
    performanceDate,
    venue,
    deliveryMethod,
    recipient,
    reset,
  } = useBookingSessionStore();

  const selectedSeatsDetails = useSelectedSeatsDetails();
  const totalAmount = useSelectedSeatsTotal();

  // 예매 번호 (임시로 reservationId 사용)
  const bookingNumber = `KLD-${reservationId?.toString().padStart(8, '0') || '00000000'}`;

  const handleCopyBookingNumber = async () => {
    try {
      await navigator.clipboard.writeText(bookingNumber);
      // TODO: Toast notification
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    // 부모에게 완료 알림
    notifyBookingComplete(reservationId ?? 0, bookingNumber);
    // 상태 초기화
    reset();
    // 창 닫기
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
      {/* Success Header */}
      <Box
        sx={{
          py: 6,
          px: 4,
          textAlign: 'center',
          bgcolor: alpha(theme.palette.success.main, 0.1),
          borderBottom: 1,
          borderColor: alpha(theme.palette.success.main, 0.3),
        }}
      >
        <CheckCircle
          sx={{
            fontSize: 80,
            color: 'success.main',
            mb: 2,
          }}
        />

        <Typography
          variant="h4"
          color="text.primary"
          sx={{
            fontWeight: 800,
            mb: 1,
          }}
        >
          예매가 완료되었습니다!
        </Typography>

        <Typography variant="body1" color="text.secondary">
          결제가 성공적으로 완료되었습니다.
          <br />
          아래 예매 정보를 확인해주세요.
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Stack spacing={3}>
          {/* Booking Number */}
          <Box
            sx={{
              p: 3,
              border: 2,
              borderColor: 'primary.main',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              예매 번호
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                  letterSpacing: 2,
                }}
              >
                {bookingNumber}
              </Typography>
              <Button
                size="small"
                onClick={handleCopyBookingNumber}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <ContentCopy fontSize="small" />
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              현장 수령 시 이 번호를 제시해주세요
            </Typography>
          </Box>

          {/* Performance Info */}
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
              <ConfirmationNumber /> 예매 정보
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  공연
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                  {performanceTitle}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <CalendarMonth fontSize="small" /> 일시
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {performanceDate}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <LocationOn fontSize="small" /> 장소
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {venue}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
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
              <Person /> 수령 정보
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2" color="text.primary">
                {recipient?.name} · {recipient?.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {deliveryMethod === 'DELIVERY' ? '배송 수령' : '현장 수령'}
                {deliveryMethod === 'DELIVERY' && recipient?.address && (
                  <>
                    <br />
                    ({recipient.zipCode}) {recipient.address} {recipient.addressDetail}
                  </>
                )}
              </Typography>
            </Stack>
          </Box>

          {/* Payment Summary */}
          <Box
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                결제 금액
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: 'primary.main',
                }}
              >
                {totalAmount.toLocaleString()}원
              </Typography>
            </Box>
          </Box>

          {/* Notice */}
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              • 예매 확인 메일이 발송되었습니다.
              <br />
              • 취소 및 환불은 마이페이지에서 가능합니다.
              <br />• 공연 관련 문의: help@kalendar.com
            </Typography>
          </Box>
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
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleClose}
          sx={{
            py: 2,
            bgcolor: 'primary.main',
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          확인
        </Button>
      </Box>
    </Box>
  );
}
