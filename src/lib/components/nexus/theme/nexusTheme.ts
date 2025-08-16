// NEXUS Living Interface Theme
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A90E2',
      light: '#7BB3F0',
      dark: '#2E5B9A',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#50C878',
      light: '#7DD896',
      dark: '#3A9B5C',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#000000',
      paper: '#0A0A0A'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#666666'
    },
    grey: {
      50: '#F8F8F8',
      100: '#E8E8E8',
      200: '#D0D0D0',
      300: '#B0B0B0',
      400: '#888888',
      500: '#666666',
      600: '#444444',
      700: '#2A2A2A',
      800: '#1A1A1A',
      900: '#0A0A0A'
    },
    error: {
      main: '#FF6B6B',
      light: '#FF9999',
      dark: '#CC5555'
    },
    warning: {
      main: '#FFD93D',
      light: '#FFE666',
      dark: '#CCAD31'
    },
    info: {
      main: '#6BCFFF',
      light: '#99DFFF',
      dark: '#55A6CC'
    },
    success: {
      main: '#51CF66',
      light: '#7DDF88',
      dark: '#41A652'
    },
    divider: '#333333'
  },
  typography: {
    fontFamily: '"Inter", "Syne", "Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontFamily: '"Syne", sans-serif',
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontFamily: '"Syne", sans-serif', 
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em'
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0, 0, 0, 0.15)',
    '0px 4px 16px rgba(0, 0, 0, 0.2)',
    '0px 8px 32px rgba(0, 0, 0, 0.25)',
    '0px 16px 64px rgba(0, 0, 0, 0.3)',
    '0px 2px 8px rgba(74, 144, 226, 0.15)',
    '0px 4px 16px rgba(74, 144, 226, 0.2)',
    '0px 8px 32px rgba(74, 144, 226, 0.25)',
    '0px 16px 64px rgba(74, 144, 226, 0.3)',
    '0px 2px 8px rgba(80, 200, 120, 0.15)',
    '0px 4px 16px rgba(80, 200, 120, 0.2)',
    '0px 8px 32px rgba(80, 200, 120, 0.25)',
    '0px 16px 64px rgba(80, 200, 120, 0.3)',
    '0px 24px 96px rgba(0, 0, 0, 0.4)',
    '0px 32px 128px rgba(0, 0, 0, 0.5)',
    '0px 40px 160px rgba(0, 0, 0, 0.6)',
    '0px 48px 192px rgba(0, 0, 0, 0.7)',
    '0px 56px 224px rgba(0, 0, 0, 0.8)',
    '0px 64px 256px rgba(0, 0, 0, 0.9)',
    '0px 72px 288px rgba(0, 0, 0, 1)',
    '0px 80px 320px rgba(0, 0, 0, 1)',
    '0px 88px 352px rgba(0, 0, 0, 1)',
    '0px 96px 384px rgba(0, 0, 0, 1)',
    '0px 104px 416px rgba(0, 0, 0, 1)',
    '0px 112px 448px rgba(0, 0, 0, 1)'
  ]
});

export default theme;