'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
} from '@mui/material';
import { useTheme, alpha, keyframes } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuthStore } from '@/stores/authStore';
import { GradientButton } from '@/components/common';

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });

      // Check auth state after login
      const { isLoggedIn, isOnboarded } = useAuthStore.getState();
      if (isLoggedIn) {
        if (isOnboarded) {
          router.push('/kalendar');
        } else {
          router.push('/onboarding');
        }
      }
    } catch (error) {
      // Error is already set in the store, just handle UI
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
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
            top: '-15%',
            right: '-5%',
            width: '45vw',
            height: '45vw',
            maxWidth: 450,
            maxHeight: 450,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
            animation: `${pulse} 8s ease-in-out infinite`,
          }}
        />
        {/* Secondary gradient orb */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '40vw',
            height: '40vw',
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
            animation: `${pulse} 10s ease-in-out 2s infinite`,
          }}
        />
        {/* Accent gradient orb */}
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '10%',
            width: '25vw',
            height: '25vw',
            maxWidth: 250,
            maxHeight: 250,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.12)} 0%, transparent 70%)`,
            animation: `${pulse} 12s ease-in-out 4s infinite`,
          }}
        />
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={mounted} timeout={800}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              p: { xs: 3, sm: 4 },
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.5),
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h1"
                sx={{
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                Kalendar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                K-POP 일정을 한눈에 관리하세요
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="이메일"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
              <GradientButton
                type="submit"
                fullWidth
                loading={isLoading}
                sx={{
                  mb: 2,
                  py: 1.5,
                }}
              >
                로그인
              </GradientButton>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push('/signup')}
                sx={{
                  py: 1.5,
                  borderRadius: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                회원가입
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
