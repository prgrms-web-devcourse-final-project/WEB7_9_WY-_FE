'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import { MainLayout } from '@/components/layout';
import { GradientButton, EventChip, ArtistAvatar } from '@/components/common';
import { useBookingStore } from '@/stores/bookingStore';
import { performanceApi } from '@/api/client';
import type { SeatSection, ScheduleCategory } from '@/types';

// 회차 정보 인터페이스
interface PerformanceSchedule {
  scheduleId?: number;
  performanceDate?: string;
  startTime?: string;
  PerformanceNo?: number;
  status?: string;
}

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

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { setCurrentEvent, setSections, currentEvent, sections, setSelectedScheduleId } = useBookingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<PerformanceSchedule[]>([]);
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
        const response = await performanceApi.getDetail(performanceId);

        if (response.data) {
          const detail = response.data;
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

          // 회차 정보 설정
          if (detail.schedules && detail.schedules.length > 0) {
            setSchedules(detail.schedules);
            // 첫 번째 예매 가능한 회차를 기본 선택
            const firstAvailable = detail.schedules.find(s => s.status === 'AVAILABLE');
            if (firstAvailable?.scheduleId) {
              setSelectedSchedule(String(firstAvailable.scheduleId));
            }
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

  if (!currentEvent) {
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
  const selectedScheduleInfo = schedules.find(s => String(s.scheduleId) === selectedSchedule);
  const isBookingEnabled = selectedSchedule && selectedScheduleInfo?.status === 'AVAILABLE';

  return (
    <MainLayout hideNavigation>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">이벤트 상세</Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
              <ArtistAvatar
                name={currentEvent.artistName || ''}
                size="large"
              />
              <Box sx={{ flex: 1 }}>
                <EventChip eventType={currentEvent.type} sx={{ mb: 1 }} />
                <Typography variant="h3">{currentEvent.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentEvent.artistName}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CalendarMonthIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    날짜
                  </Typography>
                  <Typography variant="body1">{currentEvent.date}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTimeIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    시간
                  </Typography>
                  <Typography variant="body1">{currentEvent.time}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOnIcon color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    장소
                  </Typography>
                  <Typography variant="body1">{currentEvent.venue}</Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 회차 선택 섹션 */}
        {schedules.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" sx={{ mb: 2 }}>
                회차 선택
              </Typography>
              <RadioGroup value={selectedSchedule} onChange={handleScheduleChange}>
                <Stack spacing={1}>
                  {schedules.map((schedule) => {
                    const statusInfo = getStatusLabel(schedule.status);
                    const isAvailable = schedule.status === 'AVAILABLE';
                    const dateStr = schedule.performanceDate
                      ? new Date(schedule.performanceDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })
                      : '';

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
                                {schedule.PerformanceNo ? `${schedule.PerformanceNo}회차` : dateStr}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {dateStr} {schedule.startTime || ''}
                              </Typography>
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
            </CardContent>
          </Card>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* 버튼 영역 */}
        <Stack spacing={2}>
          <GradientButton
            fullWidth
            onClick={handleBooking}
            disabled={schedules.length > 0 && !isBookingEnabled}
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
