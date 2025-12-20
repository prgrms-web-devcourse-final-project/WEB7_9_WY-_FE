'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import GroupsIcon from '@mui/icons-material/Groups';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { MainLayout } from '@/components/layout';
import { EventChip, ArtistAvatar } from '@/components/common';
import UpcomingEventsSidebar from '@/components/kalendar/UpcomingEventsSidebar';
import NotificationPreferenceModal from '@/components/kalendar/NotificationPreferenceModal';
import { useArtistStore } from '@/stores/artistStore';
import { useEffectiveSelectedArtists } from '@/hooks/useEffectiveSelectedArtists';
import { getArtistColor } from '@/lib/artistColors';
import { scheduleApi } from '@/api/client';
import type { KalendarEvent, EventType, MonthlySchedule, UpcomingEvent, ScheduleCategory } from '@/types';
import { useRouter } from 'next/navigation';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// Helper: Convert ScheduleCategory to EventType
const scheduleToEventType = (category: ScheduleCategory): EventType => {
  const mapping: Record<ScheduleCategory, EventType> = {
    'CONCERT': 'concert',
    'FAN_MEETING': 'fansign',
    'FAN_SIGN': 'fansign',
    'BROADCAST': 'broadcast',
    'ONLINE_RELEASE': 'broadcast',
    'BIRTHDAY': 'birthday',
    'FESTIVAL': 'festival',
    'AWARD_SHOW': 'award',
    'ANNIVERSARY': 'anniversary',
    'LIVE_STREAM': 'livestream',
    'ETC': 'other',
  };
  return mapping[category] || 'concert';
};

// Helper: Convert MonthlySchedule to KalendarEvent
const monthlyToKalendarEvent = (schedule: MonthlySchedule): KalendarEvent => {
  // ISO 문자열에서 직접 날짜/시간 추출 (타임존 변환 방지)
  const [datePart, timePart] = schedule.scheduleTime.split('T');
  const [hours, minutes] = (timePart || '00:00').split(':');
  return {
    id: String(schedule.scheduleId),
    title: schedule.title,
    date: datePart,
    time: `${hours}:${minutes}`,
    type: scheduleToEventType(schedule.scheduleCategory),
    artistId: String(schedule.artistId),
    artistName: schedule.artistName,
    venue: schedule.location,
  };
};

