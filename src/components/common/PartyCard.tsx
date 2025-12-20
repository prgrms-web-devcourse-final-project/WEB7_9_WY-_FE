'use client';

import { Box, ButtonBase, Chip, Typography, Avatar } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import PlaceIcon from '@mui/icons-material/Place';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import DirectionsSubwayIcon from '@mui/icons-material/DirectionsSubway';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import PersonIcon from '@mui/icons-material/Person';
import type { TransportType, Gender } from '@/types';

interface PartyCardProps {
  id: string;
  title: string;
  type: 'LEAVE' | 'ARRIVE';
  status: 'RECRUITING' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';
  eventName: string;
  venueName?: string;
  departure: string;
  arrival: string;
  transportType?: TransportType;
  currentMembers: number;
  maxMembers: number;
  leaderNickname?: string;
  leaderAge?: number;
  leaderGender?: Gender;
  isMyParty?: boolean;
  isApplied?: boolean;
  onClick?: () => void;
}

const transportIcons: Record<TransportType, React.ReactNode> = {
  TAXI: <LocalTaxiIcon sx={{ fontSize: 14 }} />,
  CARPOOL: <DriveEtaIcon sx={{ fontSize: 14 }} />,
  SUBWAY: <DirectionsSubwayIcon sx={{ fontSize: 14 }} />,
  BUS: <DirectionsBusIcon sx={{ fontSize: 14 }} />,
  WALK: <DirectionsWalkIcon sx={{ fontSize: 14 }} />,
};

const transportLabels: Record<TransportType, string> = {
  TAXI: '택시',
  CARPOOL: '카풀',
  SUBWAY: '지하철',
  BUS: '버스',
  WALK: '도보',
};

const genderLabels: Record<Gender, string> = {
  MALE: '남',
  FEMALE: '여',
  ANY: '무관',
};

export default function PartyCard({
  title,
  type,
  status,
  eventName,
  venueName,
  departure,
  arrival,
  transportType = 'TAXI',
  currentMembers,
  maxMembers,
  leaderNickname,
  leaderAge,
  leaderGender,
  isMyParty,
  isApplied,
  onClick,
}: PartyCardProps) {
  const theme = useTheme();

  const statusConfig = {
    RECRUITING: {
      label: '모집중',
      bgcolor: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
    },
    CLOSED: {
      label: '모집마감',
      bgcolor: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
    },
    COMPLETED: {
      label: '종료',
      bgcolor: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[500],
    },
    CANCELLED: {
      label: '취소됨',
      bgcolor: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
    },
  };

  const memberPercentage = (currentMembers / maxMembers) * 100;

  // 리더 정보 포맷
  const formatLeaderInfo = () => {
    if (!leaderNickname) return null;
    const parts: string[] = [];
    if (leaderGender && leaderGender !== 'ANY') {
      parts.push(genderLabels[leaderGender]);
    }
    if (leaderAge) {
      parts.push(`${leaderAge}세`);
    }
    return parts.length > 0 ? `${leaderNickname} (${parts.join('/')})` : leaderNickname;
  };

  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${title} - ${type === 'LEAVE' ? '출발팟' : '복귀팟'} 파티, ${statusConfig[status].label}, ${currentMembers}/${maxMembers}명`}
      sx={{
        display: 'block',
        width: '100%',
        minWidth: 0,
        textAlign: 'left',
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 2,
        transition: 'all 0.2s ease',
        boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`,
        border: isMyParty
          ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
          : isApplied
          ? `2px solid ${alpha(theme.palette.warning.main, 0.3)}`
          : '2px solid transparent',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      }}
    >
      {/* Header: Type + Status + Badges */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Party Type Icon & Label */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 0.75,
              bgcolor: type === 'LEAVE'
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.secondary.main, 0.1),
              color: type === 'LEAVE'
                ? theme.palette.primary.main
                : theme.palette.secondary.main,
            }}
          >
            {type === 'LEAVE' ? <DirectionsCarIcon sx={{ fontSize: 14 }} /> : <HomeIcon sx={{ fontSize: 14 }} />}
          </Box>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: type === 'LEAVE' ? theme.palette.primary.main : theme.palette.secondary.main,
            }}
          >
            {type === 'LEAVE' ? '출발팟' : '복귀팟'}
          </Typography>

          {/* Transport Type */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.grey[500], 0.1),
              color: theme.palette.text.secondary,
            }}
          >
            {transportIcons[transportType]}
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
              {transportLabels[transportType]}
            </Typography>
          </Box>
        </Box>

        {/* Status & Special Badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isMyParty && (
            <Chip
              size="small"
              label="내 파티"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          )}
          {isApplied && !isMyParty && (
            <Chip
              size="small"
              label="신청완료"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: alpha(theme.palette.warning.main, 0.15),
                color: theme.palette.warning.dark,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          )}
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

      {/* Event name & Venue */}
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
        {venueName && (
          <Typography
            component="span"
            sx={{ color: 'text.disabled', fontSize: '0.75rem' }}
          >
            {' '}@ {venueName}
          </Typography>
        )}
      </Typography>

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

      {/* Footer: Leader Info + Members */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Leader Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Avatar
            sx={{
              width: 18,
              height: 18,
              bgcolor: alpha(theme.palette.grey[500], 0.2),
            }}
          >
            <PersonIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
          </Avatar>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            {formatLeaderInfo() || '파티장'}
          </Typography>
        </Box>

        {/* Members Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              width: 40,
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
      </Box>
    </ButtonBase>
  );
}
