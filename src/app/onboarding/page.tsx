'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardActionArea,
  Button,
  Chip,
  Fade,
  Grow,
  Zoom,
  CircularProgress,
} from '@mui/material';
import { useTheme, alpha, keyframes } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoginIcon from '@mui/icons-material/Login';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CelebrationIcon from '@mui/icons-material/Celebration';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import { useAuthStore } from '@/stores/authStore';
import { useArtistStore } from '@/stores/artistStore';
import { GradientButton, ArtistAvatar } from '@/components/common';
import { mockArtists } from '@/lib/mockData';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(3deg); }
  75% { transform: translateY(10px) rotate(-3deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;


const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

// Floating decorative elements
const FloatingIcon = ({
  icon: Icon,
  delay,
  duration,
  top,
  left,
  size,
  color,
}: {
  icon: React.ElementType;
  delay: number;
  duration: number;
  top: string;
  left: string;
  size: number;
  color: string;
}) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      animation: `${float} ${duration}s ease-in-out ${delay}s infinite`,
      zIndex: 0,
      pointerEvents: 'none',
    }}
  >
    <Icon sx={{ fontSize: size, color, opacity: 0.3 }} />
  </Box>
);

export default function OnboardingPage() {
  const theme = useTheme();
  const router = useRouter();
  const { completeOnboarding, continueAsGuest, isLoggedIn, guestSelectedArtists } = useAuthStore();
  const { artists, isLoading, error, fetchArtists, followMultipleArtists } = useArtistStore();
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [hoveredArtist, setHoveredArtist] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch artists on mount
    fetchArtists();
    if (guestSelectedArtists.length > 0) {
      setSelectedArtists(guestSelectedArtists);
    }
    setMounted(true);
  }, [fetchArtists, guestSelectedArtists]);

  const handleArtistClick = (artistId: string) => {
    setSelectedArtists((prev) =>
      prev.includes(artistId)
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]
    );
  };

  const handleComplete = async () => {
    if (selectedArtists.length === 0) return;

    setIsSubmitting(true);
    try {
      if (isLoggedIn) {
        // 일괄 팔로우 함수 사용 (Race Condition 방지)
        await followMultipleArtists(selectedArtists);
        completeOnboarding(selectedArtists);
      } else {
        // Guest mode - just save to local storage
        continueAsGuest(selectedArtists);
      }
      router.push('/calendar');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    if (selectedArtists.length > 0) {
      continueAsGuest(selectedArtists);
    }
    router.push('/login');
  };

  const floatingIcons = useMemo(() => [
    { icon: StarIcon, delay: 0, duration: 4, top: '10%', left: '10%', size: 32, color: theme.palette.warning.main },
    { icon: FavoriteIcon, delay: 1, duration: 5, top: '15%', left: '85%', size: 28, color: theme.palette.error.light },
    { icon: AutoAwesomeIcon, delay: 0.5, duration: 4.5, top: '70%', left: '8%', size: 24, color: theme.palette.primary.light },
    { icon: CelebrationIcon, delay: 1.5, duration: 5.5, top: '65%', left: '90%', size: 30, color: theme.palette.secondary.main },
    { icon: StarIcon, delay: 2, duration: 4, top: '85%', left: '15%', size: 20, color: theme.palette.primary.main },
    { icon: FavoriteIcon, delay: 0.8, duration: 5, top: '5%', left: '50%', size: 26, color: theme.palette.secondary.light },
  ], [theme]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Animated Background Gradients */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {/* Primary gradient orb */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '50vw',
            height: '50vw',
            maxWidth: 500,
            maxHeight: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 70%)`,
            animation: `${pulse} 8s ease-in-out infinite`,
          }}
        />
        {/* Secondary gradient orb */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-15%',
            width: '45vw',
            height: '45vw',
            maxWidth: 450,
            maxHeight: 450,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.2)} 0%, transparent 70%)`,
            animation: `${pulse} 10s ease-in-out 2s infinite`,
          }}
        />
        {/* Accent gradient orb */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '30vw',
            height: '30vw',
            maxWidth: 300,
            maxHeight: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.15)} 0%, transparent 70%)`,
            animation: `${pulse} 12s ease-in-out 4s infinite`,
          }}
        />

        {/* Floating decorative icons */}
        {floatingIcons.map((props, index) => (
          <FloatingIcon key={index} {...props} />
        ))}
      </Box>

      <Container
        maxWidth="md"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          py: { xs: 3, sm: 4 },
        }}
      >
        {/* Header */}
        <Fade in={mounted} timeout={600}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {/* Selected artists avatars */}
            <Box sx={{ flex: 1, mr: 2, minHeight: 40 }}>
              {selectedArtists.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selectedArtists.slice(0, 5).map((artistId, index) => {
                      const artist = mockArtists.find((a) => a.id === artistId);
                      if (!artist) return null;
                      return (
                        <Zoom key={artistId} in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid',
                              borderColor: 'background.paper',
                              marginLeft: index > 0 ? '-8px' : 0,
                              zIndex: selectedArtists.length - index,
                              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                color: 'white',
                              }}
                            >
                              {artist.shortName}
                            </Typography>
                          </Box>
                        </Zoom>
                      );
                    })}
                    {selectedArtists.length > 5 && (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'background.surface',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid',
                          borderColor: 'background.paper',
                          marginLeft: '-8px',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: 'text.secondary',
                          }}
                        >
                          +{selectedArtists.length - 5}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      ml: 0.5,
                    }}
                  >
                    {selectedArtists.length}명 선택됨
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.disabled">
                  아래에서 아티스트를 선택해주세요
                </Typography>
              )}
            </Box>

            {/* Login button */}
            {!isLoggedIn && (
              <Button
                startIcon={<LoginIcon />}
                onClick={handleLoginClick}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 3,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                로그인
              </Button>
            )}
          </Box>
        </Fade>

        {/* Hero Section */}
        <Fade in={mounted} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                  fontWeight: 800,
                  color: 'text.primary',
                  lineHeight: 1.3,
                }}
              >
                좋아하는 아티스트를
                <br />
                선택하세요
              </Typography>
              {/* Sparkle decorations */}
              <AutoAwesomeIcon
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -16,
                  fontSize: 20,
                  color: theme.palette.warning.main,
                  animation: `${sparkle} 2s ease-in-out infinite`,
                }}
              />
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 400, mx: 'auto' }}
            >
              선택한 아티스트의 콘서트, 팬싸인회, 생일 등
              <br />
              모든 일정을 한눈에 확인하세요
            </Typography>
            {!isLoggedIn && (
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                label="로그인 없이도 이용 가능해요"
                size="small"
                sx={{
                  mt: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              />
            )}
          </Box>
        </Fade>

        {/* Artists Grid */}
        <Box
          sx={{
            flex: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: { xs: 2, sm: 3 },
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.5),
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          }}
        >
          {/* Error message */}
          {error && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
              <Typography color="error.contrastText" variant="body2">{error}</Typography>
            </Box>
          )}

          {/* Loading state */}
          {isLoading && artists.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress />
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                아티스트 목록을 불러오는 중...
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(4, 1fr)',
                md: 'repeat(6, 1fr)',
              },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {(artists.length > 0 ? artists : mockArtists).map((artist, index) => {
              const isSelected = selectedArtists.includes(artist.id);
              const isHovered = hoveredArtist === artist.id;

              return (
                <Grow
                  key={artist.id}
                  in={mounted}
                  timeout={400 + index * 80}
                  style={{ transformOrigin: 'center' }}
                >
                  <Card
                    elevation={0}
                    onMouseEnter={() => setHoveredArtist(artist.id)}
                    onMouseLeave={() => setHoveredArtist(null)}
                    sx={{
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, 0.12)
                        : 'background.paper',
                      border: '2px solid',
                      borderColor: isSelected
                        ? 'primary.main'
                        : isHovered
                          ? alpha(theme.palette.primary.main, 0.4)
                          : 'transparent',
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'visible',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSelected
                        ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`
                        : isHovered
                          ? `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`
                          : 'none',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleArtistClick(artist.id)}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <ArtistAvatar
                          name={artist.name}
                          shortName={artist.shortName}
                          size="medium"
                          selected={isSelected}
                        />
                        {/* Selection indicator with animation */}
                        <Zoom in={isSelected}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
                          </Box>
                        </Zoom>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'primary.main' : 'text.secondary',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        }}
                      >
                        {artist.name}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grow>
              );
            })}
          </Box>
        </Box>

        {/* Bottom CTA */}
        <Fade in={mounted} timeout={1200}>
          <Box sx={{ mt: 3, px: { xs: 0, sm: 2 } }}>
            <GradientButton
              fullWidth
              disabled={selectedArtists.length === 0 || isSubmitting}
              onClick={handleComplete}
              sx={{
                py: 2,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 700,
                boxShadow: selectedArtists.length > 0
                  ? `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`
                  : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:not(:disabled):hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  저장 중...
                </Box>
              ) : selectedArtists.length > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CelebrationIcon sx={{ fontSize: 20 }} />
                  {isLoggedIn
                    ? `${selectedArtists.length}명 선택 완료`
                    : `${selectedArtists.length}명 선택 - 시작하기`}
                </Box>
              ) : (
                '최소 1명 이상 선택해주세요'
              )}
            </GradientButton>

            {!isLoggedIn && selectedArtists.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 2,
                  color: 'text.disabled',
                }}
              >
                로그인하면 예매 알림, 파티 참여 등 더 많은 기능을 이용할 수 있어요
              </Typography>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
