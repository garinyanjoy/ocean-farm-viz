import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Paper, 
  Stack, 
  Chip, 
  Alert, 
  Button,
  Grid,
  Switch,
  IconButton,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  LightbulbOutlined,
  CleaningServices,
  PlayCircleOutline,
  WaterDrop,
  AcUnit,
  LocalDining,
  WbSunny,
  Waves,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import ControlPanel from '../components/ControlPanel';

// 配置axios默认设置
axios.defaults.withCredentials = false;

// 样式组件
const OceanPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(230,244,255,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0,150,255,0.1)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #2196f3, #00bcd4, #4caf50)',
  },
}));

const ControlButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(255,255,255,0.9)',
  color: theme.palette.primary.main,
  border: '1px solid rgba(0,150,255,0.3)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.95)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,150,255,0.2)',
  },
  transition: 'all 0.3s ease-in-out',
}));

interface MonitoringData {
  timestamp: string;
  camera_id: string;
  location: string;
  environment: {
    water_temperature: number;
    depth: number;
    visibility: string;
    dissolved_oxygen: number;
    pH: number;
  };
  fish_activity: {
    count: number;
    main_species: string;
    movement_level: string;
    health_status: string;
  };
  alerts: Array<{
    type: string;
    level: string;
    message: string;
  }>;
}

interface WaterQualityData {
  temp: number;      // °C
  ph: number;        // pH
  sal: number;       // 盐度 ‰
  do: number;        // 溶解氧 mg/L
  turbidity: number; // 浊度 NTU
  nh3: number;       // 氨氮 mg/L
  no3: number;       // 硝酸盐 mg/L
}

// 简易随机函数
const randomFloat = (min: number, max: number, decimals = 1) => {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
};

const genRandomQuality = (): WaterQualityData => ({
  temp: randomFloat(20, 28, 1),
  ph: randomFloat(7.5, 8.5, 2),
  sal: randomFloat(30, 35, 1),
  do: randomFloat(6, 9, 1),
  turbidity: randomFloat(0, 5, 1),
  nh3: randomFloat(0, 0.5, 2),
  no3: randomFloat(0, 10, 1),
});

// 默认实时监控视频URL
const DEFAULT_LIVE_VIDEO = '/data/fish_test.webm';

// 视频映射配置
const VIDEO_MAPPINGS: Record<string, number> = {
  light: 5,      // 照明系统对应视频5
  cleaner: 2,    // 清洁系统对应视频2
  feeding: 4,    // 投喂系统对应视频4
  waterCirculation: 3, // 水循环系统对应视频3
  temperature: 1, // 温控系统对应视频1
};

