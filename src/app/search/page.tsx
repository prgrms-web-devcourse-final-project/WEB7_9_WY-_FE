'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { MainLayout } from '@/components/layout';
import { PageHeader, Section, EmptyState } from '@/components/common';
import { useArtistStore } from '@/stores/artistStore';
import { usePartyStore } from '@/stores/partyStore';
import type { KalendarEvent } from '@/types';

const recentSearches = ['BTS', 'NewJeans 콘서트', '파티 동행', 'BLACKPINK'];
const popularSearches = ['BTS 콘서트', 'NewJeans', '크리스마스 이벤트', '연말 파티'];

export default function SearchPage() {
  const router = useRouter();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const { artists } = useArtistStore();
  const { parties } = usePartyStore();

  // TODO: Implement event search when API is available
  const events: KalendarEvent[] = [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter results based on search query
  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParties = parties.filter((party) =>
    party.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = searchQuery && (
    filteredArtists.length > 0 || filteredEvents.length > 0 || filteredParties.length > 0
  );

  const noResults = searchQuery && !hasResults;

  // Render a search result item
  const renderResultItem = (
    key: string,
    icon: React.ReactNode,
    primary: string,
    secondary: string,
    onClick: () => void,
    isLast: boolean
  ) => (
    <Box
      key={key}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        cursor: 'pointer',
        borderBottom: isLast ? 'none' : `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      {icon}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" fontWeight={500} noWrap>
          {primary}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {secondary}
        </Typography>
      </Box>
      <ChevronRightIcon sx={{ color: 'text.disabled' }} />
    </Box>
  );

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Page Header */}
        <PageHeader
          title="검색"
          subtitle="아티스트, 이벤트, 파티를 검색하세요"
        />

        {/* Search Input Section */}
        <Section title="검색어 입력">
          <TextField
            fullWidth
            size="small"
            placeholder="아티스트, 이벤트, 파티 검색"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Section>

        {/* Search Results */}
        {searchQuery ? (
          <Box>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                mb: 3,
                minHeight: 40,
                '& .MuiTab-root': {
                  minHeight: 40,
                  py: 1,
                },
              }}
            >
              <Tab label={`전체 (${filteredArtists.length + filteredEvents.length + filteredParties.length})`} />
              <Tab label={`아티스트 (${filteredArtists.length})`} />
              <Tab label={`이벤트 (${filteredEvents.length})`} />
              <Tab label={`파티 (${filteredParties.length})`} />
            </Tabs>

            {noResults ? (
              <EmptyState
                icon={<SearchIcon />}
                title="검색 결과가 없습니다"
                description="다른 키워드로 검색해보세요"
              />
            ) : (
              <>
                {/* Artists */}
                {(tabValue === 0 || tabValue === 1) && filteredArtists.length > 0 && (
                  <Section title={`아티스트 (${filteredArtists.length})`}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        bgcolor: theme.palette.background.paper,
                        overflow: 'hidden',
                      }}
                    >
                      {filteredArtists.slice(0, tabValue === 0 ? 3 : undefined).map((artist, index, arr) =>
                        renderResultItem(
                          artist.id,
                          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                            {artist.shortName.charAt(0)}
                          </Avatar>,
                          artist.name,
                          `팬 ${artist.fanCount?.toLocaleString() || 0}명`,
                          () => router.push(`/artists`),
                          index === arr.length - 1
                        )
                      )}
                    </Box>
                  </Section>
                )}

                {/* Events */}
                {(tabValue === 0 || tabValue === 2) && filteredEvents.length > 0 && (
                  <Section title={`이벤트 (${filteredEvents.length})`}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        bgcolor: theme.palette.background.paper,
                        overflow: 'hidden',
                      }}
                    >
                      {filteredEvents.slice(0, tabValue === 0 ? 3 : undefined).map((event, index, arr) =>
                        renderResultItem(
                          event.id,
                          <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>
                            <EventIcon />
                          </Avatar>,
                          event.title,
                          `${event.date} · ${event.artistName}`,
                          () => router.push(`/kalendar`),
                          index === arr.length - 1
                        )
                      )}
                    </Box>
                  </Section>
                )}

                {/* Parties */}
                {(tabValue === 0 || tabValue === 3) && filteredParties.length > 0 && (
                  <Section title={`파티 (${filteredParties.length})`} noBorder>
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        bgcolor: theme.palette.background.paper,
                        overflow: 'hidden',
                      }}
                    >
                      {filteredParties.slice(0, tabValue === 0 ? 3 : undefined).map((party, index, arr) =>
                        renderResultItem(
                          party.id,
                          <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
                            <GroupIcon />
                          </Avatar>,
                          party.title,
                          `${party.currentMembers}/${party.maxMembers}명`,
                          () => router.push(`/party/${party.id}`),
                          index === arr.length - 1
                        )
                      )}
                    </Box>
                  </Section>
                )}
              </>
            )}
          </Box>
        ) : (
          /* Default: Recent & Popular Searches */
          <>
            {/* Recent Searches */}
            <Section title="최근 검색어">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {recentSearches.map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    onClick={() => handleSearch(term)}
                    onDelete={() => {}}
                    variant="outlined"
                    sx={{
                      borderRadius: 1.5,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  />
                ))}
              </Box>
            </Section>

            {/* Popular Searches */}
            <Section title="인기 검색어" noBorder>
              <Box
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.background.paper,
                  overflow: 'hidden',
                }}
              >
                {popularSearches.map((term, index) => (
                  <Box
                    key={term}
                    onClick={() => handleSearch(term)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      cursor: 'pointer',
                      borderBottom: index < popularSearches.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: index < 3 ? theme.palette.primary.main : theme.palette.grey[500],
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography variant="body1" fontWeight={500}>
                      {term}
                    </Typography>
                    <ChevronRightIcon sx={{ ml: 'auto', color: 'text.disabled' }} />
                  </Box>
                ))}
              </Box>
            </Section>
          </>
        )}
      </Box>
    </MainLayout>
  );
}
