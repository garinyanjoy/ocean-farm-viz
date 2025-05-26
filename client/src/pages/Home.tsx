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

const Home: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [controls, setControls] = useState({
    light: false,
    cleaner: false,
    feeding: false,
    waterCirculation: false,
    temperature: false,
  });
  const [lightIntensity, setLightIntensity] = useState(50);
  
  // 实时时钟更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleControlChange = (control: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setControls(prev => ({ ...prev, [control]: event.target.checked }));
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
                  {monitoringData ? `海洋监控摄像头 #${monitoringData.camera_id}` : '海洋监控摄像头'}
                </Typography>
                <Stack direction="row" spacing={2}>
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
                </Stack>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
              
              <Card sx={{ bgcolor: '#000', position: 'relative' }}>
                <CardMedia
                  component="video"
                  controls
                  src="/data/fish_test.webm"
                  sx={{ width: '100%', maxHeight: '500px' }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    left: 10, 
                    color: 'white', 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    px: 1,
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}
                >
                  {monitoringData ? 
                    `水深: ${monitoringData.environment.depth}m | 温度: ${monitoringData.environment.water_temperature}°C | 可见度: ${monitoringData.environment.visibility} | 溶氧: ${monitoringData.environment.dissolved_oxygen}mg/L | pH: ${monitoringData.environment.pH}`
                    : 
                    '数据加载中...'
                  }
                </Box>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 50, 
                    right: 10, 
                    color: 'white', 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    px: 1,
                    borderRadius: 1,
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}
                >
                  {monitoringData ? monitoringData.timestamp : currentTime.toLocaleString()}
                </Box>
              </Card>
            </Box>
          </OceanPaper>
        </Grid>

        {/* 控制面板区域 */}
        <Grid item xs={12} md={4}>
          <OceanPaper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#01579b', display: 'flex', alignItems: 'center' }}>
              <WbSunny sx={{ mr: 1 }} />
              设施控制面板
            </Typography>
            
            <Grid container spacing={2}>
              {/* 照明控制 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LightbulbOutlined sx={{ mr: 1, color: '#ffa000' }} />
                  <Typography sx={{ flex: 1 }}>照明系统</Typography>
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
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CleaningServices sx={{ mr: 1, color: '#00acc1' }} />
                  <Typography sx={{ flex: 1 }}>清洁系统</Typography>
                  <Switch
                    checked={controls.cleaner}
                    onChange={handleControlChange('cleaner')}
                    color="primary"
                  />
                </Box>
              </Grid>

              {/* 投喂系统 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalDining sx={{ mr: 1, color: '#43a047' }} />
                  <Typography sx={{ flex: 1 }}>自动投喂</Typography>
                  <Switch
                    checked={controls.feeding}
                    onChange={handleControlChange('feeding')}
                    color="primary"
                  />
                </Box>
              </Grid>

              {/* 水循环系统 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Waves sx={{ mr: 1, color: '#0288d1' }} />
                  <Typography sx={{ flex: 1 }}>水循环系统</Typography>
                  <Switch
                    checked={controls.waterCirculation}
                    onChange={handleControlChange('waterCirculation')}
                    color="primary"
                  />
                </Box>
              </Grid>

              {/* 温控系统 */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AcUnit sx={{ mr: 1, color: '#00bcd4' }} />
                  <Typography sx={{ flex: 1 }}>温控系统</Typography>
                  <Switch
                    checked={controls.temperature}
                    onChange={handleControlChange('temperature')}
                    color="primary"
                  />
                </Box>
              </Grid>

              {/* 视频回放按钮 */}
              <Grid item xs={12}>
                <ControlButton
                  fullWidth
                  startIcon={<PlayCircleOutline />}
                  onClick={() => setVideoDialogOpen(true)}
                >
                  历史视频回放
                </ControlButton>
              </Grid>
            </Grid>
          </OceanPaper>
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