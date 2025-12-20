'use client';

import { useRouter } from 'next/navigation';
import { Box, Typography, Stack, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export default function PageHeader({ title, subtitle, action, showBack, onBack }: PageHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        mb: 4,
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        {showBack && (
          <IconButton
            onClick={handleBack}
            size="small"
            sx={{
              mt: 0.5,
              color: theme.palette.text.secondary,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.15),
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <Box>
          <Typography variant="h4" fontWeight="bold">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {action && (
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          {action}
        </Stack>
      )}
    </Box>
  );
}
