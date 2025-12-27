'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import TimerIcon from '@mui/icons-material/Timer';
import { MainLayout } from '@/components/layout';
import { GradientButton, EventChip } from '@/components/common';
import { useBookingStore } from '@/stores/bookingStore';
import { authApi } from '@/api/client';
import type { SeatSection, ScheduleCategory } from '@/types';
import type { components } from '@/api/types';

// API 타입 별칭
type PerformanceDetailResponse = components['schemas']['PerformanceDetailResponse'];

// 스케줄 상태 한글 변환
const getStatusLabel = (status?: string): { label: string; color: 'success' | 'warning' | 'error' | 'default' } => {
  switch (status) {
    case 'AVAILABLE':
      return { label: '예매 가능', color: 'success' };
    case 'SOLD_OUT':
      return { label: '매진', color: 'error' };
    case 'READY':
      return { label: '준비중', color: 'warning' };
    case 'CLOSED':
      return { label: '마감', color: 'default' };
    case 'CANCELLED':
      return { label: '취소됨', color: 'error' };
    default:
      return { label: '확인중', color: 'default' };
  }
};

// 스케줄 카테고리별 버튼 텍스트
const getCategoryButtonText = (category?: ScheduleCategory): string => {
  switch (category) {
    case 'CONCERT':
    case 'FAN_MEETING':
    case 'FESTIVAL':
    case 'AWARD_SHOW':
    case 'FAN_SIGN':
      return '예매하기';
    case 'BIRTHDAY':
    case 'ANNIVERSARY':
    case 'ONLINE_RELEASE':
    case 'LIVE_STREAM':
      return '알림 설정';
    case 'BROADCAST':
      return '방송 정보 보기';
    default:
      return '예매하기';
  }
};

// 날짜 포맷팅 함수
const formatDateRange = (startDate?: string, endDate?: string): string => {
  if (!startDate) return '';

  const start = new Date(startDate);
  const startStr = start.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!endDate || startDate === endDate) {
    return startStr;
  }

  const end = new Date(endDate);
  const endStr = end.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `${startStr} ~ ${endStr}`;
};

