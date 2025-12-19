'use client';

import { useQuery } from '@tanstack/react-query';
import { scheduleApi } from '@/api/client';
import type { MonthlySchedule, UpcomingEvent } from '@/types';

// Query keys
export const scheduleKeys = {
  all: ['schedules'] as const,
  following: (params: { year: number; month: number; artistId?: number }) =>
    [...scheduleKeys.all, 'following', params] as const,
  forParty: () => [...scheduleKeys.all, 'partyList'] as const,
};

// Raw API response types
type RawScheduleResponse = {
  scheduleId?: number;
  artistId?: number;
  artistName?: string;
  title?: string;
  scheduleCategory?: string;
  scheduleTime?: string;
  performanceId?: number;
  link?: string;
  location?: string;
};

type RawUpcomingEventResponse = {
  scheduleId?: number;
  artistId?: number;
  artistName?: string;
  title?: string;
  scheduleCategory?: string;
  scheduleTime?: string;
  performanceId?: number;
  link?: string;
  daysUntilEvent?: number;
  location?: string;
};

// Map category to event type
const mapCategory = (category?: string): MonthlySchedule['scheduleCategory'] => {
  const validCategories = ['CONCERT', 'FAN_SIGN', 'BROADCAST', 'BIRTHDAY'] as const;
  if (category && validCategories.includes(category as typeof validCategories[number])) {
    return category as MonthlySchedule['scheduleCategory'];
  }
  return 'CONCERT';
};

// Get following schedules (calendar data)
export function useFollowingSchedules(params: { year: number; month: number; artistId?: number }) {
  return useQuery({
    queryKey: scheduleKeys.following(params),
    queryFn: async () => {
      const { data, error } = await scheduleApi.getFollowing(params);
      if (error) {
        throw new Error('일정을 불러오는데 실패했습니다.');
      }

      // Map API response to our types
      const monthlySchedules: MonthlySchedule[] = (data?.monthlySchedules || []).map(
        (s: RawScheduleResponse) => ({
          scheduleId: s.scheduleId || 0,
          artistId: s.artistId || 0,
          artistName: s.artistName || '',
          title: s.title || '',
          scheduleCategory: mapCategory(s.scheduleCategory),
          scheduleTime: s.scheduleTime || '',
          performanceId: s.performanceId,
          link: s.link,
          location: s.location || '',
        })
      );

      const upcomingEvents: UpcomingEvent[] = (data?.upcomingEvents || []).map(
        (e: RawUpcomingEventResponse) => ({
          scheduleId: e.scheduleId || 0,
          artistId: e.artistId || 0,
          artistName: e.artistName || '',
          title: e.title || '',
          scheduleCategory: mapCategory(e.scheduleCategory),
          scheduleTime: e.scheduleTime || '',
          performanceId: e.performanceId,
          link: e.link,
          daysUntilEvent: e.daysUntilEvent || 0,
          location: e.location || '',
        })
      );

      return { monthlySchedules, upcomingEvents };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get schedules available for party creation
export function useSchedulesForParty() {
  return useQuery({
    queryKey: scheduleKeys.forParty(),
    queryFn: async () => {
      const { data, error } = await scheduleApi.getPartyList();
      if (error) {
        throw new Error('파티 생성 가능한 일정을 불러오는데 실패했습니다.');
      }

      // API returns { events: [{ scheduleId, title }] }
      const schedules = (data?.events || []).map((e: {
        scheduleId?: number;
        title?: string;
      }) => ({
        scheduleId: e.scheduleId || 0,
        title: e.title || '',
      }));

      return schedules;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
