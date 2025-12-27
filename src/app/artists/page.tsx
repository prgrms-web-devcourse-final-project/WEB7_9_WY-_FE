'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CheckIcon from '@mui/icons-material/Check';
import { MainLayout } from '@/components/layout';
import { ArtistAvatar, LoadingSpinner, PageHeader, Section, EmptyState } from '@/components/common';
import { useArtistStore } from '@/stores/artistStore';
import type { Artist } from '@/types';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface ArtistItemProps {
  artist: Artist;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
}

function ArtistItem({ artist, isFollowing, onToggleFollow }: ArtistItemProps) {
  const theme = useTheme();
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleToggleFollow = async (id: string) => {
    setIsFollowLoading(true);
    try {
      await onToggleFollow(id);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: isFollowing ? alpha(theme.palette.secondary.main, 0.3) : theme.palette.divider,
        bgcolor: theme.palette.background.paper,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.5),
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <ArtistAvatar
          name={artist.name}
          shortName={artist.shortName}
          size="large"
          selected={isFollowing}
        />
        <Typography variant="h6" fontWeight={600} sx={{ textAlign: 'center' }}>
          {artist.name}
        </Typography>

        {/* Stats */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {artist.scheduleCount}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.disabled">
              일정
            </Typography>
          </Box>
        </Box>

        {/* Follow Button */}
        <Button
          fullWidth
          variant={isFollowing ? 'contained' : 'outlined'}
          color="secondary"
          startIcon={
            isFollowLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : isFollowing ? (
              <CheckIcon />
            ) : (
              <PersonAddAlt1Icon />
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFollow(artist.id);
          }}
          disabled={isFollowLoading}
          sx={{
            borderRadius: 1.5,
            mt: 1,
          }}
        >
          {isFollowing ? '팔로잉' : '팔로우'}
        </Button>
      </Box>
    </Box>
  );
}

export default function ArtistsPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const theme = useTheme();
  const { artists, followingArtists, isLoading, error, fetchArtists, fetchFollowing, toggleFollow } =
    useArtistStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAllowed) return;
    fetchArtists();
    fetchFollowing().catch(() => {
      // Ignore error if user is not logged in
    });
  }, [fetchArtists, fetchFollowing, isAllowed]);

  const allArtists = artists;

  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return allArtists;
    const query = searchQuery.toLowerCase().trim();
    return allArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(query) ||
        (artist.shortName && artist.shortName.toLowerCase().includes(query))
    );
  }, [allArtists, searchQuery]);

  const followingArtistsList = useMemo(() => {
    return filteredArtists.filter((artist) => followingArtists.includes(artist.id));
  }, [filteredArtists, followingArtists]);

  const notFollowingArtistsList = useMemo(() => {
    return filteredArtists.filter((artist) => !followingArtists.includes(artist.id));
  }, [filteredArtists, followingArtists]);

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
          title="아티스트"
          subtitle="좋아하는 아티스트를 팔로우하고 일정을 확인하세요"
        />

        {/* Search Section */}
        <Section title="검색">
          <TextField
            fullWidth
            placeholder="아티스트 이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Section>

        {/* Error message */}
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Loading state */}
        {isLoading && artists.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={32} />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              아티스트 목록을 불러오는 중...
            </Typography>
          </Box>
        )}

        {/* No search results */}
        {searchQuery && filteredArtists.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다
            </Typography>
          </Box>
        )}

        {/* Following Section */}
        {(!searchQuery || followingArtistsList.length > 0) && (
          <Section title={`팔로우 중 (${followingArtistsList.length})`}>
            {followingArtistsList.length === 0 && !searchQuery ? (
              <EmptyState
                icon={<PersonAddIcon />}
                title="팔로우한 아티스트가 없습니다"
                description="아래에서 좋아하는 아티스트를 팔로우해보세요!"
              />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {followingArtistsList.map((artist) => (
                  <ArtistItem
                    key={artist.id}
                    artist={artist}
                    isFollowing={true}
                    onToggleFollow={toggleFollow}
                  />
                ))}
              </Box>
            )}
          </Section>
        )}

        {/* Other Artists Section */}
        {notFollowingArtistsList.length > 0 && (
          <Section title={`다른 아티스트 (${notFollowingArtistsList.length})`} noBorder>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 2,
              }}
            >
              {notFollowingArtistsList.map((artist) => (
                <ArtistItem
                  key={artist.id}
                  artist={artist}
                  isFollowing={false}
                  onToggleFollow={toggleFollow}
                />
              ))}
            </Box>
          </Section>
        )}
      </Box>
    </MainLayout>
  );
}
