'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { authApiService } from '@/api/client';

function PasswordResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 비밀번호 유효성 검사
  const isPasswordValid = newPassword.length >= 8;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = isPasswordValid && doPasswordsMatch && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setStatus('error');
      setErrorMessage('유효하지 않은 토큰입니다.');
      return;
    }

    if (!canSubmit) return;

    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const { error } = await authApiService.resetPassword({
        token,
        newPassword,
        newPasswordConfirm: confirmPassword,
      });

      if (error) {
        throw new Error((error as { message?: string }).message || '비밀번호 변경에 실패했습니다.');
      }

      setStatus('success');
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 토큰이 없는 경우
  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            잘못된 접근입니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            유효하지 않은 비밀번호 재설정 링크입니다.
            <br />
            이메일에서 링크를 다시 확인해주세요.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/login')}
            fullWidth
          >
            로그인 페이지로 이동
          </Button>
        </Box>
      </Box>
    );
  }

  // 성공 상태
  if (status === 'success') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            비밀번호가 변경되었습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            새 비밀번호로 로그인해주세요.
            <br />
            잠시 후 로그인 페이지로 이동합니다.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/login')}
            fullWidth
          >
            로그인 페이지로 이동
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            새 비밀번호 설정
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            새로운 비밀번호를 입력해주세요.
          </Typography>
        </Box>

        {/* Error Alert */}
        {status === 'error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type={showNewPassword ? 'text' : 'password'}
            label="새 비밀번호"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8자 이상 입력해주세요"
            error={newPassword.length > 0 && !isPasswordValid}
            helperText={
              newPassword.length > 0 && !isPasswordValid
                ? '비밀번호는 8자 이상이어야 합니다.'
                : ''
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            label="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력해주세요"
            error={confirmPassword.length > 0 && !doPasswordsMatch}
            helperText={
              confirmPassword.length > 0 && !doPasswordsMatch
                ? '비밀번호가 일치하지 않습니다.'
                : ''
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              '비밀번호 변경'
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="text"
            onClick={() => router.push('/login')}
            sx={{ color: 'text.secondary' }}
          >
            로그인 페이지로 돌아가기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <PasswordResetContent />
    </Suspense>
  );
}
