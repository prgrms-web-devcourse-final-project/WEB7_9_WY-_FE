'use client';

import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export default function SeatLegend() {
  const theme = useTheme();

  const legendItems = [
    {
      label: '선택가능',
      bg: alpha(theme.palette.common.white, 0.1),
      border: alpha(theme.palette.common.white, 0.3),
    },
    {
      label: '선택됨',
      bg: theme.palette.primary.main,
      border: theme.palette.primary.dark,
    },
    {
      label: '매진',
      bg: alpha(theme.palette.error.main, 0.3),
      border: theme.palette.error.main,
    },
    {
      label: '선택불가',
      bg: alpha(theme.palette.grey[500], 0.2),
      border: theme.palette.grey[600],
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center',
        py: 2,
      }}
    >
      {legendItems.map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: 0.5,
              bgcolor: item.bg,
              border: 1,
              borderColor: item.border,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
