// Advanced theme for perfected NEXUS interface
import { createTheme } from '@mui/material/styles';

const advancedNexusTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A90E2', // Quantum Blue
      light: '#7BB3F0',
      dark: '#2E5B9A',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#50C878', // Neural Green
      light: '#7DD896', 
      dark: '#3A9B5C',
      contrastText: '#FFFFFF'
    },
    // Quantum Computing Colors
    info: {
      main: '#00D4FF', // Quantum Cyan
      light: '#4DDDFF',
      dark: '#0099CC',
      contrastText: '#000000'
    },
    // Neuromorphic Computing Colors
    success: {
      main: '#00FF88', // Neural Lime
      light: '#4DFFAA',
      dark: '#00CC66',
      contrastText: '#000000'
    },
    // XR Technology Colors
    warning: {
      main: '#FF6B00', // XR Orange
      light: '#FF9944',
      dark: '#CC5500',
      contrastText: '#FFFFFF'
    },
    // AI/ML Colors
    error: {
      main: '#FF0080', // AI Magenta
      light: '#FF44AA',
      dark: '#CC0066',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#000000', // Quantum Void
      paper: '#0A0A0A' // Neural Dark
    },
    text: {
      primary: '#FFFFFF', // Quantum White
      secondary: '#B0B0B0', // Neural Gray
      disabled: '#666666' // Disabled Gray
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
    divider: '#333333'
  },
  typography: {
    fontFamily: '"Inter", "Syne", "Space Grotesk", "JetBrains Mono", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontFamily: '"Syne", sans-serif',
      fontSize: '4rem',
      fontWeight: 800,
      lineHeight: 1.1,
      background: 'linear-gradient(45deg, #4A90E2, #00D4FF, #50C878)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    h2: {
      fontFamily: '"Syne", sans-serif',
      fontSize: '3rem', 
      fontWeight: 700,
      lineHeight: 1.2,
      background: 'linear-gradient(45deg, #50C878, #00FF88)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text', 
      WebkitTextFillColor: 'transparent'
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3
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
    },
    caption: {
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em'
    }
  },
  shape: {
    borderRadius: 16
  },
  shadows: [
    'none',
    // Quantum Shadows
    '0px 2px 8px rgba(74, 144, 226, 0.15)',
    '0px 4px 16px rgba(74, 144, 226, 0.2)', 
    '0px 8px 32px rgba(74, 144, 226, 0.25)',
    '0px 16px 64px rgba(74, 144, 226, 0.3)',
    // Neural Shadows
    '0px 2px 8px rgba(80, 200, 120, 0.15)',
    '0px 4px 16px rgba(80, 200, 120, 0.2)',
    '0px 8px 32px rgba(80, 200, 120, 0.25)', 
    '0px 16px 64px rgba(80, 200, 120, 0.3)',
    // XR Shadows
    '0px 2px 8px rgba(255, 107, 0, 0.15)',
    '0px 4px 16px rgba(255, 107, 0, 0.2)',
    '0px 8px 32px rgba(255, 107, 0, 0.25)',
    '0px 16px 64px rgba(255, 107, 0, 0.3)',
    // AI Shadows
    '0px 2px 8px rgba(255, 0, 128, 0.15)',
    '0px 4px 16px rgba(255, 0, 128, 0.2)',
    '0px 8px 32px rgba(255, 0, 128, 0.25)',
    '0px 16px 64px rgba(255, 0, 128, 0.3)',
    // Advanced Shadows
    '0px 24px 96px rgba(0, 212, 255, 0.4)',
    '0px 32px 128px rgba(0, 255, 136, 0.5)',
    '0px 40px 160px rgba(255, 107, 0, 0.6)',
    '0px 48px 192px rgba(255, 0, 128, 0.7)',
    '0px 56px 224px rgba(74, 144, 226, 0.8)',
    '0px 64px 256px rgba(80, 200, 120, 0.9)',
    '0px 72px 288px rgba(0, 212, 255, 1)',
    '0px 80px 320px rgba(0, 255, 136, 1)'
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'radial-gradient(ellipse at center, #0A0A0A 0%, #000000 70%)',
          backgroundAttachment: 'fixed'
        }
      }
    }
  }
});

export default advancedNexusTheme;