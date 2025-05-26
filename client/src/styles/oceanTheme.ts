import { createTheme } from '@mui/material/styles';

export const oceanTheme = createTheme({
  palette: {
    primary: {
      main: '#0288d1', // 深海蓝
      light: '#5eb8ff',
      dark: '#005b9f',
    },
    secondary: {
      main: '#26a69a', // 海藻绿
      light: '#64d8cb',
      dark: '#00766c',
    },
    background: {
      default: '#f5f5f5',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      background: 'linear-gradient(45deg, #0288d1, #26a69a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h6: {
      fontWeight: 500,
      color: '#0288d1',
    },
  },
}); 