'use client';

import { Box, Typography, CircularProgress } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { ConnectionState } from '@/lib/stomp';

interface ChatConnectionStatusProps {
  state: ConnectionState;
  showLabel?: boolean;
}

export function ChatConnectionStatus({
  state,
  showLabel = true,
}: ChatConnectionStatusProps) {
  const theme = useTheme();

  const config: Record<
    ConnectionState,
    {
      icon: React.ElementType | null;
      color: string;
      label: string;
      bgColor: string;
    }
  > = {
    disconnected: {
      icon: WifiOffIcon,
      color: theme.palette.text.disabled,
      label: '연결 끊김',
      bgColor: alpha(theme.palette.action.disabled, 0.1),
    },
    connecting: {
      icon: null,
      color: theme.palette.warning.main,
      label: '연결 중...',
      bgColor: alpha(theme.palette.warning.main, 0.1),
    },
    connected: {
      icon: WifiIcon,
      color: theme.palette.success.main,
      label: '연결됨',
      bgColor: alpha(theme.palette.success.main, 0.1),
    },
    error: {
      icon: ErrorOutlineIcon,
      color: theme.palette.error.main,
      label: '연결 오류',
      bgColor: alpha(theme.palette.error.main, 0.1),
    },
  };

  const { icon: Icon, color, label, bgColor } = config[state];

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: showLabel ? 1.5 : 1,
        py: 0.5,
        borderRadius: 2,
        bgcolor: bgColor,
        transition: 'all 0.2s ease',
      }}
    >
      {state === 'connecting' ? (
        <CircularProgress size={14} sx={{ color }} />
      ) : Icon ? (
        <Icon sx={{ fontSize: 14, color }} />
      ) : null}
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            color,
            fontWeight: 500,
            fontSize: '0.7rem',
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}
