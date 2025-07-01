import React, { useState, useEffect, useRef } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Stack,
} from '@mui/material';
import {
  LightbulbOutlined,
  CleaningServices,
  PlayCircleOutline,
  WaterDrop,
  AcUnit,
  LocalDining,
  Settings,
  Folder,
  VideoFile,
  PlayArrow,
  SkipNext,
  SkipPrevious,
  GetApp,
  Fullscreen,
  PictureInPictureAlt,
} from '@mui/icons-material';

interface ControlPanelProps {
  onControlChange?: (control: string, value: boolean | number) => void;
  onVideoChange?: (videoUrl: string) => void;
}

// 视频映射配置
const VIDEO_MAPPINGS = {
  light: '/data/5.mp4',      // 照明系统对应视频5
  cleaner: '/data/2.mp4',    // 清洁系统对应视频2
  feeding: '/data/4.mp4',    // 投喂系统对应视频4
  waterCirculation: '/data/3.mp4', // 水循环系统对应视频3
  temperature: '/data/1.mp4', // 温控系统对应视频1
};

interface HistoryVideo {
  name: string;
  url: string;
  date: string;
}

// 历史视频数据（新增 date 字段，可按需扩展）
const historyGroups: Record<string, HistoryVideo[]> = {
  '2024-03': [
    { name: '设备维护记录', url: '/data/6.mp4', date: '2024-03-10' },
    { name: '系统检修记录', url: '/data/7.mp4', date: '2024-03-20' },
  ],
};

// 记忆播放进度：url -> seconds
const progressMemory: Record<string, number> = {};

const DEFAULT_VIDEO = '/data/fish_test.webm';

const ControlPanel: React.FC<ControlPanelProps> = ({ onControlChange, onVideoChange }) => {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(50);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const [controls, setControls] = useState({
    light: false,
    cleaner: false,
    feeding: false,
    waterCirculation: false,
    temperature: false,
  });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<HistoryVideo | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 监听控制状态变化，更新视频源
  useEffect(() => {
    // 找到最后一个打开的控制开关
    const activeControls = Object.entries(controls).filter(([_, value]) => value);
    if (activeControls.length > 0) {
      const lastControl = activeControls[activeControls.length - 1][0];
      onVideoChange?.(VIDEO_MAPPINGS[lastControl as keyof typeof VIDEO_MAPPINGS]);
    } else {
      // 如果没有开关打开，播放默认视频
      onVideoChange?.(DEFAULT_VIDEO);
    }
  }, [controls, onVideoChange]);

  // 键盘快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!videoDialogOpen) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'Escape') {
        setVideoDialogOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [videoDialogOpen, selectedVideo]);

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

  const handleVideoSelect = (video: HistoryVideo) => {
    // 保存当前播放进度
    if (selectedVideo && videoRef.current) {
      progressMemory[selectedVideo.url] = videoRef.current.currentTime;
    }
    setSelectedVideo(video);
    onVideoChange?.(video.url);
  };

  const handlePrev = () => {
    if (!selectedGroup || !selectedVideo) return;
    const list = historyGroups[selectedGroup];
    const idx = list.findIndex(v => v.url === selectedVideo.url);
    if (idx > 0) handleVideoSelect(list[idx-1]);
  };
  const handleNext = () => {
    if (!selectedGroup || !selectedVideo) return;
    const list = historyGroups[selectedGroup];
    const idx = list.findIndex(v => v.url === selectedVideo.url);
    if (idx < list.length-1) handleVideoSelect(list[idx+1]);
  };

  const handleDialogClose = () => {
    setVideoDialogOpen(false);
    // 恢复实时流
  };

  // 在 selectedVideo 变更后，恢复上次播放进度
  useEffect(() => {
    if (selectedVideo && videoRef.current) {
      const t = progressMemory[selectedVideo.url] || 0;
      videoRef.current.currentTime = t;
      videoRef.current.play();
    }
  }, [selectedVideo]);

  const handleFolderClick = (folder: string) => {
    setExpandedFolder(expandedFolder === folder ? null : folder);
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
            <Typography>历史记录</Typography>
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
      <Dialog open={videoDialogOpen} onClose={handleDialogClose} maxWidth="lg" fullWidth>
        <DialogTitle>历史视频回放</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={4} sx={{ maxHeight: 500, overflowY: 'auto' }}>
              {Object.entries(historyGroups).map(([group, videos]) => (
                <Box key={group}>
                  <ListItemButton onClick={() => setSelectedGroup(selectedGroup===group?null:group)}>
                    <ListItemIcon><Folder/></ListItemIcon>
                    <ListItemText primary={group}/>
                  </ListItemButton>
                  {selectedGroup===group && (
                    <List component="div" disablePadding>
                      {videos.map(v=>(
                        <ListItemButton key={v.url} onClick={()=>handleVideoSelect(v)} selected={selectedVideo?.url===v.url} sx={{ pl: 4 }}>
                          <Avatar variant="square" sx={{ mr:1, width:56, height:42 }}>
                            <PlayArrow/>
                          </Avatar>
                          <ListItemText primary={v.name} secondary={v.date}/>
                        </ListItemButton>
                      ))}
                    </List>)
                  }
                </Box>
              ))}
            </Grid>
            <Grid item xs={8}>
              {selectedVideo ? (
                <Box sx={{ position:'relative' }}>
                  <video ref={videoRef} src={selectedVideo.url} controls style={{ width:'100%', borderRadius:4 }}/>
                  {/* 元数据 & 控件 */}
                  <Stack direction="row" spacing={1} sx={{ mt:1 }}>
                    <Button size="small" startIcon={<SkipPrevious/>} onClick={handlePrev}>上一段</Button>
                    <Button size="small" endIcon={<SkipNext/>} onClick={handleNext}>下一段</Button>
                    <IconButton onClick={()=> videoRef.current?.requestFullscreen()}><Fullscreen/></IconButton>
                    <IconButton onClick={()=> videoRef.current && (videoRef.current as any).requestPictureInPicture?.()}><PictureInPictureAlt/></IconButton>
                    <IconButton component="a" href={selectedVideo.url} download><GetApp/></IconButton>
                  </Stack>
                  <Typography variant="caption" color="textSecondary">{selectedVideo.name} - {selectedVideo.date}</Typography>
          </Box>
              ) : (
                <Typography variant="body2">请选择左侧视频以播放</Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ControlPanel; 