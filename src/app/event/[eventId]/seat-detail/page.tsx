'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MainLayout } from '@/components/layout';
import { GradientButton } from '@/components/common';
import { useBookingStore } from '@/stores/bookingStore';
import type { Seat, SeatSection } from '@/types';

// Generate seats for a section (utility function)
const generateSeatsForSection = (section: SeatSection, rows: string[], seatsPerRow: number): Seat[] => {
  const seats: Seat[] = [];
  rows.forEach((row) => {
    for (let i = 1; i <= seatsPerRow; i++) {
      const isAvailable = Math.random() > 0.3;
      seats.push({
        id: `${section.id}-${row}${i}`,
        sectionId: section.id,
        row,
        number: i,
        price: section.price,
        status: isAvailable ? 'available' : 'sold',
      });
    }
  });
  return seats;
};

export default function SeatDetailPage() {
  const router = useRouter();

  const {
    currentEvent,
    selectedSection,
    seats,
    selectedSeats,
    setSeats,
    toggleSeat,
    calculateTotalPrice,
  } = useBookingStore();

  useEffect(() => {
    if (selectedSection && seats.length === 0) {
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const generatedSeats = generateSeatsForSection(selectedSection, rows, 10);
      setSeats(generatedSeats);
    }
  }, [selectedSection, seats.length, setSeats]);

  const seatsByRow = useMemo(() => {
    const grouped: Record<string, typeof seats> = {};
    seats.forEach((seat) => {
      if (!grouped[seat.row]) {
        grouped[seat.row] = [];
      }
      grouped[seat.row].push(seat);
    });
    return grouped;
  }, [seats]);

  if (!currentEvent || !selectedSection) {
    return null;
  }

  const totalPrice = calculateTotalPrice();

  const handlePayment = () => {
    if (selectedSeats.length > 0) {
      router.push('/booking/confirm');
    }
  };

  return (
    <MainLayout hideNavigation>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h2">좌석 선택</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSection.name} - {selectedSection.price.toLocaleString()}원
            </Typography>
          </Box>
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: selectedSection.color, borderRadius: 0.5 }} />
            <Typography variant="caption">선택 가능</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'secondary.main', borderRadius: 0.5 }} />
            <Typography variant="caption">선택됨</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: 'grey.300', borderRadius: 0.5 }} />
            <Typography variant="caption">판매됨</Typography>
          </Box>
        </Stack>

        {/* Stage */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 1,
            textAlign: 'center',
            borderRadius: 1,
            mb: 2,
            fontSize: 12,
          }}
        >
          STAGE
        </Box>

        {/* Seats */}
        <Box
          sx={{
            overflow: 'auto',
            maxHeight: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 2,
            mb: 2,
          }}
        >
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <Box
              key={row}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ width: 20, fontWeight: 600, textAlign: 'center' }}
              >
                {row}
              </Typography>
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.id);
                const isSold = seat.status === 'sold';

                return (
                  <Box
                    key={seat.id}
                    onClick={() => !isSold && toggleSeat(seat.id)}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 0.5,
                      bgcolor: isSold
                        ? 'grey.300'
                        : isSelected
                        ? 'secondary.main'
                        : selectedSection.color,
                      cursor: isSold ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                      '&:hover': {
                        transform: isSold ? 'none' : 'scale(1.1)',
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: 8,
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      {seat.number}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Selected Seats */}
        {selectedSeats.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              선택한 좌석 ({selectedSeats.length}/4)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedSeats.map((seatId) => {
                const seat = seats.find((s) => s.id === seatId);
                return (
                  <Chip
                    key={seatId}
                    label={seat ? `${seat.row}${seat.number}` : seatId}
                    color="secondary"
                    onDelete={() => toggleSeat(seatId)}
                    size="small"
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              총 결제금액
            </Typography>
            <Typography variant="h3" color="secondary.main">
              {totalPrice.toLocaleString()}원
            </Typography>
          </Box>
          <GradientButton
            onClick={handlePayment}
            disabled={selectedSeats.length === 0}
            sx={{ px: 4 }}
          >
            결제하기
          </GradientButton>
        </Box>
      </Box>
    </MainLayout>
  );
}
