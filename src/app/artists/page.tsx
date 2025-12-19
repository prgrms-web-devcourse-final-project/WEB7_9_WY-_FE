"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { MainLayout } from "@/components/layout";
import { ArtistAvatar, LoadingSpinner } from "@/components/common";
import { useArtistStore } from "@/stores/artistStore";
import type { Artist } from "@/types";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface ArtistCardProps {
  artist: Artist;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
}

function ArtistCard({
  artist,
  isFollowing,
  onToggleFollow,
}: ArtistCardProps) {
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
    <Card
      sx={{
        height: "100%",
        borderColor: "divider",
        "&:hover": {
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ArtistAvatar
            name={artist.name}
            shortName={artist.shortName}
            size="large"
            selected={isFollowing}
          />
          <Typography variant="h4" sx={{ textAlign: "center" }}>
            {artist.name}
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ pt: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarMonthIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="body2" color="text.secondary">
                {artist.scheduleCount}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.disabled">
              일정
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FavoriteIcon sx={{ fontSize: 16, color: "secondary.main" }} />
              <Typography variant="body2" color="text.secondary">
                {(artist.fanCount / 10000).toFixed(0)}만
              </Typography>
            </Box>
            <Typography variant="caption" color="text.disabled">
              팬
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant={isFollowing ? "contained" : "outlined"}
          color="secondary"
          startIcon={isFollowLoading ? <CircularProgress size={16} color="inherit" /> : (isFollowing ? <FavoriteIcon /> : <FavoriteBorderIcon />)}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFollow(artist.id);
          }}
          disabled={isFollowLoading}
          sx={{
            borderRadius: 2,
          }}
        >
          {isFollowing ? "팔로잉" : "팔로우"}
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyFollowingState() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        px: 2,
      }}
    >
      <PersonAddIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
      <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
        팔로우한 아티스트가 없습니다
      </Typography>
      <Typography
        variant="body2"
        color="text.disabled"
        sx={{ textAlign: "center" }}
      >
        아래에서 좋아하는 아티스트를 팔로우해보세요!
      </Typography>
    </Box>
  );
}

export default function ArtistsPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const { artists, followingArtists, isLoading, error, fetchArtists, fetchFollowing, toggleFollow } =
    useArtistStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAllowed) return;
    // Fetch artists and following status on mount
    fetchArtists();
    fetchFollowing().catch(() => {
      // Ignore error if user is not logged in
    });
  }, [fetchArtists, fetchFollowing, isAllowed]);

  const allArtists = artists;

  // 검색어로 아티스트 필터링
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

  // 팔로우하지 않은 아티스트 목록 (모든 아티스트 섹션용)
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
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h2" sx={{ mb: 3 }}>
          아티스트
        </Typography>

        {/* 검색 필드 */}
        <TextField
          fullWidth
          placeholder="아티스트 이름으로 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* 검색 결과가 없을 때 */}
        {searchQuery && filteredArtists.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다
            </Typography>
          </Box>
        )}

        {/* Error message */}
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
            <Typography color="error.contrastText">{error}</Typography>
          </Box>
        )}

        {/* Loading state */}
        {isLoading && artists.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">아티스트 목록을 불러오는 중...</Typography>
          </Box>
        )}

        {/* 팔로잉 섹션 - 검색 중 결과 없으면 숨김 */}
        {(!searchQuery || followingArtistsList.length > 0) && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <FavoriteIcon sx={{ fontSize: 20, color: "secondary.main" }} />
              <Typography variant="h3">내가 팔로우한 아티스트</Typography>
              {followingArtistsList.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  ({followingArtistsList.length})
                </Typography>
              )}
            </Box>

            {followingArtistsList.length === 0 && !searchQuery ? (
              <EmptyFollowingState />
            ) : (
              <Grid container spacing={2}>
                {followingArtistsList.map((artist) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={artist.id}>
                    <ArtistCard
                      artist={artist}
                      isFollowing={true}
                      onToggleFollow={toggleFollow}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Divider - 양쪽 섹션 모두 표시될 때만 */}
        {(!searchQuery || (followingArtistsList.length > 0 && notFollowingArtistsList.length > 0)) && (
          <Divider sx={{ my: 4 }} />
        )}

        {/* 팔로우하지 않은 아티스트 섹션 */}
        {notFollowingArtistsList.length > 0 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="h3">다른 아티스트</Typography>
              <Typography variant="body2" color="text.secondary">
                ({notFollowingArtistsList.length})
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {notFollowingArtistsList.map((artist) => (
                <Grid size={{ xs: 6, sm: 4 }} key={artist.id}>
                  <ArtistCard
                    artist={artist}
                    isFollowing={false}
                    onToggleFollow={toggleFollow}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
