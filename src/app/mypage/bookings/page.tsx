'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/common';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useBookingStore } from '@/stores/bookingStore';

export default function BookingsPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const { bookingHistory } = useBookingStore();

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Chip label="예매 확정" color="success" size="small" />;
      case 'pending':
        return <Chip label="결제 대기" color="warning" size="small" />;
      case 'cancelled':
        return <Chip label="취소됨" color="error" size="small" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout hideNavigation>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
          }}
        >
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">예매 내역</Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          {bookingHistory.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
              }}
            >
              <ConfirmationNumberIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h4" color="text.secondary" gutterBottom>
                예매 내역이 없습니다
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                캘린더에서 이벤트를 예매해보세요
              </Typography>
              <Button variant="contained" onClick={() => router.push('/kalendar')}>
                캘린더로 이동
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {bookingHistory.map((booking) => (
                <Card key={booking.bookingNumber}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h4" gutterBottom>
                          {booking.eventName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {booking.sectionName}
                        </Typography>
                      </Box>
                      {getStatusChip(booking.status || 'confirmed')}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {booking.date} {booking.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">{booking.venue}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ConfirmationNumberIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {booking.seats?.join(', ') || '좌석 정보 없음'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.disabled">
                        예매번호: {booking.bookingNumber}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {(booking.totalPrice || 0).toLocaleString()}원
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
}
