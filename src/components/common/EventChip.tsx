'use client';

import { Chip, ChipProps } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import type { EventType } from '@/types';

interface EventChipProps extends Omit<ChipProps, 'color'> {
  eventType: EventType;
}

const eventTypeLabels: Record<EventType, string> = {
  concert: '콘서트',
  fansign: '팬사인회',
  broadcast: '방송',
  birthday: '생일',
};

export default function EventChip({ eventType, sx, ...props }: EventChipProps) {
  const theme = useTheme();
  const label = eventTypeLabels[eventType];
  const eventColor = theme.palette.event[eventType];
  const isLightBackground = eventType === 'birthday';

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: eventColor,
        color: isLightBackground ? theme.palette.text.primary : theme.palette.common.white,
        fontWeight: 600,
        fontSize: '0.6875rem',
        height: 22,
        borderRadius: 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: alpha(eventColor, 0.85),
        },
        ...sx,
      }}
      {...props}
    />
  );
}
