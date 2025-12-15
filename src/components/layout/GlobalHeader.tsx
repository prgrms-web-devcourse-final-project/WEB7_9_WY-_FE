'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Button,
  Tab,
  Tabs,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import LoginIcon from '@mui/icons-material/Login';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useThemeMode } from '@/providers/ThemeModeProvider';
import NotificationDropdown from './NotificationDropdown';
import type { Theme, SxProps } from '@mui/material/styles';

const navItems = [
  { label: '캘린더', icon: <CalendarMonthIcon fontSize="small" />, path: '/calendar' },
  { label: '아티스트', icon: <PeopleIcon fontSize="small" />, path: '/artists' },
  { label: '파티', icon: <GroupsIcon fontSize="small" />, path: '/party' },
  { label: '채팅', icon: <ChatBubbleIcon fontSize="small" />, path: '/chats' },
  { label: 'MY', icon: <PersonIcon fontSize="small" />, path: '/mypage' },
];

// 스타일 객체 분리 - 가독성 및 재사용성 향상
const getTabsStyles = (theme: Theme): SxProps<Theme> => ({
  minHeight: 56,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    bgcolor: theme.palette.primary.main,
  },
  '& .MuiTab-root': {
    minHeight: 56,
    minWidth: 'auto',
    px: 2,
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textTransform: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: theme.palette.primary.main,
      bgcolor: alpha(theme.palette.primary.main, 0.04),
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
});

const getMenuItemStyles = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    bgcolor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
});

export default function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { user, isLoggedIn, isGuestMode, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { resolvedMode, setMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  // 현재 활성 탭 인덱스 찾기
  const getCurrentTabIndex = () => {
    const index = navItems.findIndex((item) => pathname.startsWith(item.path));
    return index >= 0 ? index : 0;
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push('/login');
  };

  const handleMyPage = () => {
    handleMenuClose();
    router.push('/mypage');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    router.push(navItems[newValue].path);
  };

  const toggleTheme = () => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        {/* Left: Logo */}
        <Typography
          variant="h5"
          component="div"
          onClick={() => router.push('/calendar')}
          sx={{
            cursor: 'pointer',
            color: theme.palette.primary.main,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          Fandom
        </Typography>

        {/* Center: Navigation Tabs (Desktop only) */}
        {isDesktop && (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Tabs
              value={getCurrentTabIndex()}
              onChange={handleTabChange}
              sx={getTabsStyles(theme)}
            >
              {navItems.map((item) => (
                <Tab
                  key={item.path}
                  icon={item.icon}
                  iconPosition="start"
                  label={item.label}
                  sx={{
                    gap: 0.5,
                    '& .MuiTab-iconWrapper': {
                      marginRight: 0.5,
                      marginBottom: '0 !important',
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Right: Theme Toggle, Notifications & Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            size="small"
            aria-label={resolvedMode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            sx={{
              color: theme.palette.text.primary,
              opacity: 0.8,
              '&:hover': {
                color: theme.palette.primary.main,
                opacity: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {resolvedMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {isLoggedIn ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleNotificationOpen}
                size="small"
                aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : '알림'}
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '0.7rem',
                      minWidth: 18,
                      height: 18,
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Notification Dropdown */}
              <NotificationDropdown
                anchorEl={notificationAnchorEl}
                onClose={handleNotificationClose}
              />

              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0, ml: 0.5 }}
                aria-label="프로필 메뉴 열기"
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl)}
              >
                <Avatar
                  src={user?.avatar}
                  alt={user?.name ? `${user.name}의 프로필 사진` : '프로필'}
                  sx={{
                    width: 32,
                    height: 32,
                    border: `2px solid ${theme.palette.primary.main}`,
                    bgcolor: theme.palette.primary.light,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.name?.charAt(0) || <PersonIcon fontSize="small" />}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.5,
                      minWidth: 180,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body1" fontWeight={600} color="text.primary">
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={handleMyPage}
                  sx={getMenuItemStyles(theme)}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  마이페이지
                </MenuItem>
                <MenuItem
                  onClick={handleMenuClose}
                  sx={getMenuItemStyles(theme)}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  설정
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: theme.palette.error.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  로그아웃
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              startIcon={<LoginIcon />}
              onClick={() => router.push('/login')}
              size="small"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 500,
                '&:hover': {
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              {isGuestMode ? '로그인' : '로그인'}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
