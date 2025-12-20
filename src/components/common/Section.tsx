'use client';

import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  noBorder?: boolean;
}

export default function Section({ title, children, noBorder = false }: SectionProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 3,
        borderBottom: noBorder ? 'none' : `1px solid ${theme.palette.divider}`,
      }}
    >
      {title && (
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 2,
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
}
