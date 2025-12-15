'use client';

import { Box, ButtonBase, Chip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';

interface PartyCardProps {
  id: string;
  title: string;
  type: 'departure' | 'return';
  status: 'recruiting' | 'confirmed' | 'closed';
  eventName: string;
  eventDate?: string;
  departure: string;
  arrival: string;
  departureTime?: string;
  currentMembers: number;
  maxMembers: number;
  onClick?: () => void;
}

export default function PartyCard({
  title,
  type,
  status,
  eventName,
  eventDate,
  departure,
  arrival,
  departureTime,
  currentMembers,
  maxMembers,
  onClick,
}: PartyCardProps) {
  const theme = useTheme();

  const statusConfig = {
    recruiting: {
      label: '모집중',
      bgcolor: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
    },
    confirmed: {
      label: '확정',
      bgcolor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
    },
    closed: {
      label: '마감',
      bgcolor: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[500],
    },
  };

  const memberPercentage = (currentMembers / maxMembers) * 100;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  };

  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${title} - ${type === 'departure' ? '출발' : '귀가'} 파티, ${statusConfig[status].label}, ${currentMembers}/${maxMembers}명`}
      sx={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 2,
        transition: 'all 0.2s ease',
        boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`,
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      }}
    >
      {/* Header: Type + Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 0.75,
              bgcolor: type === 'departure'
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.secondary.main, 0.1),
              color: type === 'departure'
                ? theme.palette.primary.main
                : theme.palette.secondary.main,
            }}
          >
            {type === 'departure' ? <DirectionsCarIcon sx={{ fontSize: 14 }} /> : <HomeIcon sx={{ fontSize: 14 }} />}
          </Box>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: type === 'departure' ? theme.palette.primary.main : theme.palette.secondary.main,
            }}
          >
            {type === 'departure' ? '출발' : '귀가'}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={statusConfig[status].label}
          sx={{
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 600,
            bgcolor: statusConfig[status].bgcolor,
            color: statusConfig[status].color,
            '& .MuiChip-label': { px: 1 },
          }}
        />
      </Box>

      {/* Title */}
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>

      {/* Event name */}
      <Typography
        sx={{
          color: 'text.secondary',
          mb: 1,
          fontSize: '0.75rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {eventName}
      </Typography>

      {/* Date and Time + Route - 같은 줄에 배치 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
        {eventDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              {formatDate(eventDate)}
            </Typography>
          </Box>
        )}
        {departureTime && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              {departureTime}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Route Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <PlaceIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
        <Typography sx={{ fontSize: '0.75rem', color: 'text.primary' }}>
          {departure}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>→</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.primary' }}>
          {arrival}
        </Typography>
      </Box>

      {/* Members Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>
            {currentMembers}/{maxMembers}명
          </Typography>
        </Box>
        <Box
          role="progressbar"
          aria-valuenow={currentMembers}
          aria-valuemin={0}
          aria-valuemax={maxMembers}
          aria-label={`파티 인원 ${currentMembers}/${maxMembers}명`}
          sx={{
            width: 50,
            height: 3,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.divider, 0.3),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${memberPercentage}%`,
              height: '100%',
              borderRadius: 1.5,
              bgcolor: memberPercentage >= 100
                ? theme.palette.error.main
                : memberPercentage >= 80
                ? theme.palette.warning.main
                : theme.palette.success.main,
            }}
          />
        </Box>
      </Box>
    </ButtonBase>
  );
}
