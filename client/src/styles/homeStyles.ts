import { styled } from '@mui/material/styles';
import { Box, Card, Paper } from '@mui/material';

export const StyledControlPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

export const StyledMonitorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.45)',
  },
}));

export const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '56.25%', // 16:9 宽高比
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '& video': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

export const DataDisplayContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

export const ControlButton = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  background: 'linear-gradient(135deg, rgba(2, 136, 209, 0.8), rgba(38, 166, 154, 0.8))',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  textAlign: 'center',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

export const DataValue = styled(Box)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  textAlign: 'center',
  marginBottom: theme.spacing(1),
}));

export const DataLabel = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
  fontSize: '0.875rem',
})); 