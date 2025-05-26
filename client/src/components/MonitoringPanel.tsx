import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Alert,
  CardMedia,
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const MonitoringContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const VideoContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  background: '#000',
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
  position: 'relative',
  minHeight: '400px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '"实时视频监控"',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '1.2rem',
    position: 'absolute',
  },
}));

const VideoOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  color: 'white',
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  fontSize: '0.8rem',
  fontFamily: 'monospace',
  backdropFilter: 'blur(4px)',
}));

const MonitoringPanel: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <MonitoringContainer elevation={3}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: 'primary.main',
          mb: 2,
        }}
      >
        实时监控
      </Typography>
      <VideoContainer>
        <CardMedia
          component="video"
          controls
          src="/data/fish_test.webm"
          sx={{ width: '100%', height: '100%' }}
        />
        <VideoOverlay sx={{ top: 10, left: 10 }}>
          水深: 15m | 温度: 22°C | 可见度: 良好 | 溶氧: 7.2mg/L | pH: 7.5
        </VideoOverlay>
        <VideoOverlay sx={{ bottom: 50, right: 10 }}>
          {currentTime.toLocaleString()}
        </VideoOverlay>
      </VideoContainer>
    </MonitoringContainer>
  );
};

export default MonitoringPanel; 