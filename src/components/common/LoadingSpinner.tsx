'use client';

import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={message || '로딩 중'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
        ...(fullScreen && {
          position: 'fixed',
          inset: 0,
          bgcolor: 'background.default',
          zIndex: 9999,
        }),
      }}
    >
      <CircularProgress
        aria-hidden="true"
        sx={{
          color: 'primary.main',
        }}
      />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
