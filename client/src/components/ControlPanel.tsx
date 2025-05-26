import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  Switch,
  IconButton,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LightbulbOutlined,
  CleaningServices,
  PlayCircleOutline,
  WaterDrop,
  AcUnit,
  LocalDining,
  Settings,
} from '@mui/icons-material';

interface ControlPanelProps {
  onControlChange?: (control: string, value: boolean | number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onControlChange }) => {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [controls, setControls] = useState({
    light: false,
    cleaner: false,
    feeding: false,
    waterCirculation: false,
    temperature: false,
  });

  const handleControlChange = (control: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setControls({ ...controls, [control]: newValue });
    onControlChange?.(control, newValue);
  };

  const handleLightIntensityChange = (_event: Event, newValue: number | number[]) => {
    const intensity = Array.isArray(newValue) ? newValue[0] : newValue;
    setLightIntensity(intensity);
    onControlChange?.('lightIntensity', intensity);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, bgcolor: 'rgba(255, 255, 255, 0.8)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Settings sx={{ mr: 1 }} />
        设施控制面板
      </Typography>

      <Grid container spacing={3}>
        {/* 照明控制 */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LightbulbOutlined sx={{ mr: 1 }} />
            <Typography>照明系统</Typography>
            <Switch
              checked={controls.light}
              onChange={handleControlChange('light')}
              color="primary"
            />
          </Box>
          {controls.light && (
            <Slider
              value={lightIntensity}
              onChange={handleLightIntensityChange}
              aria-labelledby="light-intensity-slider"
              valueLabelDisplay="auto"
              sx={{ ml: 4 }}
            />
          )}
        </Grid>

        {/* 清洁系统 */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CleaningServices sx={{ mr: 1 }} />
            <Typography>清洁系统</Typography>
            <Switch
              checked={controls.cleaner}
              onChange={handleControlChange('cleaner')}
              color="primary"
            />
          </Box>
        </Grid>

        {/* 投喂系统 */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalDining sx={{ mr: 1 }} />
            <Typography>自动投喂</Typography>
            <Switch
              checked={controls.feeding}
              onChange={handleControlChange('feeding')}
              color="primary"
            />
          </Box>
        </Grid>

        {/* 水循环系统 */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WaterDrop sx={{ mr: 1 }} />
            <Typography>水循环系统</Typography>
            <Switch
              checked={controls.waterCirculation}
              onChange={handleControlChange('waterCirculation')}
              color="primary"
            />
          </Box>
        </Grid>

        {/* 温控系统 */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AcUnit sx={{ mr: 1 }} />
            <Typography>温控系统</Typography>
            <Switch
              checked={controls.temperature}
              onChange={handleControlChange('temperature')}
              color="primary"
            />
          </Box>
        </Grid>

        {/* 视频回放 */}
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PlayCircleOutline sx={{ mr: 1 }} />
            <Typography>视频回放</Typography>
            <IconButton
              color="primary"
              onClick={() => setVideoDialogOpen(true)}
              size="small"
            >
              <PlayCircleOutline />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* 视频回放对话框 */}
      <Dialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>历史视频回放</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            {/* 这里可以添加视频播放器组件 */}
            <Typography>视频回放功能开发中...</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ControlPanel; 