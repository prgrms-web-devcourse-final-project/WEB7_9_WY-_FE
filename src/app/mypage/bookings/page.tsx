'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner, PageHeader, Section, EmptyState } from '@/components/common';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useBookingStore } from '@/stores/bookingStore';

export default function BookingsPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const theme = useTheme();
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
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Page Header */}
        <PageHeader
          title="예매 내역"
          subtitle="예매한 이벤트 티켓을 확인하세요"
          showBack
        />

        {/* Bookings List */}
        <Section title={`예매 (${bookingHistory.length})`} noBorder>
          {bookingHistory.length === 0 ? (
            <EmptyState
              icon={<ConfirmationNumberIcon />}
              title="예매 내역이 없습니다"
              description="캘린더에서 이벤트를 예매해보세요"
              actionLabel="캘린더로 이동"
              onAction={() => router.push('/kalendar')}
            />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {bookingHistory.map((booking) => (
                <Box
                  key={booking.bookingNumber}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: theme.palette.background.paper,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                    },
                  }}
                >
                  {/* Header: Event Name + Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          width: 44,
                          height: 44,
                        }}
                      >
                        <ConfirmationNumberIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>
                          {booking.eventName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {booking.sectionName}
                        </Typography>
                      </Box>
                    </Box>
                    {getStatusChip(booking.status || 'confirmed')}
                  </Box>

                  {/* Details */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {booking.date} {booking.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {booking.venue}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventSeatIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {booking.seats?.join(', ') || '좌석 정보 없음'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Footer: Booking Number + Price */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="caption" color="text.disabled">
                      예매번호: {booking.bookingNumber}
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                      {(booking.totalPrice || 0).toLocaleString()}원
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Section>
      </Box>
    </MainLayout>
  );
}
