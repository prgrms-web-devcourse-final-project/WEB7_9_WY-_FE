'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link,
  Fade,
} from '@mui/material';
import { useTheme, alpha, keyframes } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuthStore } from '@/stores/authStore';
import { GradientButton } from '@/components/common';

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

export default function SignupPage() {
  const router = useRouter();
  const theme = useTheme();
  const { signup, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Terms agreement states
  const [ageAgreement, setAgeAgreement] = useState(false);
  const [termsAgreement, setTermsAgreement] = useState(false);
  const [marketingAgreement, setMarketingAgreement] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRequiredAgreed = ageAgreement && termsAgreement;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (!isRequiredAgreed) {
      setLocalError('필수 약관에 동의해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setLocalError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    try {
      await signup({
        name,
        email,
        password,
        nickname: name,
        gender: 'ANY',
        birthDate: '2000-01-01',
      });

      // Check auth state after signup
      const { isLoggedIn } = useAuthStore.getState();
      if (isLoggedIn) {
        router.push('/onboarding');
      }
    } catch (error) {
      // Error is already set in the store
      console.error('Signup failed:', error);
    }
  };

  const displayError = localError || error;

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
        py: 4,
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
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '60%',
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
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton
                onClick={() => router.back()}
                sx={{ mr: 1 }}
                aria-label="뒤로 가기"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h2" component="h1" color="primary.main">
                회원가입
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 6 }}>
              K-POP 일정을 한눈에 관리하세요
            </Typography>

            {displayError && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => {
                  clearError();
                  setLocalError('');
                }}
              >
                {displayError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
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
                sx={{ mb: 2 }}
                required
                helperText="6자 이상 입력해주세요"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
              <TextField
                fullWidth
                label="비밀번호 확인"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3 }}
                required
                error={confirmPassword !== '' && password !== confirmPassword}
                helperText={
                  confirmPassword !== '' && password !== confirmPassword
                    ? '비밀번호가 일치하지 않습니다'
                    : ''
                }
              />

              {/* Terms Agreement Section */}
              <Box
                sx={{
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={ageAgreement}
                        onChange={(e) => setAgeAgreement(e.target.checked)}
                        icon={<CheckCircleOutlineIcon />}
                        checkedIcon={<CheckCircleIcon />}
                        sx={{ color: 'primary.main' }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        만 14세 이상입니다{' '}
                        <Typography component="span" color="error.main">
                          (필수)
                        </Typography>
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAgreement}
                        onChange={(e) => setTermsAgreement(e.target.checked)}
                        icon={<CheckCircleOutlineIcon />}
                        checkedIcon={<CheckCircleIcon />}
                        sx={{ color: 'primary.main' }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        <Link href="#" underline="hover" color="primary.main">
                          이용약관
                        </Link>{' '}
                        및{' '}
                        <Link href="#" underline="hover" color="primary.main">
                          개인정보 처리방침
                        </Link>
                        에 동의합니다{' '}
                        <Typography component="span" color="error.main">
                          (필수)
                        </Typography>
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={marketingAgreement}
                        onChange={(e) => setMarketingAgreement(e.target.checked)}
                        icon={<CheckCircleOutlineIcon />}
                        checkedIcon={<CheckCircleIcon />}
                        sx={{ color: 'primary.main' }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        마케팅 정보 수신에 동의합니다 (선택)
                      </Typography>
                    }
                  />
                </FormGroup>
              </Box>

              <GradientButton
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={!isRequiredAgreed}
                sx={{ py: 1.5 }}
              >
                가입하기
              </GradientButton>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
