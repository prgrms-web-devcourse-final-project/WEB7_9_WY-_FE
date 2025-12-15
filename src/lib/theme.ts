'use client';
import { createTheme, alpha } from '@mui/material/styles';

// Type extensions for custom palette properties
declare module '@mui/material/styles' {
  interface TypeBackground {
    surface: string;
    elevated: string;
  }
  interface Palette {
    accent: {
      main: string;
      light: string;
      dark: string;
    };
    event: {
      concert: string;
      fansign: string;
      broadcast: string;
      birthday: string;
    };
  }
  interface PaletteOptions {
    accent?: {
      main: string;
      light: string;
      dark: string;
    };
    event?: {
      concert: string;
      fansign: string;
      broadcast: string;
      birthday: string;
    };
  }
}

// Design tokens - centralized color palette
const tokens = {
  // Common colors
  common: {
    white: '#FFFFFF',
    black: '#000000',
  },
  // Primary colors (Violet)
  violet: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  // Secondary colors (Cyan)
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  // Neutral (Slate)
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  // Event colors
  pink: {
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
  },
  amber: {
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  teal: {
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
  },
  // Status colors
  green: {
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
  },
  red: {
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
  },
};

// Pretendard font stack
const fontFamily = '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: tokens.violet[600],
          dark: tokens.violet[700],
          light: tokens.violet[400],
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: tokens.teal[500],
          light: tokens.teal[400],
          dark: tokens.teal[600],
          contrastText: '#FFFFFF',
        },
        accent: {
          main: tokens.cyan[500],
          light: tokens.cyan[400],
          dark: tokens.cyan[600],
        },
        success: {
          main: tokens.green[500],
          light: tokens.green[400],
          dark: tokens.green[600],
        },
        warning: {
          main: tokens.amber[500],
          light: tokens.amber[400],
          dark: tokens.amber[600],
        },
        error: {
          main: tokens.red[500],
          light: tokens.red[400],
          dark: tokens.red[600],
        },
        info: {
          main: tokens.cyan[500],
          light: tokens.cyan[400],
          dark: tokens.cyan[600],
        },
        background: {
          default: tokens.common.white,
          paper: tokens.common.white,
          surface: tokens.slate[50],
          elevated: tokens.common.white,
        },
        text: {
          primary: tokens.slate[900],
          secondary: tokens.slate[600],
          disabled: tokens.slate[400],
        },
        divider: tokens.slate[200],
        event: {
          concert: tokens.pink[500],
          fansign: tokens.violet[400],
          broadcast: tokens.teal[400],
          birthday: tokens.amber[400],
        },
        contrastThreshold: 4.5,
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: tokens.violet[500],
          dark: tokens.violet[600],
          light: tokens.violet[400],
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: tokens.teal[400],
          light: tokens.teal[300],
          dark: tokens.teal[500],
          contrastText: '#FFFFFF',
        },
        accent: {
          main: tokens.cyan[400],
          light: tokens.cyan[300],
          dark: tokens.cyan[500],
        },
        success: {
          main: tokens.green[500],
          light: tokens.green[400],
          dark: tokens.green[600],
        },
        warning: {
          main: tokens.amber[400],
          light: tokens.amber[400],
          dark: tokens.amber[500],
        },
        error: {
          main: tokens.red[500],
          light: tokens.red[400],
          dark: tokens.red[600],
        },
        info: {
          main: tokens.cyan[400],
          light: tokens.cyan[300],
          dark: tokens.cyan[500],
        },
        background: {
          default: tokens.slate[950],
          paper: tokens.slate[900],
          surface: tokens.slate[800],
          elevated: tokens.slate[700],
        },
        text: {
          primary: tokens.slate[50],
          secondary: tokens.slate[300],
          disabled: tokens.slate[500],
        },
        divider: tokens.slate[700],
        event: {
          concert: tokens.pink[400],
          fansign: tokens.violet[400],
          broadcast: tokens.teal[400],
          birthday: tokens.amber[400],
        },
        contrastThreshold: 4.5,
      },
    },
  },
  typography: {
    fontFamily,
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.375rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"ss01"',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        containedSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
          },
        }),
        outlined: ({ theme }) => ({
          borderWidth: 1.5,
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            borderWidth: 1.5,
            borderColor: theme.palette.primary.light,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
        outlinedSecondary: ({ theme }) => ({
          borderColor: theme.palette.secondary.main,
          color: theme.palette.secondary.main,
          '&:hover': {
            borderColor: theme.palette.secondary.light,
            backgroundColor: alpha(theme.palette.secondary.main, 0.08),
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          border: `1px solid ${theme.vars?.palette.divider || theme.palette.divider}`,
          backgroundColor: theme.vars?.palette.background.paper || theme.palette.background.paper,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: theme.vars?.palette.primary.main || theme.palette.primary.main,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
          '&:focus-within': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        colorPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }),
        colorSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: theme.vars?.palette.background.paper || theme.palette.background.paper,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.vars?.palette.divider || theme.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.vars?.palette.primary.main || theme.palette.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.vars?.palette.primary.main || theme.palette.primary.main,
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: theme.vars?.palette.text.secondary || theme.palette.text.secondary,
            '&.Mui-focused': {
              color: theme.vars?.palette.primary.main || theme.palette.primary.main,
            },
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 16,
          padding: 8,
          backgroundColor: theme.vars?.palette.background.paper || theme.palette.background.paper,
          border: `1px solid ${theme.vars?.palette.divider || theme.palette.divider}`,
        }),
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars?.palette.background.paper || theme.palette.background.paper,
          borderTop: `1px solid ${theme.vars?.palette.divider || theme.palette.divider}`,
          height: 64,
        }),
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars?.palette.text.disabled || theme.palette.text.disabled,
          '&.Mui-selected': {
            color: theme.vars?.palette.primary.main || theme.palette.primary.main,
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
            borderRadius: 4,
          },
        }),
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `2px solid ${theme.vars?.palette.divider || theme.palette.divider}`,
        }),
      },
    },
    MuiBadge: {
      styleOverrides: {
        colorSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars?.palette.background.paper || theme.palette.background.paper,
          color: theme.vars?.palette.text.primary || theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.vars?.palette.divider || theme.palette.divider}`,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 600,
          color: theme.palette.text.secondary,
          '&.Mui-selected': {
            color: theme.palette.primary.main,
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
            borderRadius: 4,
          },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.vars?.palette.background.paper || theme.palette.background.paper,
          borderRight: `1px solid ${theme.vars?.palette.divider || theme.palette.divider}`,
        }),
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiFab: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiFab-secondary': {
            backgroundColor: theme.palette.secondary.main,
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
            },
          },
        }),
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: theme.palette.primary.main,
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.primary.main,
            },
          },
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.vars?.palette.background.paper || theme.palette.background.paper,
          border: `1px solid ${theme.vars?.palette.divider || theme.palette.divider}`,
          borderRadius: 8,
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16),
            },
          },
          '&:focus-visible': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            outline: 'none',
          },
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.vars?.palette.background.paper || theme.palette.background.paper,
          color: theme.vars?.palette.text.primary || theme.palette.text.primary,
          border: `1px solid ${theme.vars?.palette.divider || theme.palette.divider}`,
          fontSize: '0.75rem',
        }),
      },
    },
  },
});

// Export design tokens for direct use when needed
export { tokens };

// Legacy exports for backward compatibility (deprecated)
export const subtleGlow = {
  violet: `0 0 8px ${alpha(tokens.violet[600], 0.7)}`,
  cyan: `0 0 8px ${alpha(tokens.cyan[500], 0.7)}`,
  pink: `0 0 8px ${alpha(tokens.pink[500], 0.7)}`,
  amber: `0 0 8px ${alpha(tokens.amber[400], 0.7)}`,
};

export const neonGlow = subtleGlow;
