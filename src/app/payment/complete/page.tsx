'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  CheckCircle,
  ContentCopy,
  QrCode2,
  PhoneAndroid,
  LocalShipping,
  LocationOn,
  Home,
  Receipt,
  Download,
} from '@mui/icons-material';
import { useBookingStore } from '@/stores/bookingStore';

export default function PaymentCompletePage() {
  const router = useRouter();
  const theme = useTheme();
  const { bookingData, resetBooking } = useBookingStore();
  const [copied, setCopied] = useState(false);

  const handleCopyBookingNumber = () => {
    if (bookingData?.bookingNumber) {
      navigator.clipboard.writeText(bookingData.bookingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoHome = () => {
    resetBooking();
    router.push('/calendar');
  };

  const handleViewBookings = () => {
    resetBooking();
    router.push('/mypage');
  };

  const handleDownloadTicket = () => {
    // Placeholder for ticket download
    alert('티켓 다운로드 기능은 추후 구현 예정입니다.');
  };

  if (!bookingData) {
    return null;
  }

  const getDeliveryStatusContent = () => {
    if (!bookingData.deliveryInfo) return null;

    switch (bookingData.deliveryInfo.method) {
      case 'mobile':
        return {
          icon: <PhoneAndroid sx={{ fontSize: 40, color: 'success.main' }} />,
          title: '모바일 티켓 발급 완료',
          description: 'SMS와 이메일로 QR 코드가 발송되었습니다.',
          details: [
            '입장 시 QR 코드를 제시해주세요',
            '공연 시작 30분 전부터 입장 가능합니다',
            '티켓은 마이페이지에서 확인 가능합니다',
          ],
        };
      case 'physical':
        return {
          icon: <LocalShipping sx={{ fontSize: 40, color: 'secondary.main' }} />,
          title: '실물 티켓 배송 준비 중',
          description: '배송 준비가 완료되면 배송 추적 번호가 발송됩니다.',
          details: [
            `배송지: ${bookingData.deliveryInfo.address}`,
            '배송 예정일: 공연일 3일 전',
            '배송 조회는 마이페이지에서 가능합니다',
          ],
          trackingNumber: 'CJ12345678901', // Mock tracking number
        };
      case 'pickup':
        return {
          icon: <LocationOn sx={{ fontSize: 40, color: 'primary.main' }} />,
          title: '현장 수령 예약 완료',
          description: '공연 당일 현장에서 티켓을 수령하실 수 있습니다.',
          details: [
            `수령 장소: ${bookingData.venue} 입구`,
            '수령 시간: 공연 시작 2시간 전부터',
            '신분증과 예매 번호를 지참해주세요',
          ],
        };
      default:
        return null;
    }
  };

  const deliveryStatus = getDeliveryStatusContent();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 2,
            }}
          />
          <Typography
            variant="h3"
            color="text.primary"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            예매가 완료되었습니다!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            예매 내역은 마이페이지에서 확인할 수 있습니다
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Booking Number */}
          <Paper
            sx={{
              p: 4,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              예매 번호
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography
                variant="h4"
                color="primary.main"
                sx={{
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                }}
              >
                {bookingData.bookingNumber}
              </Typography>
              <Tooltip title={copied ? '복사됨!' : '복사'}>
                <IconButton onClick={handleCopyBookingNumber} size="small">
                  <ContentCopy color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* QR Code & Delivery Status */}
          {deliveryStatus && (
            <Paper
              sx={{
                p: 4,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: alpha(theme.palette.success.main, 0.3),
                borderRadius: 3,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {deliveryStatus.icon}
                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                  {deliveryStatus.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {deliveryStatus.description}
                </Typography>
              </Box>

              {/* QR Code Placeholder (for mobile tickets) */}
              {bookingData.deliveryInfo?.method === 'mobile' && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 4,
                      borderColor: 'success.main',
                    }}
                  >
                    <QrCode2 sx={{ fontSize: 180, color: 'text.primary' }} />
                  </Box>
                </Box>
              )}

              {/* Delivery Details */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: 1,
                  borderColor: alpha(theme.palette.success.main, 0.2),
                  borderRadius: 2,
                }}
              >
                <Stack spacing={1}>
                  {deliveryStatus.details.map((detail, index) => (
                    <Typography key={index} variant="body2" color="text.secondary">
                      • {detail}
                    </Typography>
                  ))}
                  {deliveryStatus.trackingNumber && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        배송 추적 번호
                      </Typography>
                      <Typography
                        variant="body1"
                        color="secondary.main"
                        sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                      >
                        {deliveryStatus.trackingNumber}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Paper>
          )}

          {/* Booking Details */}
          <Paper
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: alpha(theme.palette.secondary.main, 0.3),
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 700, mb: 3 }}>
              예매 상세 정보
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  공연
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                  {bookingData.eventName}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  일시
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {bookingData.date} {bookingData.time}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  장소
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {bookingData.venue}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  구역
                </Typography>
                <Chip
                  label={bookingData.sectionName}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.2),
                    color: 'secondary.main',
                    border: 1,
                    borderColor: 'secondary.main',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body2" color="text.secondary">
                  좌석
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end' }}>
                  {bookingData.seats.map((seat, index) => (
                    <Chip
                      key={index}
                      label={seat}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: 'success.main',
                        border: 1,
                        borderColor: 'success.main',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'divider' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
                  결제금액
                </Typography>
                <Typography
                  variant="h5"
                  color="primary.main"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {bookingData.totalPrice.toLocaleString()}원
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleViewBookings}
                startIcon={<Receipt />}
              >
                예매 내역
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={handleDownloadTicket}
                startIcon={<Download />}
              >
                티켓 다운로드
              </Button>
            </Box>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={handleGoHome}
              startIcon={<Home />}
            >
              홈으로
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
