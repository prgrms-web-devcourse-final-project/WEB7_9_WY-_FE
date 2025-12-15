'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Fab,
  keyframes,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import { MainLayout } from '@/components/layout';
import { EmptyState, PartyCard } from '@/components/common';
import { usePartyStore } from '@/stores/partyStore';
import { scheduleApi } from '@/api/client';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export default function PartyPage() {
  const router = useRouter();
  const theme = useTheme();
  const { fetchParties, fetchBySchedule, getFilteredParties, setFilter } = usePartyStore();
  const [tabValue, setTabValue] = useState(0);
  const [schedules, setSchedules] = useState<{ scheduleId: number; title: string }[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<number | ''>('');

  useEffect(() => {
    // Load party list
    fetchParties();

    // Load schedule list for filter
    scheduleApi.getPartyList()
      .then((response) => {
        // API returns { events: [{ scheduleId, title }] }
        const data = response.data as { events?: { scheduleId: number; title: string }[] } | undefined;
        if (data?.events && Array.isArray(data.events)) {
          setSchedules(data.events);
        } else {
          setSchedules([]);
        }
      })
      .catch(() => {
        // API 에러 시 빈 배열 유지
        setSchedules([]);
      });
  }, [fetchParties]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const partyType = newValue === 0 ? undefined : newValue === 1 ? 'LEAVE' : 'ARRIVE';

    if (selectedSchedule && partyType !== undefined) {
      fetchBySchedule(selectedSchedule, { partyType });
    } else if (selectedSchedule) {
      fetchBySchedule(selectedSchedule);
    } else if (partyType) {
      setFilter({ type: partyType === 'LEAVE' ? 'departure' : 'return' });
    } else {
      fetchParties();
    }
  };

  const handleScheduleChange = (scheduleId: number | '') => {
    setSelectedSchedule(scheduleId);

    if (scheduleId === '') {
      fetchParties();
      return;
    }

    const partyType = tabValue === 0 ? undefined : tabValue === 1 ? 'LEAVE' : 'ARRIVE';
    fetchBySchedule(scheduleId, partyType ? { partyType } : undefined);
  };

  const filteredParties = getFilteredParties();

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h2">팬 파티 매칭</Typography>
          <Chip
            label="내 파티"
            variant="outlined"
            onClick={() => router.push('/party/my-parties')}
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.5),
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          />
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>이벤트 선택</InputLabel>
          <Select
            value={selectedSchedule}
            label="이벤트 선택"
            onChange={(e) => handleScheduleChange(e.target.value as number | '')}
          >
            <MenuItem value="">전체</MenuItem>
            {schedules.map((schedule) => (
              <MenuItem key={schedule.scheduleId} value={schedule.scheduleId}>
                {schedule.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="전체" />
          <Tab label="출발" icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="귀가" icon={<HomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>

        {filteredParties.length === 0 ? (
          <EmptyState
            icon={<GroupIcon />}
            title="파티가 없습니다"
            description="새로운 파티를 만들어보세요!"
            actionLabel="파티 만들기"
            onAction={() => router.push('/party/create')}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {filteredParties.map((party) => (
              <PartyCard
                key={party.id}
                id={party.id}
                title={party.title}
                type={party.type}
                status={party.status}
                eventName={party.eventName || ''}
                eventDate={party.eventDate}
                departure={party.departure}
                arrival={party.arrival}
                departureTime={party.departureTime}
                currentMembers={party.currentMembers}
                maxMembers={party.maxMembers}
                onClick={() => router.push(`/party/${party.id}`)}
              />
            ))}
          </Box>
        )}
      </Box>

      <Fab
        color="secondary"
        onClick={() => router.push('/party/create')}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          width: 60,
          height: 60,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.4)}`,
          animation: `${pulse} 3s ease-in-out infinite`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.5)}`,
            animation: 'none',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Fab>
    </MainLayout>
  );
}
