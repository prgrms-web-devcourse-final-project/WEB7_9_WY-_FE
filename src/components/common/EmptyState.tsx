'use client';

import { Box, Typography, Button, keyframes } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
`;

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        animation: `${fadeIn} 0.6s ease-out`,
      }}
    >
      {icon && (
        <Box
          sx={{
            position: 'relative',
            mb: 3,
          }}
        >
          {/* Background glow effect */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
              animation: `${pulse} 3s infinite ease-in-out`,
            }}
          />
          {/* Icon container */}
          <Box
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: '2px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.3),
              animation: `${float} 3s infinite ease-in-out`,
              '& svg': {
                fontSize: 36,
                color: 'primary.main',
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      )}
      <Typography
        variant="h4"
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 3,
            maxWidth: 280,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
