'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardActionArea,
  CardContent,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { MainLayout } from '@/components/layout';
import { useBookingStore } from '@/stores/bookingStore';

export default function SeatSectionPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const { sections, selectSection, currentEvent } = useBookingStore();

  const handleSectionSelect = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      selectSection(section);
      router.push(`/event/${eventId}/seat-detail`);
    }
  };

  if (!currentEvent) {
    return null;
  }

  return (
    <MainLayout hideNavigation>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h2">좌석 구역 선택</Typography>
            <Typography variant="body2" color="text.secondary">
              {currentEvent.title}
            </Typography>
          </Box>
        </Box>

        {/* Stage Visual */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            py: 2,
            textAlign: 'center',
            borderRadius: '50% 50% 0 0',
            mb: 3,
          }}
        >
          <Typography variant="h4">STAGE</Typography>
        </Box>

        {/* Seat Sections */}
        <Stack spacing={2}>
          {sections.map((section) => (
            <Card
              key={section.id}
              sx={{
                borderLeft: 4,
                borderLeftColor: section.color,
              }}
            >
              <CardActionArea
                onClick={() => handleSectionSelect(section.id)}
                disabled={section.availableSeats === 0}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h4">{section.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <EventSeatIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {section.availableSeats > 0
                            ? `${section.availableSeats}석 남음`
                            : '매진'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h4" color="secondary.main">
                        {section.price.toLocaleString()}원
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Box>
    </MainLayout>
  );
}
