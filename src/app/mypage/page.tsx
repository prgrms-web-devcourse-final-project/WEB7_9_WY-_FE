'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/authStore';
import { useArtistStore } from '@/stores/artistStore';

export default function MyPage() {
  const router = useRouter();
  const { user, logout, getMe, selectedArtists, isLoggedIn } = useAuthStore();
  const { followingArtists } = useArtistStore();

  // Fetch user info on mount
  useEffect(() => {
    if (isLoggedIn && !user) {
      getMe();
    }
  }, [isLoggedIn, user, getMe]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems: { icon: React.ReactNode; label: string; path: string; count?: number }[] = [
    { icon: <ConfirmationNumberIcon />, label: '예매 내역', path: '/mypage/bookings' },
    { icon: <SettingsIcon />, label: '설정', path: '/mypage/settings' },
    { icon: <HelpIcon />, label: '고객센터', path: '/mypage/help' },
  ];

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Profile Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  fontSize: 24,
                }}
              >
                {user?.name?.charAt(0) || <PersonIcon />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3">{user?.name || '게스트'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || '로그인이 필요합니다'}
                </Typography>
              </Box>
              <Chip label="일반 회원" size="small" />
            </Box>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h3" color="secondary.main">
                  {followingArtists.length || selectedArtists.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  팔로잉
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h3" color="secondary.main">
                  0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  예매
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h3" color="secondary.main">
                  0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  파티
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Menu List */}
        <Card
          sx={{
            bgcolor: 'background.paper',
            '& .MuiListItemIcon-root': {
              color: 'text.secondary',
            },
          }}
        >
          <List disablePadding>
            {menuItems.map((item, index) => (
              <Box key={item.label}>
                <ListItem
                  component="div"
                  onClick={() => router.push(item.path)}
                  sx={{
                    cursor: 'pointer',
                    py: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.count !== undefined && item.count > 0 && (
                      <Chip label={item.count} size="small" color="secondary" />
                    )}
                    <ChevronRightIcon color="action" />
                  </Box>
                </ListItem>
                {index < menuItems.length - 1 && <Divider />}
              </Box>
            ))}
            <Divider />
            <ListItem
              component="div"
              onClick={handleLogout}
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="로그아웃" sx={{ color: 'error.main' }} />
            </ListItem>
          </List>
        </Card>

        {/* App Version */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: 'block', textAlign: 'center', mt: 4 }}
        >
          Fandom App v1.0.0
        </Typography>
      </Box>
    </MainLayout>
  );
}
