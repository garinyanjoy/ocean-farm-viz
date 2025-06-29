import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  VideoLibrary as VideoLibraryIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { oceanTheme, muiTheme } from '../styles/oceanTheme';
import OceanBackground from '../components/OceanBackground';
import { styled } from '@mui/material/styles';

// 定义用户类型
interface User {
  id: number;
  username: string;
  role: string;
}

// 定义表单数据类型
interface FormData {
  username: string;
  password: string;
  role: string;
}

interface ApiEndpoint {
  name: string;
  path: string;
  method: string;
  description: string;
}

// 添加自定义样式组件
const StyledTableContainer = styled(Paper)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: 'rgba(2, 136, 209, 0.1)',
    fontWeight: 600,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: 'rgba(2, 136, 209, 0.05)',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const AdminManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedSection, setSelectedSection] = useState('users');
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    role: 'user'
  });

  // API端点列表
  const apiEndpoints: { [key: string]: ApiEndpoint[] } = {
    monitoring: [
      {
        name: '实时监控数据',
        path: '/api/monitoring/realtime',
        method: 'GET',
        description: '获取所有监控设备的实时数据'
      },
      {
        name: '设备状态',
        path: '/api/monitoring/devices',
        method: 'GET',
        description: '获取所有监控设备的状态'
      },
      {
        name: '控制设备',
        path: '/api/monitoring/control',
        method: 'POST',
        description: '控制特定设备的开关状态'
      }
    ],
    statistics: [
      {
        name: '环境数据统计',
        path: '/api/statistics/environment',
        method: 'GET',
        description: '获取环境数据的统计信息'
      },
      {
        name: '鱼群活动分析',
        path: '/api/statistics/fish-activity',
        method: 'GET',
        description: '获取鱼群活动的统计分析'
      }
    ],
    system: [
      {
        name: '系统日志',
        path: '/api/system/logs',
        method: 'GET',
        description: '获取系统运行日志'
      },
      {
        name: '告警配置',
        path: '/api/system/alerts/config',
        method: 'PUT',
        description: '更新系统告警配置'
      }
    ]
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post('http://localhost:5000/api/users', formData);
      fetchUsers();
      setOpenDialog(false);
      setFormData({ username: '', password: '', role: 'user' });
    } catch (error) {
      console.error('创建用户失败:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    try {
      await axios.put(`http://localhost:5000/api/users/${editUser.id}`, formData);
      fetchUsers();
      setOpenDialog(false);
      setEditUser(null);
      setFormData({ username: '', password: '', role: 'user' });
    } catch (error) {
      console.error('更新用户失败:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
    }
  };

  const renderUserManagement = () => (
    <Fade in timeout={1000}>
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">用户管理</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditUser(null);
              setFormData({ username: '', password: '', role: 'user' });
              setOpenDialog(true);
            }}
          >
            添加用户
          </Button>
        </Box>

        <StyledTableContainer>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>用户名</TableCell>
                  <TableCell>角色</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.role === 'admin' ? '管理员' : '普通用户'}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setEditUser(user);
                          setFormData({
                            username: user.username,
                            password: '',
                            role: user.role
                          });
                          setOpenDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'admin'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledTableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{editUser ? '编辑用户' : '创建用户'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="用户名"
              fullWidth
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <TextField
              margin="dense"
              label="密码"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <TextField
              margin="dense"
              label="角色"
              select
              fullWidth
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="user">普通用户</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>取消</Button>
            <Button onClick={editUser ? handleUpdateUser : handleCreateUser}>
              {editUser ? '更新' : '创建'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );

  const renderApiEndpoints = (sectionName: string): JSX.Element => (
    <Fade in timeout={1000}>
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {sectionName === 'monitoring' && '监控管理接口'}
            {sectionName === 'statistics' && '数据统计接口'}
            {sectionName === 'system' && '系统管理接口'}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleTestConnection(sectionName)}
              sx={{ mr: 2 }}
            >
              测试API连接
            </Button>
            {sectionName === 'monitoring' && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleRefreshData}
              >
                刷新监控数据
              </Button>
            )}
          </Box>
        </Box>
        <Grid container spacing={2}>
          {apiEndpoints[sectionName]?.map((endpoint, index) => (
            <Grid item xs={12} md={6} key={index}>
              <StyledCard>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {endpoint.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    路径: {endpoint.path}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    方法: {endpoint.method}
                  </Typography>
                  <Typography variant="body2">
                    {endpoint.description}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Fade>
  );

  const handleTestConnection = async (section: string) => {
    try {
      // 根据不同部分测试不同的API端点
      let endpoint = '';
      switch (section) {
        case 'monitoring':
          endpoint = 'http://localhost:5000/api/monitoring/test';
          break;
        case 'statistics':
          endpoint = 'http://localhost:5000/api/statistics/test';
          break;
        case 'system':
          endpoint = 'http://localhost:5000/api/system/test';
          break;
        default:
          return;
      }
      
      const response = await axios.get(endpoint);
      alert(`API连接测试成功: ${response.data.message || '连接正常'}`);
    } catch (error) {
      console.error('API连接测试失败:', error);
      alert('API连接测试失败，请检查服务器状态');
    }
  };

  const handleRefreshData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/monitoring/refresh');
      alert(`监控数据刷新成功: ${response.data.message || '数据已更新'}`);
    } catch (error) {
      console.error('监控数据刷新失败:', error);
      alert('监控数据刷新失败，请检查服务器状态');
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ 
        flexGrow: 1, 
        padding: 3,
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
      }}>
        <OceanBackground />
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h4" sx={{ mb: 4, color: oceanTheme.deepBlue, fontWeight: 700 }}>
            系统管理中心
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ 
                p: 2, 
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: oceanTheme.deepBlue }}>
                  管理菜单
                </Typography>
                <List component="nav">
                  <ListItemButton 
                    selected={selectedSection === 'users'}
                    onClick={() => setSelectedSection('users')}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        }
                      }
                    }}
                  >
                    <ListItemIcon>
                      <PersonIcon color={selectedSection === 'users' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="用户管理" />
                  </ListItemButton>
                  
                  <ListItemButton 
                    selected={selectedSection === 'monitoring'}
                    onClick={() => setSelectedSection('monitoring')}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        }
                      }
                    }}
                  >
                    <ListItemIcon>
                      <VisibilityIcon color={selectedSection === 'monitoring' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="监控管理" />
                  </ListItemButton>
                  
                  <ListItemButton 
                    selected={selectedSection === 'statistics'}
                    onClick={() => setSelectedSection('statistics')}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        }
                      }
                    }}
                  >
                    <ListItemIcon>
                      <AssessmentIcon color={selectedSection === 'statistics' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="统计分析" />
                  </ListItemButton>
                  
                  <ListItemButton 
                    selected={selectedSection === 'system'}
                    onClick={() => setSelectedSection('system')}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        }
                      }
                    }}
                  >
                    <ListItemIcon>
                      <SettingsIcon color={selectedSection === 'system' ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="系统设置" />
                  </ListItemButton>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Paper sx={{ 
                p: 3, 
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                minHeight: '70vh'
              }}>
                {selectedSection === 'users' && renderUserManagement()}
                {selectedSection === 'monitoring' && renderApiEndpoints('monitoring')}
                {selectedSection === 'statistics' && renderApiEndpoints('statistics')}
                {selectedSection === 'system' && renderApiEndpoints('system')}
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* 用户表单对话框 */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>{editUser ? '编辑用户' : '创建新用户'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="用户名"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              margin="dense"
              label="密码"
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              sx={{ mb: 2 }}
              placeholder={editUser ? '留空表示不修改密码' : ''}
            />
            <TextField
              select
              margin="dense"
              label="角色"
              fullWidth
              variant="outlined"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <MenuItem value="user">普通用户</MenuItem>
              <MenuItem value="admin">管理员</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>取消</Button>
            <Button onClick={editUser ? handleUpdateUser : handleCreateUser} variant="contained">
              {editUser ? '保存' : '创建'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AdminManagement;
