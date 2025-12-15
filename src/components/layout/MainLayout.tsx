'use client';

import { ReactNode } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import GlobalHeader from './GlobalHeader';
import Navigation from './Navigation';

interface MainLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  hideHeader?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export default function MainLayout({
  children,
  hideNavigation = false,
  hideHeader = false,
  maxWidth,
}: MainLayoutProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with hamburger menu */}
      {!hideHeader && <GlobalHeader />}

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Container
          maxWidth={maxWidth !== undefined ? maxWidth : (isDesktop ? 'lg' : 'sm')}
          disableGutters={!isDesktop}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: hideHeader ? 0 : '56px',
            pb: !isDesktop && !hideNavigation ? '64px' : 0,
            px: isDesktop ? 3 : 2,
          }}
        >
          <Box
            component="main"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              pt: isDesktop && !hideHeader ? 2 : 0,
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>

      {/* Mobile Bottom Navigation */}
      {!hideNavigation && !isDesktop && <Navigation />}
    </Box>
  );
}
