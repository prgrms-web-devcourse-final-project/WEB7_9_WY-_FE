'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SendIcon from '@mui/icons-material/Send';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { userApi, authApiService } from '@/api/client';

export default function MyPage() {
  const { isLoading: isAuthLoading, isAllowed } = useAuthGuard();
  const router = useRouter();
  const theme = useTheme();
  const { user, logout, getMe, isLoggedIn } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상태
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
    open: false,
    type: 'success',
    message: '',
  });

  // 비밀번호 변경
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);

  // 이메일 인증
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'checking' | 'unverified' | 'sending' | 'sent' | 'verifying' | 'verified'>('checking');
  const [verificationCode, setVerificationCode] = useState('');

  // 회원탈퇴
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Fetch user info on mount
  useEffect(() => {
    if (!isAllowed) return;
    if (isLoggedIn && !user) {
      getMe();
    }
  }, [isLoggedIn, user, getMe, isAllowed]);

  // Initialize nickname
  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
    }
  }, [user?.nickname]);

  // Check email verification status
  useEffect(() => {
    const checkEmailStatus = async () => {
      if (!user) return;

      if (user.emailVerified) {
        setEmailVerificationStatus('verified');
        return;
      }

      try {
        const { data } = await authApiService.getEmailStatus();
        if (data?.emailVerified) {
          setEmailVerificationStatus('verified');
        } else {
          setEmailVerificationStatus('unverified');
        }
      } catch {
        setEmailVerificationStatus('unverified');
      }
    };

    if (isAllowed && user) {
      checkEmailStatus();
    }
  }, [isAllowed, user]);

  const showSnackbar = (type: 'success' | 'error', message: string) => {
    setSnackbar({ open: true, type, message });
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // 프로필 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { error } = await userApi.uploadProfileImage(formData);
      if (error) throw new Error('이미지 업로드에 실패했습니다.');

      await getMe();
      showSnackbar('success', '프로필 이미지가 변경되었습니다.');
    } catch (err) {
      showSnackbar('error', err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 닉네임 저장
  const handleSaveNickname = async () => {
    if (!nickname.trim() || nickname === user?.nickname) {
      setIsEditingNickname(false);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await userApi.updateMe({ nickname: nickname.trim() });
      if (error) throw new Error('닉네임 변경에 실패했습니다.');

      await getMe();
      showSnackbar('success', '닉네임이 변경되었습니다.');
      setIsEditingNickname(false);
    } catch (err) {
      showSnackbar('error', err instanceof Error ? err.message : '닉네임 변경에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 비밀번호 재설정 이메일 발송
  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setIsSendingPasswordReset(true);
    try {
      const { error } = await authApiService.sendPasswordReset({ email: user.email });
      if (error) throw new Error('비밀번호 재설정 이메일 발송에 실패했습니다.');

      showSnackbar('success', '비밀번호 재설정 이메일이 발송되었습니다.');
    } catch (err) {
      showSnackbar('error', err instanceof Error ? err.message : '이메일 발송에 실패했습니다.');
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  // 이메일 인증 요청
  const handleSendEmailVerification = async () => {
    if (!user?.email) return;

    setEmailVerificationStatus('sending');
    try {
      const { error } = await authApiService.sendEmailVerification({ email: user.email });
      if (error) throw new Error('인증 이메일 발송에 실패했습니다.');

      setEmailVerificationStatus('sent');
      showSnackbar('success', '인증 코드가 이메일로 발송되었습니다.');
    } catch (err) {
      setEmailVerificationStatus('unverified');
      showSnackbar('error', err instanceof Error ? err.message : '이메일 발송에 실패했습니다.');
    }
  };

  // 이메일 인증 확인
  const handleVerifyEmail = async () => {
    if (!user?.email || !verificationCode.trim()) return;

    setEmailVerificationStatus('verifying');
    try {
      const { error } = await authApiService.verifyEmail({
        email: user.email,
        code: verificationCode.trim()
      });
      if (error) throw new Error('인증 코드가 올바르지 않습니다.');

      setEmailVerificationStatus('verified');
      await getMe();
      showSnackbar('success', '이메일 인증이 완료되었습니다.');
    } catch (err) {
      setEmailVerificationStatus('sent');
      showSnackbar('error', err instanceof Error ? err.message : '인증에 실패했습니다.');
    }
  };

  // 회원탈퇴
  const handleDeleteAccount = () => {
    // TODO: 백엔드 API 구현 후 연동
    showSnackbar('error', '회원탈퇴 기능은 현재 준비 중입니다.');
    setIsDeleteDialogOpen(false);
    setDeletePassword('');
  };

  const navigationItems = [
    { icon: <GroupIcon />, label: '내 파티', description: '참여 중인 파티 관리', path: '/party/my-parties' },
    { icon: <MusicNoteIcon />, label: '내 아티스트', description: '팔로우 아티스트 관리', path: '/artists' },
    { icon: <ConfirmationNumberIcon />, label: '예매 내역', description: '티켓 예매 확인', path: '/mypage/bookings' },
  ];

  // 성별 한글 변환
  const getGenderText = (gender?: 'MALE' | 'FEMALE') => {
    if (gender === 'MALE') return '남성';
    if (gender === 'FEMALE') return '여성';
    return '-';
  };

  if (isAuthLoading) {
    return <LoadingSpinner fullScreen message="로딩 중..." />;
  }

  if (!isAllowed) {
    return null;
  }

  // 섹션 스타일
  const sectionStyle = {
    py: 3,
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

  const sectionTitleStyle = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'text.secondary',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    mb: 2,
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            계정 설정
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            프로필 정보와 계정을 관리합니다
          </Typography>
        </Box>

        {/* Main Grid - 2 Columns on Desktop */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
            gap: { xs: 0, md: 6 },
          }}
        >
          {/* Left Column - Profile */}
          <Box>
            {/* Profile Section */}
            <Box sx={{ ...sectionStyle, pt: 0 }}>
              <Typography sx={sectionTitleStyle}>프로필</Typography>

              {/* Avatar with upload */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={user?.profileImage || user?.avatar}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: theme.palette.primary.main,
                      fontSize: 32,
                    }}
                  >
                    {user?.nickname?.charAt(0) || user?.name?.charAt(0) || <PersonIcon sx={{ fontSize: 32 }} />}
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      bgcolor: theme.palette.background.paper,
                      border: `2px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[2],
                      width: 28,
                      height: 28,
                      '&:hover': { bgcolor: theme.palette.action.hover },
                    }}
                  >
                    {isUploading ? <CircularProgress size={14} /> : <CameraAltIcon sx={{ fontSize: 14 }} />}
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    프로필 사진
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    JPG, PNG 형식 (최대 5MB)
                  </Typography>
                </Box>
              </Box>

              {/* Info Table */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Nickname Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="caption" color="text.secondary">닉네임</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    {isEditingNickname ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          size="small"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          autoFocus
                          sx={{ flex: 1 }}
                          inputProps={{ style: { padding: '6px 12px' } }}
                        />
                        <IconButton
                          size="small"
                          onClick={handleSaveNickname}
                          disabled={isSaving}
                          color="primary"
                        >
                          {isSaving ? <CircularProgress size={18} /> : <CheckIcon fontSize="small" />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setIsEditingNickname(false);
                            setNickname(user?.nickname || '');
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {user?.nickname || user?.name || '-'}
                        </Typography>
                        <IconButton size="small" onClick={() => setIsEditingNickname(true)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Email Row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ minWidth: 80, pt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">이메일</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {user?.email || '-'}
                      </Typography>
                      {emailVerificationStatus === 'verified' ? (
                        <Chip
                          icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                          label="인증됨"
                          size="small"
                          color="success"
                          sx={{ height: 22, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                        />
                      ) : emailVerificationStatus !== 'checking' && (
                        <Chip
                          icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                          label="미인증"
                          size="small"
                          color="warning"
                          sx={{ height: 22, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Age Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="caption" color="text.secondary">나이</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {user?.age ? `${user.age}세` : '-'}
                    </Typography>
                  </Box>
                </Box>

                {/* Gender Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ minWidth: 80 }}>
                    <Typography variant="caption" color="text.secondary">성별</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {getGenderText(user?.gender)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Email Verification Section */}
            {emailVerificationStatus !== 'verified' && emailVerificationStatus !== 'checking' && (
              <Box sx={sectionStyle}>
                <Typography sx={sectionTitleStyle}>이메일 인증</Typography>
                <Alert
                  severity="warning"
                  sx={{ mb: 2 }}
                  icon={<WarningAmberIcon fontSize="small" />}
                >
                  이메일 인증을 완료해주세요
                </Alert>

                {emailVerificationStatus === 'unverified' && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SendIcon />}
                    onClick={handleSendEmailVerification}
                    fullWidth
                  >
                    인증 이메일 발송
                  </Button>
                )}

                {emailVerificationStatus === 'sending' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">발송 중...</Typography>
                  </Box>
                )}

                {(emailVerificationStatus === 'sent' || emailVerificationStatus === 'verifying') && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="인증 코드"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      sx={{ flex: 1 }}
                      inputProps={{ style: { padding: '8px 12px' } }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleVerifyEmail}
                      disabled={emailVerificationStatus === 'verifying' || !verificationCode.trim()}
                      sx={{ minWidth: 80 }}
                    >
                      {emailVerificationStatus === 'verifying' ? <CircularProgress size={18} /> : '확인'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Right Column - Actions & Navigation */}
          <Box>
            {/* Quick Navigation */}
            <Box sx={{ ...sectionStyle, pt: { xs: 3, md: 0 } }}>
              <Typography sx={sectionTitleStyle}>바로가기</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {navigationItems.map((item) => (
                  <Box
                    key={item.path}
                    onClick={() => router.push(item.path)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.primary.main,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.description}
                      </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Security Section */}
            <Box sx={sectionStyle}>
              <Typography sx={sectionTitleStyle}>보안</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Password Change */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LockResetIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        비밀번호 변경
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        이메일로 재설정 링크가 발송됩니다
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handlePasswordReset}
                    disabled={isSendingPasswordReset}
                    sx={{ minWidth: 100 }}
                  >
                    {isSendingPasswordReset ? <CircularProgress size={18} /> : '변경 요청'}
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Account Section */}
            <Box sx={{ ...sectionStyle, borderBottom: 'none' }}>
              <Typography sx={sectionTitleStyle}>계정</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Logout */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        로그아웃
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        현재 기기에서 로그아웃합니다
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleLogout}
                    sx={{ minWidth: 100 }}
                  >
                    로그아웃
                  </Button>
                </Box>

                {/* Delete Account */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.error.main,
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="error">
                        회원탈퇴
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        모든 데이터가 삭제됩니다
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    sx={{ minWidth: 100 }}
                  >
                    탈퇴하기
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 6, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.disabled">
            Kalendar v1.0.0
          </Typography>
        </Box>

        {/* Delete Account Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">회원탈퇴</Typography>
          </DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </Alert>
            <TextField
              fullWidth
              type="password"
              label="비밀번호 확인"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              size="small"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletePassword('');
              }}
            >
              취소
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={!deletePassword}
              onClick={handleDeleteAccount}
            >
              탈퇴하기
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.type}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