export default function KalendarPage() {
  const router = useRouter();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const {
    effectiveArtists: effectiveSelectedArtists,
    isHydrated,
    isLoggedIn,
    isGuestMode,
  } = useEffectiveSelectedArtists();
  const { artists: storeArtists, fetchArtists } = useArtistStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<KalendarEvent | null>(null);
  const [filterArtists, setFilterArtists] = useState<string[]>([]);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState<Record<string, boolean>>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [monthlySchedules, setMonthlySchedules] = useState<MonthlySchedule[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 아티스트 목록이 없으면 가져오기
  useEffect(() => {
    if (storeArtists.length === 0) {
      fetchArtists();
    }
  }, [storeArtists.length, fetchArtists]);

  useEffect(() => {
    // setArtists(mockArtists); // TODO: implement setArtists in artistStore
    setFilterArtists(effectiveSelectedArtists);
  }, [effectiveSelectedArtists]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch calendar data from API
  useEffect(() => {
    const fetchCalendarData = async () => {
      // Hydration 완료 전이거나 게스트 모드면 API 호출 안함 (401 에러 방지)
      if (!isHydrated || (isGuestMode && !isLoggedIn)) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const artistId = filterArtists.length === 1 ? Number(filterArtists[0]) : undefined;
        const response = await scheduleApi.getFollowing({
          year,
          month: month + 1, // API expects 1-12, JS Date uses 0-11
          artistId,
        });

        if (response.data) {
          setMonthlySchedules((response.data.monthlySchedules || []) as MonthlySchedule[]);
          setUpcomingEvents((response.data.upcomingEvents || []) as UpcomingEvent[]);
        }
      } catch (err) {
        console.error('Failed to fetch calendar data:', err);
        setError('일정을 불러오는데 실패했습니다');
        // Fallback to mock data on error
        setMonthlySchedules([]);
        setUpcomingEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [year, month, filterArtists, isGuestMode, isLoggedIn, isHydrated]);

  const kalendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: number; events: KalendarEvent[] } | null> = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Use API data only (no mock data fallback)
    const sourceEvents = monthlySchedules.map(monthlyToKalendarEvent);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = sourceEvents.filter(
        (event) =>
          event.date === dateStr &&
          (filterArtists.length === 0 || filterArtists.includes(event.artistId))
      );
      days.push({ date: day, events: dayEvents });
    }

    return days;
  }, [year, month, filterArtists, monthlySchedules]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleArtistFilter = (artistId: string) => {
    setFilterArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    );
  };

  const handleToggleNotification = (eventId: string) => {
    const currentState = notificationEnabled[eventId] || false;
    const newState = !currentState;
    setNotificationEnabled((prev) => ({ ...prev, [eventId]: newState }));
    setToastMessage(newState ? '알림이 설정되었습니다' : '알림이 해제되었습니다');
    setToastOpen(true);
  };

  const today = new Date();
  const isToday = (day: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate();

  // API에서 가져온 아티스트 사용 (no mock data fallback)
  const displayArtists = storeArtists;
  const followingArtists = displayArtists.filter((a) =>
    effectiveSelectedArtists.includes(a.id)
  );

  // 필터링된 아티스트 이름 목록 (upcomingEvents 필터링용)
  const filterArtistNames = useMemo(() => {
    return displayArtists
      .filter((a) => filterArtists.includes(a.id))
      .map((a) => a.name);
  }, [displayArtists, filterArtists]);

  // Helper function to get event type color from theme
  const getEventTypeColor = (eventType: EventType) => {
    return theme.palette.event[eventType];
  };

  // Kalendar content component
  const KalendarContent = () => (
    <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, bgcolor: 'background.paper' }}>
      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              캘린더
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              팔로우한 아티스트의 일정을 확인하세요
            </Typography>
          </Box>
          {/* 내 아티스트 관리 버튼 */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<PeopleIcon sx={{ fontSize: 18 }} />}
            onClick={() => {
              if (!isLoggedIn) {
                router.push('/login?redirect=/artists');
              } else {
                router.push('/artists');
              }
            }}
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.5),
              color: theme.palette.primary.main,
              fontSize: '0.875rem',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            아티스트 관리
          </Button>
        </Box>
      </Box>

      {/* Artist Filter */}
      {followingArtists.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 2,
            mb: { xs: 2, md: 3 },
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {followingArtists.map((artist) => {
            const isSelected = filterArtists.includes(artist.id);
            const artistColor = getArtistColor(artist.name);
            return (
              <Chip
                key={artist.id}
                avatar={
                  <ArtistAvatar
                    name={artist.name}
                    shortName={artist.shortName}
                    size="xsmall"
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: '0.625rem',
                      border: 'none',
                      color: '#FFFFFF',
                    }}
                  />
                }
                label={artist.name}
                onClick={() => handleArtistFilter(artist.id)}
                sx={{
                  flexShrink: 0,
                  height: { xs: 32, sm: 36 },
                  pl: 0.5,
                  borderRadius: '999px',
                  bgcolor: 'background.paper',
                  color: isSelected ? artistColor : 'text.primary',
                  border: isSelected ? '2px solid' : '1.5px solid',
                  borderColor: isSelected ? artistColor : 'divider',
                  fontWeight: isSelected ? 600 : 500,
                  '&:hover': {
                    borderColor: artistColor,
                  },
                  '& .MuiChip-avatar': {
                    ml: 0.5,
                  },
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Month Navigation - Left aligned */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: { xs: 2, md: 3 },
        }}
      >
        <IconButton
          onClick={handlePrevMonth}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h4" color="text.primary">
          {year}년 {month + 1}월
        </Typography>
        <IconButton
          onClick={handleNextMonth}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Day Headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: { xs: 0, sm: 0.5 },
          mb: { xs: 0.5, sm: 1 },
        }}
      >
        {DAYS.map((day, index) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              minWidth: 0,
              color: index === 0 ? 'error.main' : index === 6 ? 'info.main' : 'text.secondary',
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: { xs: '1px', sm: 0.5 },
        }}
      >
        {kalendarDays.map((day, index) => (
          <Box
            key={index}
            sx={{
              minHeight: { xs: 52, sm: 70, md: 90 },
              minWidth: 0,
              p: { xs: 0.25, sm: 0.5 },
              bgcolor: day ? 'background.paper' : 'transparent',
              borderRadius: { xs: 0.5, sm: 1 },
              border: day && isToday(day.date) ? '2px solid' : '1px solid',
              borderColor: day && isToday(day.date) ? 'primary.main' : 'divider',
              transition: 'all 0.2s ease',
              '&:hover': day ? {
                borderColor: 'primary.main',
                bgcolor: 'background.paper',
              } : {},
            }}
          >
            {day && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isToday(day.date) ? 700 : 400,
                    color:
                      index % 7 === 0
                        ? 'error.main'
                        : index % 7 === 6
                        ? 'info.main'
                        : isToday(day.date)
                        ? 'primary.main'
                        : 'text.primary',
                  }}
                >
                  {day.date}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.25, overflow: 'hidden' }}>
                  {day.events.slice(0, isDesktop ? 2 : 1).map((event) => (
                    <Box
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          opacity: 0.8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          minWidth: 6,
                          borderRadius: '50%',
                          bgcolor: getEventTypeColor(event.type),
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: isDesktop ? 11 : 10,
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.2,
                        }}
                      >
                        {event.title}
                      </Typography>
                    </Box>
                  ))}
                  {day.events.length > (isDesktop ? 2 : 1) && (
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                      +{day.events.length - (isDesktop ? 2 : 1)}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        ))}
      </Box>

      {/* Event Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        {([
          { type: 'concert' as EventType, label: '콘서트' },
          { type: 'fansign' as EventType, label: '팬사인회' },
          { type: 'broadcast' as EventType, label: '방송' },
          { type: 'birthday' as EventType, label: '생일' },
          { type: 'festival' as EventType, label: '페스티벌' },
          { type: 'award' as EventType, label: '시상식' },
        ]).map(({ type, label }) => (
          <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: { xs: 6, sm: 8 },
                height: { xs: 6, sm: 8 },
                borderRadius: '50%',
                bgcolor: getEventTypeColor(type),
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <MainLayout maxWidth={false}>
      {/* Desktop: 70/30 Layout */}
      {isDesktop ? (
        <Box
          sx={{
            display: 'flex',
            height: 'calc(100vh - 56px)',
            gap: 0,
            mx: -3,
            mt: -2,
          }}
        >
          {/* Calendar Section - flexible */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              bgcolor: 'background.paper',
              pl: 3,
            }}
          >
            <KalendarContent />
          </Box>

          {/* Upcoming Events Sidebar - responsive width */}
          <Box
            sx={{
              width: '100%',
              maxWidth: isLargeDesktop ? 420 : 320,
              flexShrink: 0,
              bgcolor: 'background.paper',
              borderLeft: 1,
              borderColor: 'divider',
              overflow: 'hidden',
              transition: 'max-width 0.3s ease',
            }}
          >
            <UpcomingEventsSidebar
              upcomingEvents={upcomingEvents}
              selectedArtistIds={filterArtists}
              selectedArtistNames={filterArtistNames}
              isLoading={isLoading}
            />
          </Box>
        </Box>
      ) : (
        /* Mobile: Kalendar + Upcoming Events below */
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <KalendarContent />

          {/* Mobile Upcoming Events Section */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              mt: 2,
            }}
          >
            <UpcomingEventsSidebar
              upcomingEvents={upcomingEvents}
              selectedArtistIds={filterArtists}
              selectedArtistNames={filterArtistNames}
              isLoading={isLoading}
            />
          </Box>
        </Box>
      )}

      {/* Event Detail Modal - Redesigned */}
      <Dialog
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        {selectedEvent && (
          <>
            {/* Header with icon buttons */}
            <DialogTitle sx={{ pb: 1, pr: 1 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                  <ArtistAvatar
                    name={selectedEvent.artistName || ''}
                    size="small"
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h4"
                      color="text.primary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {selectedEvent.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <EventChip eventType={selectedEvent.type} />
                      <Typography variant="caption" color="text.secondary">
                        {selectedEvent.artistName}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                {/* Icon buttons on the right */}
                <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleNotification(selectedEvent.id)}
                    sx={{
                      color: notificationEnabled[selectedEvent.id]
                        ? 'primary.main'
                        : 'text.secondary',
                      bgcolor: notificationEnabled[selectedEvent.id]
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                      },
                    }}
                  >
                    {notificationEnabled[selectedEvent.id] ? (
                      <NotificationsActiveIcon fontSize="small" />
                    ) : (
                      <NotificationsOffIcon fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedEvent(null)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.text.secondary, 0.1),
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ pt: 0 }}>
              {/* Simplified info display */}
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {/* Date & Time - Simple row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="body2" color="text.primary">
                    {selectedEvent.date}
                  </Typography>
                  {selectedEvent.time && (
                    <>
                      <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 18, ml: 1 }} />
                      <Typography variant="body2" color="text.primary">
                        {selectedEvent.time}
                      </Typography>
                    </>
                  )}
                </Box>

                {/* Venue - Simple row */}
                {selectedEvent.venue && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2" color="text.primary">
                      {selectedEvent.venue}
                    </Typography>
                  </Box>
                )}

                {/* Price - Simple row */}
                {selectedEvent.price !== undefined && selectedEvent.price > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ConfirmationNumberIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2" color="text.primary">
                      {selectedEvent.price.toLocaleString()}원
                    </Typography>
                  </Box>
                )}
              </Stack>

              {/* Action Buttons - 1 row horizontal layout */}
              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                {selectedEvent.type !== 'birthday' && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ConfirmationNumberIcon />}
                    onClick={() => {
                      setSelectedEvent(null);
                      router.push(`/event/${selectedEvent.id}`);
                    }}
                    sx={{
                      py: 1.25,
                      borderRadius: 2,
                    }}
                  >
                    예매하기
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GroupsIcon />}
                  onClick={() => {
                    setSelectedEvent(null);
                    router.push(`/party?scheduleId=${selectedEvent.id}`);
                  }}
                  sx={{
                    py: 1.25,
                    borderRadius: 2,
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: alpha(theme.palette.secondary.main, 0.08),
                    },
                  }}
                >
                  파티 찾기
                </Button>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="info"
          icon={false}
          sx={{
            width: '100%',
            borderRadius: 2,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '& .MuiAlert-action': {
              color: 'white',
            },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>

      {/* Notification Preference Modal */}
      <NotificationPreferenceModal
        open={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        event={selectedEvent}
      />
    </MainLayout>
  );
}
