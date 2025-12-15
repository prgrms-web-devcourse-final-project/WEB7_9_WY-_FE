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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { MainLayout } from '@/components/layout';
import { GradientButton, EventChip, ArtistAvatar } from '@/components/common';
import { useBookingStore } from '@/stores/bookingStore';
import { performanceApi } from '@/api/client';
import { mockEvents, mockSeatSections } from '@/lib/mockData';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { setCurrentEvent, setSections, currentEvent } = useBookingStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const performanceId = Number(eventId);
        const response = await performanceApi.getDetail(performanceId);

        if (response.data) {
          const detail = response.data;
          // Convert API response to CalendarEvent format for booking store
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
          setSections(mockSeatSections); // TODO: Use actual seat sections from API
        } else {
          // Fallback to mock data
          const event = mockEvents.find((e) => e.id === eventId);
          if (event) {
            setCurrentEvent(event);
            setSections(mockSeatSections);
          }
        }
      } catch (err) {
        console.error('Failed to fetch performance detail:', err);
        setError('공연 정보를 불러오는데 실패했습니다');
        // Fallback to mock data
        const event = mockEvents.find((e) => e.id === eventId);
        if (event) {
          setCurrentEvent(event);
          setSections(mockSeatSections);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceDetail();
  }, [eventId, setCurrentEvent, setSections]);

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
    router.push(`/event/${eventId}/seat-section`);
  };

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

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>
              좌석 정보
            </Typography>
            <Stack spacing={1}>
              {mockSeatSections.map((section) => (
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

        <GradientButton fullWidth onClick={handleBooking} sx={{ py: 2 }}>
          예매하기
        </GradientButton>
      </Box>
    </MainLayout>
  );
}
