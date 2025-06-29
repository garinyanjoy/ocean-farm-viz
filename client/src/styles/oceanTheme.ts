import { createTheme } from '@mui/material/styles';

export const oceanTheme = {
  // 基础颜色
  primary: '#2196f3',       // 海洋蓝
  secondary: '#ffeb3b',     // 阳光黄
  sand: '#ffe0b2',          // 沙滩米
  deepBlue: '#01579b',      // 深海蓝
  sky: '#81d4fa',           // 天空蓝
  coral: '#ff7043',         // 珊瑚色
  seaweed: '#4caf50',       // 海藻绿
  shell: '#f5f5f5',         // 贝壳白
  
  // 文本颜色
  text: '#01579b',          // 主文本-深蓝
  lightText: '#4fc3f7',     // 次要文本-浅蓝
  white: '#ffffff',         // 白色文本
  
  // 边框和装饰
  border: '#b3e5fc',        // 边框-浅蓝
  wave: '#00bcd4',          // 波浪-青色
  
  // 背景和渐变
  cardBg: 'linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%)',
  headerBg: 'linear-gradient(90deg, #81d4fa 0%, #fffde4 100%)',
  buttonGradient: 'linear-gradient(90deg, #4fc3f7 0%, #ffeb3b 100%)',
  panelGradient: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(179,229,252,0.8) 100%)',
  
  // 阴影
  shadow: '0 4px 24px rgba(33,150,243,0.08)',
  cardShadow: '0 8px 32px rgba(0,188,212,0.12)',
  buttonShadow: '0 2px 8px rgba(179,229,252,0.5)',
  
  // 动画时间
  transitionFast: '0.2s',
  transitionNormal: '0.3s',
  transitionSlow: '0.5s',
};

// 创建MUI主题
export const muiTheme = createTheme({
  palette: {
    primary: {
      main: oceanTheme.primary,
    },
    secondary: {
      main: oceanTheme.secondary,
    },
    background: {
      default: oceanTheme.shell,
      paper: oceanTheme.white,
    },
    text: {
      primary: oceanTheme.text,
      secondary: oceanTheme.lightText,
    },
  },
  typography: {
    fontFamily: "'Alibaba PuHuiTi', 'Google Sans', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      color: oceanTheme.deepBlue,
    },
    h2: {
      fontWeight: 600,
      color: oceanTheme.deepBlue,
    },
    h3: {
      fontWeight: 600,
      color: oceanTheme.deepBlue,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '10px 24px',
          boxShadow: oceanTheme.buttonShadow,
          transition: `all ${oceanTheme.transitionNormal}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(33,150,243,0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: oceanTheme.cardShadow,
          overflow: 'visible',
        },
      },
    },
  },
});

export default oceanTheme; 