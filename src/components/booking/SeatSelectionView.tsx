'use client';

import { useState } from 'react';
import { Box, Button, Chip, CircularProgress, Divider, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ArrowBack, AccessTime, EventSeat } from '@mui/icons-material';
import {
  useBookingSessionStore,
  useSelectedSeatsDetails,
  useSelectedSeatsTotal,
  useFormattedRemainingTime,
} from '@/stores/bookingSessionStore';
import SeatMap from './SeatMap';
import SeatLegend from './SeatLegend';
import { notifyBookingCancel } from '@/components/booking/BookingPopup';

interface SeatSelectionViewProps {
  scheduleId: number;
}

const MAX_SEATS = 4;

export default function SeatSelectionView({ scheduleId }: SeatSelectionViewProps) {
  const theme = useTheme();
  const [isHolding, setIsHolding] = useState(false);

  const {
    performanceTitle,
    performanceDate,
    venue,
    performanceSeats,
    selectedSeatIds,
    isLoading,
    error,
    selectSeat,
    deselectSeat,
    holdSeats,
    leaveSession,
    stopPing,
    setStep,
  } = useBookingSessionStore();

  const selectedSeatsDetails = useSelectedSeatsDetails();
  const totalAmount = useSelectedSeatsTotal();
  const remainingTime = useFormattedRemainingTime();

  const handleSeatClick = (seatId: number) => {
    if (selectedSeatIds.includes(seatId)) {
      deselectSeat(seatId);
    } else {
      selectSeat(seatId);
    }
  };

  const handleBack = async () => {
    stopPing();
    await leaveSession(scheduleId);
    notifyBookingCancel();
    window.close();
  };

  const handleNext = async () => {
    if (selectedSeatIds.length === 0) {
      return;
    }

    setIsHolding(true);
    try {
      const success = await holdSeats();
      if (success) {
        setStep('delivery');
      }
    } finally {
      setIsHolding(false);
    }
  };

  if (isLoading) {
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
          좌석 정보를 불러오는 중...
        </Typography>
      </Box>
    );
  }

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) },
            }}
          >
            취소
          </Button>
        </Box>

        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
          좌석 선택
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: remainingTime.includes(':') && parseInt(remainingTime) < 1 ? 'error.main' : 'text.secondary',
          }}
        >
          <AccessTime fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {remainingTime}
          </Typography>
        </Box>
      </Box>

      {/* Performance Info */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600 }}>
          {performanceTitle}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {performanceDate} · {venue}
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Box
          sx={{
            mx: 2,
            mt: 2,
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

      {/* Seat Legend */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <SeatLegend />
      </Box>

      {/* Seat Map */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
        }}
      >
        {performanceSeats.length > 0 ? (
          <SeatMap
            seats={performanceSeats}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={handleSeatClick}
            maxSelection={MAX_SEATS}
          />
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <EventSeat sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              좌석 정보가 없습니다.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer - Selection Summary */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {/* Selected Seats */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            선택한 좌석 ({selectedSeatIds.length}/{MAX_SEATS})
          </Typography>
          {selectedSeatsDetails.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedSeatsDetails.map((seat) => (
                <Chip
                  key={seat.performanceSeatId}
                  label={`${seat.block} ${seat.rowNumber}열 ${seat.seatNumber}번`}
                  size="small"
                  onDelete={() => deselectSeat(seat.performanceSeatId)}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    border: 1,
                    borderColor: 'primary.main',
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled">
              좌석을 선택해주세요
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Price & Action */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              총 결제금액
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

          <Button
            variant="contained"
            size="large"
            disabled={selectedSeatIds.length === 0 || isHolding}
            onClick={handleNext}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: 'primary.main',
              fontWeight: 700,
              '&:disabled': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
                color: alpha(theme.palette.common.white, 0.5),
              },
            }}
          >
            {isHolding ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : '다음'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
