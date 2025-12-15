'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import { MainLayout } from '@/components/layout';
import { ArtistAvatar } from '@/components/common';
import { useArtistStore } from '@/stores/artistStore';
import { mockArtists, mockEvents, mockParties } from '@/lib/mockData';

export default function ArtistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const artistId = params.id as string;

  const { artists, followingArtists, fetchArtists, fetchFollowing, toggleFollow } = useArtistStore();
  const [tabValue, setTabValue] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    // Fetch artists and following status on mount
    if (artists.length === 0) {
      fetchArtists();
    }
    fetchFollowing().catch(() => {
      // Ignore error if user is not logged in
    });
  }, [artists.length, fetchArtists, fetchFollowing]);

  const artist = (artists.length > 0 ? artists : mockArtists).find(a => a.id === artistId);
  const isFollowing = followingArtists.includes(artistId);

  const handleToggleFollow = async () => {
    setIsFollowLoading(true);
    try {
      await toggleFollow(artistId);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Filter events and parties for this artist
  const artistEvents = mockEvents.filter(event => event.artistId === artistId);
  const artistParties = mockParties.filter(party => {
    const event = mockEvents.find(e => e.id === party.eventId);
    return event?.artistId === artistId;
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'concert': return '콘서트';
      case 'fansign': return '팬사인회';
      case 'broadcast': return '방송';
      case 'birthday': return '생일';
      default: return type;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'concert': return 'primary';
      case 'fansign': return 'secondary';
      case 'broadcast': return 'info';
      case 'birthday': return 'warning';
      default: return 'default';
    }
  };

  if (!artist) {
    return (
      <MainLayout hideNavigation>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>아티스트를 찾을 수 없습니다.</Typography>
          <Button onClick={() => router.back()} sx={{ mt: 2 }}>
            돌아가기
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideNavigation>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
          }}
        >
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h2">{artist.name}</Typography>
        </Box>

        {/* Artist Profile */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
          }}
        >
          <ArtistAvatar
            name={artist.name}
            shortName={artist.shortName}
            size="large"
            selected={isFollowing}
          />
          <Typography variant="h3" sx={{ mt: 2 }}>
            {artist.name}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              mt: 2,
              mb: 3,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                <CalendarMonthIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="h4">{artist.scheduleCount}</Typography>
              </Box>
              <Typography variant="caption" color="text.disabled">
                예정 일정
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                <FavoriteIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
                <Typography variant="h4">{(artist.fanCount / 10000).toFixed(0)}만</Typography>
              </Box>
              <Typography variant="caption" color="text.disabled">
                팔로워
              </Typography>
            </Box>
          </Box>
          <Button
            variant={isFollowing ? 'contained' : 'outlined'}
            color="secondary"
            startIcon={isFollowLoading ? <CircularProgress size={16} color="inherit" /> : (isFollowing ? <FavoriteIcon /> : <FavoriteBorderIcon />)}
            onClick={handleToggleFollow}
            disabled={isFollowLoading}
            sx={{ borderRadius: 3, px: 4 }}
          >
            {isFollowing ? '팔로잉' : '팔로우'}
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab label={`일정 (${artistEvents.length})`} />
          <Tab label={`파티 (${artistParties.length})`} />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <>
              {artistEvents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">예정된 일정이 없습니다</Typography>
                </Box>
              ) : (
                <Card>
                  <List disablePadding>
                    {artistEvents.map((event, index) => (
                      <ListItem
                        key={event.id}
                        component="div"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          borderBottom: index < artistEvents.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                        }}
                        onClick={() => router.push('/calendar')}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${getEventTypeColor(event.type)}.main` }}>
                            <EventIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">{event.title}</Typography>
                              <Chip
                                label={getEventTypeLabel(event.type)}
                                size="small"
                                color={getEventTypeColor(event.type) as 'primary' | 'secondary' | 'info' | 'warning' | 'default'}
                                sx={{ height: 20, fontSize: 10 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'block' }}>
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                                {event.date} {event.time && `· ${event.time}`}
                              </Typography>
                              {event.venue && (
                                <Typography component="span" variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                                  {event.venue}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}
            </>
          )}

          {tabValue === 1 && (
            <>
              {artistParties.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <GroupIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">관련 파티가 없습니다</Typography>
                </Box>
              ) : (
                <Card>
                  <List disablePadding>
                    {artistParties.map((party, index) => (
                      <ListItem
                        key={party.id}
                        component="div"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          borderBottom: index < artistParties.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                        }}
                        onClick={() => router.push(`/party/${party.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: party.type === 'departure' ? 'primary.main' : 'secondary.main' }}>
                            <GroupIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">{party.title}</Typography>
                              <Chip
                                label={party.type === 'departure' ? '출발' : '귀가'}
                                size="small"
                                color={party.type === 'departure' ? 'primary' : 'secondary'}
                                sx={{ height: 20, fontSize: 10 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'block' }}>
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                                {party.eventName}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                                {party.departure} → {party.arrival} · {party.currentMembers}/{party.maxMembers}명
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              )}
            </>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
}
