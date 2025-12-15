"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { MainLayout } from "@/components/layout";
import { ArtistAvatar } from "@/components/common";
import { useArtistStore } from "@/stores/artistStore";
import { mockArtists } from "@/lib/mockData";
import type { Artist } from "@/types";

interface ArtistCardProps {
  artist: Artist;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
  onNavigate: (id: string) => void;
}

function ArtistCard({
  artist,
  isFollowing,
  onToggleFollow,
  onNavigate,
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
      <Box sx={{ p: 2, position: "relative" }}>
        <IconButton
          size="small"
          onClick={() => onNavigate(artist.id)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "text.secondary",
          }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
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
  const router = useRouter();
  const { artists, followingArtists, isLoading, error, fetchArtists, fetchFollowing, toggleFollow } =
    useArtistStore();

  useEffect(() => {
    // Fetch artists and following status on mount
    fetchArtists();
    fetchFollowing().catch(() => {
      // Ignore error if user is not logged in
    });
  }, [fetchArtists, fetchFollowing]);

  const allArtists = artists.length > 0 ? artists : mockArtists;

  const followingArtistsList = useMemo(() => {
    return allArtists.filter((artist) => followingArtists.includes(artist.id));
  }, [allArtists, followingArtists]);

  const handleNavigate = (id: string) => {
    router.push(`/artists/${id}`);
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h2" sx={{ mb: 4 }}>
          아티스트
        </Typography>

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

        {/* 팔로잉 섹션 */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FavoriteIcon sx={{ fontSize: 20, color: "secondary.main" }} />
            <Typography variant="h3">내가 팔로우한 아티스트</Typography>
            {followingArtists.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                ({followingArtists.length})
              </Typography>
            )}
          </Box>

          {followingArtistsList.length === 0 ? (
            <EmptyFollowingState />
          ) : (
            <Grid container spacing={2}>
              {followingArtistsList.map((artist) => (
                <Grid size={{ xs: 6, sm: 4 }} key={artist.id}>
                  <ArtistCard
                    artist={artist}
                    isFollowing={true}
                    onToggleFollow={toggleFollow}
                    onNavigate={handleNavigate}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* 전체 아티스트 섹션 */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="h3">모든 아티스트</Typography>
            <Typography variant="body2" color="text.secondary">
              ({allArtists.length})
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {allArtists.map((artist) => {
              const isFollowing = followingArtists.includes(artist.id);
              return (
                <Grid size={{ xs: 6, sm: 4 }} key={artist.id}>
                  <ArtistCard
                    artist={artist}
                    isFollowing={isFollowing}
                    onToggleFollow={toggleFollow}
                    onNavigate={handleNavigate}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </MainLayout>
  );
}
