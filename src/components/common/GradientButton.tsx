'use client';

import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

interface GradientButtonProps extends ButtonProps {
  loading?: boolean;
}

export default function GradientButton({
  children,
  loading = false,
  disabled,
  sx,
  ...props
}: GradientButtonProps) {
  const theme = useTheme();

  return (
    <Button
      disabled={disabled || loading}
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontWeight: 600,
        py: 1.5,
        px: 3,
        borderRadius: 1.5,
        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
          transform: 'translateY(-1px)',
        },
        '&:disabled': {
          backgroundColor: theme.palette.action.disabledBackground,
          color: theme.palette.action.disabled,
          boxShadow: 'none',
        },
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={24} sx={{ color: 'inherit' }} />
      ) : (
        children
      )}
    </Button>
  );
}
