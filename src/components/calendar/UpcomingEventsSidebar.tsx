'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import GroupsIcon from '@mui/icons-material/Groups';
import { EventChip, ArtistAvatar } from '@/components/common';
import { mockEvents } from '@/lib/mockData';
import type { UpcomingEvent, EventType, ScheduleCategory } from '@/types';

interface UpcomingEventsSidebarProps {
  upcomingEvents: UpcomingEvent[];
  selectedArtistIds: string[];
  isGuestMode: boolean;
  isLoading: boolean;
}

// Helper: Convert ScheduleCategory to EventType
const scheduleToEventType = (category: ScheduleCategory): EventType => {
  const mapping: Record<ScheduleCategory, EventType> = {
    'CONCERT': 'concert',
    'FAN_SIGN': 'fansign',
    'BROADCAST': 'broadcast',
    'BIRTHDAY': 'birthday',
  };
  return mapping[category] || 'concert';
};

export default function UpcomingEventsSidebar({
  upcomingEvents,
  selectedArtistIds,
  isGuestMode,
  isLoading,
}: UpcomingEventsSidebarProps) {
  const router = useRouter();
  const theme = useTheme();

  // Filter and process events
  const displayEvents = useMemo(() => {
    // Guest mode: use mock data
    if (isGuestMode) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return mockEvents
        .filter((event) => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return (
            eventDate >= today &&
            (selectedArtistIds.length === 0 ||
              selectedArtistIds.includes(event.artistId))
          );
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5)
        .map(event => ({
          ...event,
          scheduleId: Number(event.id),
          scheduleCategory: event.type.toUpperCase() as ScheduleCategory,
          scheduleTime: event.date,
          location: event.venue,
          daysUntilEvent: Math.ceil((new Date(event.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        }));
    }

    // Logged in: use API data
    return upcomingEvents
      .filter((event) =>
        selectedArtistIds.length === 0 ||
        selectedArtistIds.includes(String(event.scheduleId))
      )
      .slice(0, 5);
  }, [upcomingEvents, selectedArtistIds, isGuestMode]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeStr = hours && minutes ? ` ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` : '';
    return `${month}월 ${day}일 (${dayName})${timeStr}`;
  };

  const getDaysUntil = (daysUntilEvent: number) => {
    if (daysUntilEvent === 0) return 'D-DAY';
    if (daysUntilEvent < 0) return '종료';
    return `D-${daysUntilEvent}`;
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.text.secondary,
          p: 3,
        }}
      >
        <CalendarTodayIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="body1">다가오는 일정이 없습니다</Typography>
        <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
          팔로우한 아티스트의 일정이
          <br />
          여기에 표시됩니다
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography
        variant="h4"
        sx={{
          pt: 3,
          pb: 2,
          px: 2,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CalendarTodayIcon sx={{ color: theme.palette.primary.main }} />
        다가오는 일정
      </Typography>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {displayEvents.map((event) => {
            const daysUntil = getDaysUntil(event.daysUntilEvent);
            const isDDay = daysUntil === 'D-DAY';
            const eventType = scheduleToEventType(event.scheduleCategory);

            return (
              <Card
                key={event.scheduleId}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {/* Header: D-Day + Event Type */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: isDDay ? theme.palette.error.main : theme.palette.secondary.main,
                        fontSize: '0.8125rem',
                      }}
                    >
                      {daysUntil}
                    </Typography>
                    <EventChip eventType={eventType} />
                  </Box>

                  {/* Artist Avatar + Title */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <ArtistAvatar
                      name={event.artistName || ''}
                      size="small"
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color="text.primary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.artistName}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Date & Location */}
                  <Stack spacing={0.5} sx={{ mb: 2 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <CalendarTodayIcon
                        sx={{ fontSize: 14, color: theme.palette.text.secondary }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(event.scheduleTime)}
                      </Typography>
                    </Box>
                    {event.location && (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <LocationOnIcon
                          sx={{ fontSize: 14, color: theme.palette.text.secondary }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={1}>
                    {eventType !== 'birthday' && 'performanceId' in event && event.performanceId && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ConfirmationNumberIcon />}
                        onClick={() => router.push(`/event/${event.performanceId}`)}
                        sx={{
                          flex: 1,
                          bgcolor: theme.palette.primary.main,
                          fontSize: '0.75rem',
                          py: 0.75,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        예매하기
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GroupsIcon />}
                      onClick={() =>
                        router.push(`/party?eventId=${event.scheduleId}`)
                      }
                      sx={{
                        flex: 1,
                        borderColor: theme.palette.secondary.main,
                        color: theme.palette.secondary.main,
                        fontSize: '0.75rem',
                        py: 0.75,
                        '&:hover': {
                          borderColor: theme.palette.secondary.light,
                          bgcolor: alpha(theme.palette.secondary.main, 0.08),
                        },
                      }}
                    >
                      파티찾기
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