const Home: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState(DEFAULT_LIVE_VIDEO);
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [controls, setControls] = useState({
    light: false,
    cleaner: false,
    feeding: false,
    waterCirculation: false,
    temperature: false,
  });
  const [lightIntensity, setLightIntensity] = useState(50);
  const [waterQuality, setWaterQuality] = useState<WaterQualityData>(genRandomQuality());
  
  // 实时时钟更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 定时刷新水质数据
  useEffect(() => {
    const t = setInterval(()=> setWaterQuality(genRandomQuality()), 5000);
    return () => clearInterval(t);
  }, []);

  const handleControlChange = (control: string, value: boolean | number) => {
    if (typeof value === 'boolean') {
      setControls(prev => ({ ...prev, [control]: value }));
      // 如果关闭某个控制，返回默认视频
      if (!value) {
        setCurrentVideo(DEFAULT_LIVE_VIDEO);
        setIsLiveStream(true);
      }
    } else if (control === 'lightIntensity') {
      setLightIntensity(value);
    }
  };

  const handleLightIntensityChange = (_event: Event, newValue: number | number[]) => {
    setLightIntensity(Array.isArray(newValue) ? newValue[0] : newValue);
  };
  
  // 从后端获取监控数据
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      console.log("正在请求监控数据...");
      const response = await axios.get('http://localhost:5000/api/monitoring-data');
      console.log("收到监控数据:", response.data);
      setMonitoringData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('获取监控数据失败:', err);
      let errorMessage = '获取监控数据失败，请稍后重试';
      if (err.response) {
        console.error('错误状态码:', err.response.status);
        console.error('错误数据:', err.response.data);
        errorMessage += ` (错误: ${err.response.status})`;
      } else if (err.request) {
        console.error('未收到响应:', err.request);
        errorMessage += ' (无响应)';
      } else {
        console.error('请求错误:', err.message);
        errorMessage += ` (${err.message})`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // 测试API连接
  const testApiConnection = async () => {
    try {
      console.log("测试API连接...");
      const response = await axios.get('http://localhost:5000/api/test');
      console.log("API测试响应:", response.data);
      alert(`API连接成功: ${response.data.message}`);
    } catch (err: any) {
      console.error('API测试失败:', err);
      alert(`API连接失败: ${err.message}`);
    }
  };
  
  // 初始加载和定期刷新数据
  useEffect(() => {
    fetchMonitoringData();
    const dataRefreshTimer = setInterval(() => {
      fetchMonitoringData();
    }, 30000);
    return () => clearInterval(dataRefreshTimer);
  }, []);

  // 确保组件加载时使用默认视频
  useEffect(() => {
    setCurrentVideo(DEFAULT_LIVE_VIDEO);
  }, []);

  const handleVideoChange = (videoUrl: string) => {
    console.log("切换视频到:", videoUrl); // 添加日志帮助调试
    setCurrentVideo(videoUrl);
    // 如果是视频6或7（历史记录），则设置为非实时流
    setIsLiveStream(!videoUrl.includes('6.mp4') && !videoUrl.includes('7.mp4'));
  };

  const handleReturnToLive = () => {
    // 找到最后一个打开的控制开关对应的视频，如果没有则播放默认视频
    const activeControls = Object.entries(controls).filter(([_, value]) => value);
    if (activeControls.length > 0) {
      const lastControl = activeControls[activeControls.length - 1][0];
      const videoUrl = `/data/${VIDEO_MAPPINGS[lastControl]}.mp4`;
      console.log("返回到活动控制视频:", videoUrl); // 添加日志帮助调试
      setCurrentVideo(videoUrl);
    } else {
      console.log("返回到默认视频:", DEFAULT_LIVE_VIDEO); // 添加日志帮助调试
      setCurrentVideo(DEFAULT_LIVE_VIDEO);
    }
    setIsLiveStream(true);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%)',
      p: 3,
    }}>
      <Typography 
        variant="h2" 
        align="center" 
        gutterBottom
        sx={{
          color: '#01579b',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          fontWeight: 'bold',
          mb: 4,
        }}
      >
        智慧海洋牧场可视化系统
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={testApiConnection}
          sx={{ 
            mr: 2,
            background: 'linear-gradient(45deg, #1e88e5, #00acc1)',
            boxShadow: '0 4px 12px rgba(0,150,255,0.2)',
          }}
        >
          测试API连接
        </Button>
        <Button 
          variant="outlined" 
          onClick={fetchMonitoringData}
          sx={{
            borderColor: '#00acc1',
            color: '#00acc1',
            '&:hover': {
              borderColor: '#00838f',
              backgroundColor: 'rgba(0,150,255,0.1)',
            },
          }}
        >
          刷新监控数据
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* 监控视频区域 */}
        <Grid item xs={12} md={8}>
          <OceanPaper elevation={3}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', color: '#01579b' }}>
                  <VideocamIcon sx={{ mr: 1 }} /> 
                  {isLiveStream ? 
                    (monitoringData ? `海洋监控摄像头 #${monitoringData.camera_id}` : '海洋监控摄像头') :
                    '历史视频回放'
                  }
                </Typography>
                <Stack direction="row" spacing={2}>
                  {isLiveStream ? (
                    <>
                  <Chip 
                    icon={<FiberManualRecordIcon sx={{ color: '#f44336!important' }} />} 
                    label={loading ? "数据加载中..." : "实时监控"} 
                    color="error" 
                    size="small"
                    sx={{ '& .MuiChip-label': { fontWeight: 'bold' } }}
                  />
                  <Chip 
                    label={currentTime.toLocaleTimeString()} 
                    variant="outlined" 
                    size="small" 
                  />
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleReturnToLive}
                      startIcon={<VideocamIcon />}
                    >
                      返回实时监控
                    </Button>
                  )}
                </Stack>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
              
              {/* 视频播放器 */}
                <Box 
                  sx={{ 
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 宽高比
                  bgcolor: 'black',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <video
                  key={currentVideo}
                  src={currentVideo}
                  controls={!isLiveStream}
                  autoPlay
                  muted={isLiveStream}
                  loop={isLiveStream}
                  style={{
                    position: 'absolute', 
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* 左上角水质 */}
                <Box sx={{position:'absolute', top:8, left:8, bgcolor:'rgba(0,0,0,0.4)', color:'#fff', px:1.2, py:0.6, borderRadius:1, fontSize:'0.9rem', lineHeight:1.3}}>
                  T: {waterQuality.temp}°C | pH: {waterQuality.ph} | Sal: {waterQuality.sal}‰
                </Box>
                {/* 右下角水质 */}
                <Box sx={{position:'absolute', bottom:8, right:8, bgcolor:'rgba(0,0,0,0.4)', color:'#fff', px:1.2, py:0.6, borderRadius:1, fontSize:'0.9rem', lineHeight:1.3}}>
                  DO: {waterQuality.do}mg/L | NTU: {waterQuality.turbidity} | NH₃: {waterQuality.nh3}mg/L | NO₃: {waterQuality.no3}mg/L
                </Box>
              </Box>
            </Box>
          </OceanPaper>
        </Grid>

        {/* 控制面板区域 */}
        <Grid item xs={12} md={4}>
          <ControlPanel 
            onControlChange={handleControlChange} 
            onVideoChange={handleVideoChange}
          />
        </Grid>

        {/* 数据分析区域 */}
        <Grid item xs={12}>
          <OceanPaper elevation={3} sx={{ p: 2 }}>
            <CardContent>
              {monitoringData && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: '#01579b' }}>
                    鱼群状态分析
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    当前鱼群数量约 {monitoringData.fish_activity.count} 条，主要鱼种: {monitoringData.fish_activity.main_species}，
                    活动度: {monitoringData.fish_activity.movement_level}，健康状态: {monitoringData.fish_activity.health_status}
                  </Typography>
                  
                  {monitoringData.alerts.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 3, color: '#01579b' }}>
                        系统警报
                      </Typography>
                      {monitoringData.alerts.map((alert, index) => (
                        <Alert 
                          key={index} 
                          severity={alert.level === 'critical' ? 'error' : alert.level === 'warning' ? 'warning' : 'info'}
                          sx={{ mb: 1 }}
                        >
                          {alert.message}
                        </Alert>
                      ))}
                    </>
                  )}
                </>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                实时监控鱼类活动情况与海洋环境参数，用于评估鱼群健康状态和生长情况。该监控数据对于海洋牧场管理和水产养殖决策至关重要。
              </Typography>
            </CardContent>
          </OceanPaper>
        </Grid>
      </Grid>

      {/* 视频回放对话框 */}
      <Dialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#e3f2fd', color: '#01579b' }}>
          历史视频回放
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography>视频回放功能开发中...</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;