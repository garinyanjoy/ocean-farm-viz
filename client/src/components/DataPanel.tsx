import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  Thermostat as ThermostatIcon,
  Opacity as OpacityIcon,
  Science as ScienceIcon,
  WaterDrop as WaterDropIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface DataPanelProps {
  data: {
    temperature: number;
    oxygen: number;
    ph: number;
    salinity: number;
  };
}

const DataCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    background: 'rgba(255, 255, 255, 0.9)',
  },
}));

const IconWrapper = styled('div')(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, rgba(2, 136, 209, 0.8), rgba(38, 166, 154, 0.8))',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease-in-out',
  '& svg': {
    fontSize: 30,
    color: 'white',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}));

const ValueText = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #0288d1, #26a69a)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(1),
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const LabelText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
  },
}));

const DataPanel: React.FC<DataPanelProps> = ({ data }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          color: 'primary.main',
          textAlign: 'center',
        }}
      >
        环境监测数据
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DataCard elevation={3}>
            <IconWrapper>
              <ThermostatIcon />
            </IconWrapper>
            <ValueText variant="h4">
              {data.temperature}°C
            </ValueText>
            <LabelText>
              水温
            </LabelText>
          </DataCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DataCard elevation={3}>
            <IconWrapper>
              <OpacityIcon />
            </IconWrapper>
            <ValueText variant="h4">
              {data.oxygen}mg/L
            </ValueText>
            <LabelText>
              溶解氧
            </LabelText>
          </DataCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DataCard elevation={3}>
            <IconWrapper>
              <ScienceIcon />
            </IconWrapper>
            <ValueText variant="h4">
              {data.ph}
            </ValueText>
            <LabelText>
              pH值
            </LabelText>
          </DataCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DataCard elevation={3}>
            <IconWrapper>
              <WaterDropIcon />
            </IconWrapper>
            <ValueText variant="h4">
              {data.salinity}‰
            </ValueText>
            <LabelText>
              盐度
            </LabelText>
          </DataCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataPanel; 