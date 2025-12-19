'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MainLayout } from '@/components/layout';
import { GradientButton, LoadingSpinner } from '@/components/common';
import { usePartyStore } from '@/stores/partyStore';
import { scheduleApi } from '@/api/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function CreatePartyPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const { createParty, isLoading, error } = usePartyStore();

  const [schedules, setSchedules] = useState<{ scheduleId: number; title: string }[]>([]);
  const [scheduleId, setScheduleId] = useState<number | ''>('');
  const [partyName, setPartyName] = useState('');
  const [partyType, setPartyType] = useState<'LEAVE' | 'ARRIVE'>('LEAVE');
  const [departureLocation, setDepartureLocation] = useState('');
  const [arrivalLocation, setArrivalLocation] = useState('');
  const [transportType, setTransportType] = useState<'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK'>('TAXI');
  const [maxMembers, setMaxMembers] = useState(4);
  const [preferredGender, setPreferredGender] = useState<'MALE' | 'FEMALE' | 'ANY'>('ANY');
  const [preferredAge, setPreferredAge] = useState<'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE'>('NONE');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isAllowed) return;

    // Load schedule list
    scheduleApi.getPartyList()
      .then((response) => {
        console.log('scheduleApi.getPartyList response:', response);
        console.log('response.data:', response.data);
        // API returns { events: [{ scheduleId, title }] }
        const data = response.data as { events?: { scheduleId: number; title: string }[] } | undefined;
        console.log('Parsed events:', data?.events);
        if (data?.events && Array.isArray(data.events)) {
          console.log('Setting schedules to:', data.events);
          setSchedules(data.events);
        } else {
          console.log('No events found, data structure:', JSON.stringify(data));
        }
      })
      .catch((err) => {
        console.error('scheduleApi.getPartyList error:', err);
        // API 에러 시 빈 배열 유지
        setSchedules([]);
      });
  }, [isAllowed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduleId) {
      return;
    }

    try {
      await createParty({
        scheduleId,
        partyName,
        partyType,
        departureLocation,
        arrivalLocation,
        transportType,
        maxMembers,
        preferredGender,
        preferredAge,
        description: description || undefined,
      });
      router.push('/party');
    } catch {
      // Error handled by store
    }
  };

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  return (
    <MainLayout hideNavigation>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">파티 만들기</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>이벤트</InputLabel>
            <Select
              value={scheduleId}
              label="이벤트"
              onChange={(e) => setScheduleId(e.target.value as number)}
            >
              {schedules.map((schedule) => (
                <MenuItem key={schedule.scheduleId} value={schedule.scheduleId}>
                  {schedule.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="파티 제목"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            sx={{ mb: 2 }}
            required
            placeholder="예: BTS 콘서트 같이 가실 분!"
          />

          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>파티 유형</InputLabel>
            <Select
              value={partyType}
              label="파티 유형"
              onChange={(e) => setPartyType(e.target.value as 'LEAVE' | 'ARRIVE')}
            >
              <MenuItem value="LEAVE">출발 (같이 가요)</MenuItem>
              <MenuItem value="ARRIVE">귀가 (같이 돌아가요)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="출발지"
            value={departureLocation}
            onChange={(e) => setDepartureLocation(e.target.value)}
            sx={{ mb: 2 }}
            required
            placeholder="예: 서울역"
          />

          <TextField
            fullWidth
            label="도착지"
            value={arrivalLocation}
            onChange={(e) => setArrivalLocation(e.target.value)}
            sx={{ mb: 2 }}
            required
            placeholder="예: 잠실종합운동장"
          />

          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>이동 수단</InputLabel>
            <Select
              value={transportType}
              label="이동 수단"
              onChange={(e) => setTransportType(e.target.value as 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK')}
            >
              <MenuItem value="TAXI">택시</MenuItem>
              <MenuItem value="CARPOOL">카풀</MenuItem>
              <MenuItem value="SUBWAY">지하철</MenuItem>
              <MenuItem value="BUS">버스</MenuItem>
              <MenuItem value="WALK">도보</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }} required>
            <InputLabel>최대 인원</InputLabel>
            <Select
              value={maxMembers}
              label="최대 인원"
              onChange={(e) => setMaxMembers(Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}명
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>선호 성별</InputLabel>
            <Select
              value={preferredGender}
              label="선호 성별"
              onChange={(e) => setPreferredGender(e.target.value as 'MALE' | 'FEMALE' | 'ANY')}
            >
              <MenuItem value="ANY">무관</MenuItem>
              <MenuItem value="MALE">남성</MenuItem>
              <MenuItem value="FEMALE">여성</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>선호 연령대</InputLabel>
            <Select
              value={preferredAge}
              label="선호 연령대"
              onChange={(e) => setPreferredAge(e.target.value as 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE')}
            >
              <MenuItem value="NONE">무관</MenuItem>
              <MenuItem value="TEEN">10대</MenuItem>
              <MenuItem value="TWENTY">20대</MenuItem>
              <MenuItem value="THIRTY">30대</MenuItem>
              <MenuItem value="FORTY">40대</MenuItem>
              <MenuItem value="FIFTY_PLUS">50대 이상</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="설명 (선택)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 3 }}
            multiline
            rows={3}
            placeholder="파티에 대한 추가 설명을 입력해주세요"
          />

          <GradientButton type="submit" fullWidth loading={isLoading}>
            파티 만들기
          </GradientButton>
        </Box>
      </Box>
    </MainLayout>
  );
}
