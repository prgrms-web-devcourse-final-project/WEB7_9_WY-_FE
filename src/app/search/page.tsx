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
  Card,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import { MainLayout } from '@/components/layout';
import { mockArtists, mockEvents, mockParties } from '@/lib/mockData';

const recentSearches = ['BTS', 'NewJeans 콘서트', '파티 동행', 'BLACKPINK'];
const popularSearches = ['BTS 콘서트', 'NewJeans', '크리스마스 이벤트', '연말 파티'];

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

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
  const filteredArtists = mockArtists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.shortName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = mockEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParties = mockParties.filter((party) =>
    party.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    party.eventName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = searchQuery && (
    filteredArtists.length > 0 || filteredEvents.length > 0 || filteredParties.length > 0
  );

  const noResults = searchQuery && !hasResults;

  return (
    <MainLayout hideNavigation>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header with Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
          }}
        >
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <TextField
            fullWidth
            size="small"
            placeholder="아티스트, 이벤트, 파티 검색"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            InputProps={{
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
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Search Results */}
        {searchQuery ? (
          <Box>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label={`전체 (${filteredArtists.length + filteredEvents.length + filteredParties.length})`} />
              <Tab label={`아티스트 (${filteredArtists.length})`} />
              <Tab label={`이벤트 (${filteredEvents.length})`} />
              <Tab label={`파티 (${filteredParties.length})`} />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {noResults ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                  }}
                >
                  <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h4" color="text.secondary" gutterBottom>
                    검색 결과가 없습니다
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    다른 키워드로 검색해보세요
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Artists */}
                  {(tabValue === 0 || tabValue === 1) && filteredArtists.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      {tabValue === 0 && (
                        <Typography variant="h4" sx={{ mb: 2 }}>
                          아티스트
                        </Typography>
                      )}
                      <Card>
                        <List disablePadding>
                          {filteredArtists.slice(0, tabValue === 0 ? 3 : undefined).map((artist, index) => (
                            <ListItem
                              key={artist.id}
                              component="div"
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                                borderBottom: index < filteredArtists.length - 1 ? 1 : 0,
                                borderColor: 'divider',
                              }}
                              onClick={() => router.push(`/artists`)}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  {artist.shortName.charAt(0)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={artist.name}
                                secondary={`팬 ${artist.fanCount?.toLocaleString() || 0}명`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Card>
                    </Box>
                  )}

                  {/* Events */}
                  {(tabValue === 0 || tabValue === 2) && filteredEvents.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      {tabValue === 0 && (
                        <Typography variant="h4" sx={{ mb: 2 }}>
                          이벤트
                        </Typography>
                      )}
                      <Card>
                        <List disablePadding>
                          {filteredEvents.slice(0, tabValue === 0 ? 3 : undefined).map((event, index) => (
                            <ListItem
                              key={event.id}
                              component="div"
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                                borderBottom: index < filteredEvents.length - 1 ? 1 : 0,
                                borderColor: 'divider',
                              }}
                              onClick={() => router.push(`/calendar`)}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                  <EventIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={event.title}
                                secondary={`${event.date} · ${event.artistName}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Card>
                    </Box>
                  )}

                  {/* Parties */}
                  {(tabValue === 0 || tabValue === 3) && filteredParties.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      {tabValue === 0 && (
                        <Typography variant="h4" sx={{ mb: 2 }}>
                          파티
                        </Typography>
                      )}
                      <Card>
                        <List disablePadding>
                          {filteredParties.slice(0, tabValue === 0 ? 3 : undefined).map((party, index) => (
                            <ListItem
                              key={party.id}
                              component="div"
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                                borderBottom: index < filteredParties.length - 1 ? 1 : 0,
                                borderColor: 'divider',
                              }}
                              onClick={() => router.push(`/chats/${party.id}`)}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'info.main' }}>
                                  <GroupIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={party.title}
                                secondary={`${party.eventName} · ${party.currentMembers}/${party.maxMembers}명`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Card>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        ) : (
          /* Default: Recent & Popular Searches */
          <Box sx={{ p: 2 }}>
            {/* Recent Searches */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                최근 검색어
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {recentSearches.map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    onClick={() => handleSearch(term)}
                    onDelete={() => {}}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {/* Popular Searches */}
            <Box>
              <Typography variant="h4" sx={{ mb: 2 }}>
                인기 검색어
              </Typography>
              <Card>
                <List disablePadding>
                  {popularSearches.map((term, index) => (
                    <ListItem
                      key={term}
                      component="div"
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderBottom: index < popularSearches.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                      }}
                      onClick={() => handleSearch(term)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: index < 3 ? 'primary.main' : 'grey.500',
                            width: 32,
                            height: 32,
                            fontSize: 14,
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={term} />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
