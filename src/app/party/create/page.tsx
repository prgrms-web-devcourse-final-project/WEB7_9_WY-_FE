'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { MainLayout } from '@/components/layout';
import { GradientButton, LoadingSpinner, PageHeader, Section } from '@/components/common';
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
        const data = response.data as { events?: { scheduleId: number; title: string }[] } | undefined;
        if (data?.events && Array.isArray(data.events)) {
          setSchedules(data.events);
        }
      })
      .catch(() => {
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
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Page Header */}
        <PageHeader
          title="파티 만들기"
          subtitle="함께 이동할 팬들을 모집하세요"
          showBack
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* 2-Column Layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 4,
            }}
          >
            {/* Left Column - 이벤트 정보 */}
            <Box>
              <Section title="이벤트 정보">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <FormControl fullWidth required>
                    <InputLabel>이벤트 선택</InputLabel>
                    <Select
                      value={scheduleId}
                      label="이벤트 선택"
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
                    required
                    placeholder="예: BTS 콘서트 같이 가실 분!"
                  />

                  <FormControl fullWidth required>
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
                    label="설명 (선택)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={4}
                    placeholder="파티에 대한 추가 설명을 입력해주세요"
                  />
                </Box>
              </Section>
            </Box>

            {/* Right Column - 이동 및 멤버 설정 */}
            <Box>
              <Section title="이동 정보">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="출발지"
                    value={departureLocation}
                    onChange={(e) => setDepartureLocation(e.target.value)}
                    required
                    placeholder="예: 서울역"
                  />

                  <TextField
                    fullWidth
                    label="도착지"
                    value={arrivalLocation}
                    onChange={(e) => setArrivalLocation(e.target.value)}
                    required
                    placeholder="예: 잠실종합운동장"
                  />

                  <FormControl fullWidth required>
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
                </Box>
              </Section>

              <Section title="멤버 설정" noBorder>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <FormControl fullWidth required>
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

                  <FormControl fullWidth>
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

                  <FormControl fullWidth>
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
                </Box>
              </Section>
            </Box>
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <GradientButton
              type="submit"
              loading={isLoading}
              sx={{ minWidth: { xs: '100%', sm: 300 } }}
            >
              파티 만들기
            </GradientButton>
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}
