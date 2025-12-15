'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Switch,
  Divider,
  TextField,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import InfoIcon from '@mui/icons-material/Info';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/api/client';

export default function SettingsPage() {
  const router = useRouter();
  const { user, getMe } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize nickname from user
  useEffect(() => {
    if (user?.name) {
      setNickname(user.name);
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await userApi.updateMe({ nickname });

      if (updateError) {
        const errorMessage = (updateError as { message?: string }).message || '프로필 수정에 실패했습니다.';
        throw new Error(errorMessage);
      }

      setSuccess('프로필이 수정되었습니다.');
      await getMe(); // Refresh user info
      setTimeout(() => {
        setEditDialogOpen(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('profile_image', file);

      const { error: uploadError } = await userApi.uploadProfileImage(formData);

      if (uploadError) {
        const errorMessage = (uploadError as { message?: string }).message || '프로필 이미지 업로드에 실패했습니다.';
        throw new Error(errorMessage);
      }

      setSuccess('프로필 이미지가 업데이트되었습니다.');
      await getMe(); // Refresh user info
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 이미지 업로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const settingsItems = [
    {
      icon: <NotificationsIcon />,
      label: '알림 설정',
      type: 'switch',
      value: notifications,
      onChange: () => setNotifications(!notifications),
    },
    {
      icon: <DarkModeIcon />,
      label: '다크 모드',
      type: 'switch',
      value: darkMode,
      onChange: () => setDarkMode(!darkMode),
    },
    {
      icon: <LanguageIcon />,
      label: '언어 설정',
      type: 'link',
      subtitle: '한국어',
    },
    {
      icon: <SecurityIcon />,
      label: '개인정보 설정',
      type: 'link',
    },
    {
      icon: <StorageIcon />,
      label: '캐시 삭제',
      type: 'link',
    },
    {
      icon: <InfoIcon />,
      label: '앱 정보',
      type: 'link',
      subtitle: 'v1.0.0',
    },
  ];

  return (
    <MainLayout hideNavigation>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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
          <Typography variant="h2">설정</Typography>
        </Box>

        {error && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Box>
        )}

        {success && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Box>
        )}

        {/* Profile Card */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
                >
                  {!user?.avatar && (user?.name?.charAt(0) || <PersonIcon />)}
                </Avatar>
                <IconButton
                  component="label"
                  disabled={isLoading}
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'background.paper' },
                    width: 28,
                    height: 28,
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                  />
                </IconButton>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3">{user?.name || '게스트'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <IconButton onClick={() => setEditDialogOpen(true)}>
                <EditIcon />
              </IconButton>
            </Box>
          </Card>
        </Box>

        <Box sx={{ p: 2 }}>
          <Card>
            <List disablePadding>
              {settingsItems.map((item, index) => (
                <Box key={item.label}>
                  <ListItem
                    sx={{
                      cursor: item.type === 'link' ? 'pointer' : 'default',
                      '&:hover': item.type === 'link' ? { bgcolor: 'action.hover' } : {},
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.subtitle}
                    />
                    {item.type === 'switch' ? (
                      <Switch
                        edge="end"
                        checked={item.value}
                        onChange={item.onChange}
                        color="secondary"
                      />
                    ) : (
                      <ChevronRightIcon color="action" />
                    )}
                  </ListItem>
                  {index < settingsItems.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Card>
        </Box>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>프로필 수정</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleProfileUpdate} disabled={isLoading} variant="contained">
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
