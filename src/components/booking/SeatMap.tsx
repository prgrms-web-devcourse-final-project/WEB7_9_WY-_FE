'use client';

import { useMemo } from 'react';
import { Box, Typography, Tooltip, Theme } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { PerformanceSeatResponse, SeatStatus } from '@/types/booking';

interface SeatMapProps {
  seats: PerformanceSeatResponse[];
  selectedSeatIds: number[];
  onSeatClick: (seatId: number) => void;
  maxSelection?: number;
}

// 좌석 상태별 색상
const getSeatColor = (
  status: SeatStatus,
  isSelected: boolean,
  theme: Theme
) => {
  if (isSelected) {
    return {
      bg: theme.palette.primary.main,
      border: theme.palette.primary.dark,
      text: theme.palette.primary.contrastText,
    };
  }

  switch (status) {
    case 'AVAILABLE':
      return {
        bg: alpha(theme.palette.common.white, 0.1),
        border: alpha(theme.palette.common.white, 0.3),
        text: theme.palette.text.secondary,
      };
    case 'HOLD':
    case 'SOLD':
      return {
        bg: alpha(theme.palette.error.main, 0.3),
        border: theme.palette.error.main,
        text: theme.palette.error.main,
      };
    case 'DISABLED':
      return {
        bg: alpha(theme.palette.grey[500], 0.2),
        border: theme.palette.grey[600],
        text: theme.palette.grey[600],
      };
    default:
      return {
        bg: alpha(theme.palette.grey[500], 0.2),
        border: theme.palette.grey[600],
        text: theme.palette.grey[600],
      };
  }
};

export default function SeatMap({
  seats,
  selectedSeatIds,
  onSeatClick,
  maxSelection = 4,
}: SeatMapProps) {
  const theme = useTheme();

  // 좌석을 층/블록/열 기준으로 그룹화
  const seatGrid = useMemo(() => {
    // 블록별로 그룹화
    const blocks = new Map<string, PerformanceSeatResponse[]>();
    seats.forEach((seat) => {
      const key = `${seat.floor}-${seat.block}`;
      if (!blocks.has(key)) {
        blocks.set(key, []);
      }
      blocks.get(key)!.push(seat);
    });

    // 각 블록 내에서 열별로 정렬 (BE 필드: rowNumber, seatNumber)
    blocks.forEach((blockSeats) => {
      blockSeats.sort((a, b) => {
        if (a.rowNumber !== b.rowNumber) return a.rowNumber - b.rowNumber;
        return a.seatNumber - b.seatNumber;
      });
    });

    return blocks;
  }, [seats]);

  // 블록별로 행 정보 추출 (BE 필드: rowNumber, seatNumber)
  const getRowsInBlock = (blockSeats: PerformanceSeatResponse[]) => {
    const rows = new Map<number, PerformanceSeatResponse[]>();
    blockSeats.forEach((seat) => {
      if (!rows.has(seat.rowNumber)) {
        rows.set(seat.rowNumber, []);
      }
      rows.get(seat.rowNumber)!.push(seat);
    });

    // 좌석번호 기준 정렬
    rows.forEach((rowSeats) => {
      rowSeats.sort((a, b) => a.seatNumber - b.seatNumber);
    });

    return rows;
  };

  const handleSeatClick = (seat: PerformanceSeatResponse) => {
    // 좌석 상태 (BE에서 별도 조회 필요, optional 필드)
    const seatStatus = seat.status || 'AVAILABLE';

    // 선택 불가능한 좌석
    if (seatStatus !== 'AVAILABLE' && !selectedSeatIds.includes(seat.performanceSeatId)) {
      return;
    }

    const isSelected = selectedSeatIds.includes(seat.performanceSeatId);

    // 최대 선택 개수 체크
    if (!isSelected && selectedSeatIds.length >= maxSelection) {
      return;
    }

    onSeatClick(seat.performanceSeatId);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Stage */}
      <Box
        sx={{
          width: '80%',
          mx: 'auto',
          mb: 4,
          py: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 2,
          textAlign: 'center',
          border: 1,
          borderColor: alpha(theme.palette.primary.main, 0.4),
        }}
      >
        <Typography variant="body1" color="primary.main" sx={{ fontWeight: 600 }}>
          STAGE
        </Typography>
      </Box>

      {/* Seat Grid by Blocks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Array.from(seatGrid.entries()).map(([blockKey, blockSeats]) => {
          const [floor, block] = blockKey.split('-');
          const rows = getRowsInBlock(blockSeats);

          return (
            <Box key={blockKey}>
              {/* Block Header */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: 'block', fontWeight: 600 }}
              >
                {floor !== '1' && `${floor}층 `}{block}구역
              </Typography>

              {/* Rows */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {Array.from(rows.entries()).map(([rowNumber, rowSeats]) => (
                  <Box
                    key={`${blockKey}-${rowNumber}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {/* Row Label */}
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{
                        width: 24,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {rowNumber}
                    </Typography>

                    {/* Seats */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.performanceSeatId);
                        const seatStatus = seat.status || 'AVAILABLE';
                        const colors = getSeatColor(seatStatus, isSelected, theme);
                        const isClickable = seatStatus === 'AVAILABLE' || isSelected;
                        const isMaxReached = !isSelected && selectedSeatIds.length >= maxSelection;

                        return (
                          <Tooltip
                            key={seat.performanceSeatId}
                            title={
                              <Box>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                  {seat.rowNumber}열 {seat.seatNumber}번
                                </Typography>
                                {(seat.gradeName || seat.price !== undefined) && (
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    {seat.gradeName || '일반'} - {(seat.price || 0).toLocaleString()}원
                                  </Typography>
                                )}
                                {seatStatus !== 'AVAILABLE' && !isSelected && (
                                  <Typography variant="caption" color="error">
                                    {seatStatus === 'SOLD' ? '판매완료' : '선택불가'}
                                  </Typography>
                                )}
                                {isMaxReached && seatStatus === 'AVAILABLE' && (
                                  <Typography variant="caption" color="warning.main">
                                    최대 {maxSelection}석까지 선택 가능
                                  </Typography>
                                )}
                              </Box>
                            }
                            arrow
                          >
                            <Box
                              onClick={() => handleSeatClick(seat)}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 0.5,
                                bgcolor: colors.bg,
                                border: 1,
                                borderColor: colors.border,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isClickable && !isMaxReached ? 'pointer' : 'not-allowed',
                                opacity: isMaxReached && !isSelected ? 0.5 : 1,
                                transition: 'all 0.15s ease',
                                '&:hover': isClickable && !isMaxReached
                                  ? {
                                      transform: 'scale(1.1)',
                                      boxShadow: `0 0 0 2px ${colors.border}`,
                                    }
                                  : {},
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: colors.text,
                                }}
                              >
                                {seat.seatNumber}
                              </Typography>
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