// 러닝타임 포맷팅
const formatRunningTime = (minutes?: number): string => {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}시간 ${mins}분`;
  } else if (hours > 0) {
    return `${hours}시간`;
  }
  return `${mins}분`;
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { setCurrentEvent, setSections, currentEvent, sections, setSelectedScheduleId } = useBookingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceDetail, setPerformanceDetail] = useState<PerformanceDetailResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  // eventCategory를 나중에 API 응답에서 설정할 수 있도록 유지
  const [eventCategory] = useState<ScheduleCategory | undefined>(undefined);

  // Default seat sections (used when API doesn't provide them)
  const defaultSeatSections: SeatSection[] = [
    { id: 'vip', name: 'VIP석', price: 220000, color: '#FFD700', availableSeats: 0, totalSeats: 0 },
    { id: 'r', name: 'R석', price: 176000, color: '#FF6B6B', availableSeats: 0, totalSeats: 0 },
    { id: 's', name: 'S석', price: 143000, color: '#4ECDC4', availableSeats: 0, totalSeats: 0 },
    { id: 'a', name: 'A석', price: 110000, color: '#95E1D3', availableSeats: 0, totalSeats: 0 },
  ];

  useEffect(() => {
    const fetchPerformanceDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const performanceId = Number(eventId);
        const response = await authApi.GET('/api/v1/performance/{performanceId}', {
          params: { path: { performanceId } }
        });

        if (response.data) {
          const detail = response.data;
          setPerformanceDetail(detail);

          // Convert API response to KalendarEvent format for booking store
          const event = {
            id: String(performanceId),
            title: detail.title || '',
            date: detail.startDate || '',
            time: '', // Time info is in schedules
            type: 'concert' as const,
            artistId: String(detail.artist?.artistId || ''),
            artistName: detail.artist?.artistName || '',
            venue: detail.performanceHall?.name || '',
          };
          setCurrentEvent(event);

          // availableDates가 있으면 첫 번째 날짜 선택
          if (detail.availableDates && detail.availableDates.length > 0) {
            setSelectedDate(detail.availableDates[0]);
          }

          // priceGrades를 섹션으로 변환
          if (detail.priceGrades && detail.priceGrades.length > 0) {
            const apiSections: SeatSection[] = detail.priceGrades.map((grade, index) => {
              const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#9B59B6'];
              return {
                id: String(grade.priceGradeId || index),
                name: grade.gradeName || `등급 ${index + 1}`,
                price: grade.price || 0,
                color: colors[index % colors.length],
                availableSeats: 0,
                totalSeats: 0,
              };
            });
            setSections(apiSections);
          } else {
            setSections(defaultSeatSections);
          }
        } else {
          setError('공연 정보를 찾을 수 없습니다');
        }
      } catch (err) {
        console.error('Failed to fetch performance detail:', err);
        setError('공연 정보를 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, setCurrentEvent, setSections]);

  // 선택된 날짜에 해당하는 회차 목록 필터링
  const filteredSchedules = useMemo(() => {
    if (!performanceDetail?.schedules || !selectedDate) return [];
    return performanceDetail.schedules.filter(
      (schedule) => schedule.performanceDate === selectedDate
    );
  }, [performanceDetail?.schedules, selectedDate]);

  // 날짜 변경 시 회차 선택 초기화
  useEffect(() => {
    if (filteredSchedules.length > 0) {
      const firstAvailable = filteredSchedules.find(s => s.status === 'AVAILABLE');
      if (firstAvailable?.scheduleId) {
        setSelectedSchedule(String(firstAvailable.scheduleId));
      } else if (filteredSchedules[0]?.scheduleId) {
        setSelectedSchedule(String(filteredSchedules[0].scheduleId));
      }
    } else {
      setSelectedSchedule('');
    }
  }, [filteredSchedules]);

  const handleDateChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDate: string | null
  ) => {
    if (newDate !== null) {
      setSelectedDate(newDate);
    }
  };

  const handleScheduleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSchedule(event.target.value);
  };

  if (isLoading) {
    return (
      <MainLayout hideNavigation>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout hideNavigation>
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </MainLayout>
    );
  }

  if (!currentEvent || !performanceDetail) {
    return null;
  }

  const handleBooking = () => {
    // 선택한 회차 정보를 스토어에 저장
    if (selectedSchedule && setSelectedScheduleId) {
      setSelectedScheduleId(Number(selectedSchedule));
    }
    router.push(`/event/${eventId}/seat-section`);
  };

  const handleFindParty = () => {
    // 스케줄 ID로 파티 찾기 페이지로 이동
    if (selectedSchedule) {
      router.push(`/party?scheduleId=${selectedSchedule}`);
    } else {
      router.push(`/party?eventId=${eventId}`);
    }
  };

  // 선택된 회차 정보 가져오기
  const selectedScheduleInfo = filteredSchedules.find(s => String(s.scheduleId) === selectedSchedule);
  const isBookingEnabled = selectedSchedule && selectedScheduleInfo?.status === 'AVAILABLE';

  return (
    <MainLayout hideNavigation>
      <Box sx={{ p: 2 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">공연 상세</Typography>
        </Box>

        {/* 공연 정보 카드 */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {/* 포스터 이미지 */}
            <Box
              component="img"
              src={performanceDetail.posterImageUrl || '/placeholder-poster.png'}
              alt={performanceDetail.title || '공연 포스터'}
              sx={{
                width: 120,
                height: 160,
                borderRadius: 1,
                objectFit: 'cover',
                bgcolor: 'grey.200',
                flexShrink: 0,
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />

            {/* 공연 정보 */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <EventChip eventType={currentEvent.type} sx={{ mb: 1 }} />
              <Typography variant="h3" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                {performanceDetail.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {performanceDetail.artist?.artistName}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* 상세 정보 */}
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarMonthIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  공연기간
                </Typography>
                <Typography variant="body2">
                  {formatDateRange(performanceDetail.startDate, performanceDetail.endDate)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationOnIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  공연장
                </Typography>
                <Typography variant="body2">
                  {performanceDetail.performanceHall?.name || '-'}
                </Typography>
              </Box>
            </Box>

            {performanceDetail.runningTime && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TimerIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    공연시간
                  </Typography>
                  <Typography variant="body2">
                    {formatRunningTime(performanceDetail.runningTime)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>

        {/* 날짜 선택 섹션 */}
        {performanceDetail.availableDates && performanceDetail.availableDates.length > 0 && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              날짜 선택
            </Typography>
            <ToggleButtonGroup
              value={selectedDate}
              exclusive
              onChange={handleDateChange}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButton-root': {
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  px: 2,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              {performanceDetail.availableDates.map((date) => {
                const dateObj = new Date(date);
                const dayStr = dateObj.toLocaleDateString('ko-KR', { weekday: 'short' });
                const dateStr = dateObj.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

                return (
                  <ToggleButton key={date} value={date}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {dateStr}
                      </Typography>
                      <Typography variant="caption" color="inherit">
                        ({dayStr})
                      </Typography>
                    </Box>
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* 회차 선택 섹션 */}
        {selectedDate && filteredSchedules.length > 0 && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              회차 선택
            </Typography>
            <RadioGroup value={selectedSchedule} onChange={handleScheduleChange}>
              <Stack spacing={1}>
                {filteredSchedules.map((schedule) => {
                  const statusInfo = getStatusLabel(schedule.status);
                  const isAvailable = schedule.status === 'AVAILABLE';

                  return (
                    <Box
                      key={schedule.scheduleId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 1,
                        border: 1,
                        borderColor: selectedSchedule === String(schedule.scheduleId) ? 'primary.main' : 'divider',
                        bgcolor: selectedSchedule === String(schedule.scheduleId) ? 'action.selected' : 'transparent',
                        opacity: isAvailable ? 1 : 0.6,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => isAvailable && setSelectedSchedule(String(schedule.scheduleId))}
                    >
                      <FormControlLabel
                        value={String(schedule.scheduleId)}
                        control={<Radio disabled={!isAvailable} />}
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {schedule.PerformanceNo ? `${schedule.PerformanceNo}회차` : schedule.startTime || '시간 미정'}
                            </Typography>
                            {schedule.startTime && schedule.PerformanceNo && (
                              <Typography variant="caption" color="text.secondary">
                                {schedule.startTime}
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ flex: 1, m: 0 }}
                      />
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        variant={isAvailable ? 'filled' : 'outlined'}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </RadioGroup>
          </Box>
        )}

        {/* 좌석 정보 */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: 1,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            좌석 정보
          </Typography>
          <Stack spacing={1}>
            {(sections.length > 0 ? sections : defaultSeatSections).map((section) => (
              <Box
                key={section.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: section.color,
                    }}
                  />
                  <Typography variant="body1">{section.name}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" fontWeight={600}>
                    {section.price.toLocaleString()}원
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    잔여 {section.availableSeats}석
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* 버튼 영역 */}
        <Stack spacing={2}>
          <GradientButton
            fullWidth
            onClick={handleBooking}
            disabled={!selectedDate || !isBookingEnabled}
            sx={{ py: 2 }}
          >
            {getCategoryButtonText(eventCategory)}
          </GradientButton>

          {/* 파티 찾기 버튼 */}
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            startIcon={<GroupsIcon />}
            onClick={handleFindParty}
            sx={{ py: 1.5 }}
          >
            파티 찾기
          </Button>
        </Stack>
      </Box>
    </MainLayout>
  );
}
