'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonIcon from '@mui/icons-material/Person';

const navItems = [
  { label: '캘린더', icon: <CalendarMonthIcon />, path: '/kalendar' },
  { label: '파티', icon: <GroupsIcon />, path: '/party' },
  { label: '채팅', icon: <ChatBubbleIcon />, path: '/chats' },
  { label: 'MY', icon: <PersonIcon />, path: '/mypage' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  // /artists 경로도 캘린더 탭에 속함
  const getCurrentValue = () => {
    if (pathname.startsWith('/artists')) {
      return 0; // 캘린더 탭 인덱스
    }
    const index = navItems.findIndex((item) => pathname.startsWith(item.path));
    return index >= 0 ? index : 0;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    router.push(navItems[newValue].path);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
      }}
      elevation={3}
    >
      <Box
        sx={{
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        <BottomNavigation
          value={getCurrentValue()}
          onChange={handleChange}
          showLabels
          component="nav"
          aria-label="메인 네비게이션"
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              py: 1,
              '&.Mui-selected': {
                '& .MuiSvgIcon-root': {
                  transform: 'scale(1.1)',
                },
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '11px',
              mt: 0.5,
              '&.Mui-selected': {
                fontSize: '11px',
                fontWeight: 600,
              },
            },
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Box>
    </Paper>
  );
}
