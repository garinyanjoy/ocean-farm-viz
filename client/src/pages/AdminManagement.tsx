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
import { oceanTheme } from '../styles/oceanTheme';
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
    <ThemeProvider theme={oceanTheme}>
      <OceanBackground />
      <Box sx={{ p: 3, position: 'relative' }}>
        <Typography variant="h4" gutterBottom>
          管理员控制台
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ 
              p: 2,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
            }}>
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedSection === 'users'}
                    onClick={() => setSelectedSection('users')}
                  >
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="用户管理" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedSection === 'monitoring'}
                    onClick={() => setSelectedSection('monitoring')}
                  >
                    <ListItemIcon>
                      <VisibilityIcon />
                    </ListItemIcon>
                    <ListItemText primary="监控管理" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedSection === 'statistics'}
                    onClick={() => setSelectedSection('statistics')}
                  >
                    <ListItemIcon>
                      <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="数据统计" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedSection === 'system'}
                    onClick={() => setSelectedSection('system')}
                  >
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="系统管理" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Paper sx={{ 
              p: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
            }}>
              {selectedSection === 'users' && renderUserManagement()}
              {selectedSection === 'monitoring' && renderApiEndpoints('monitoring')}
              {selectedSection === 'statistics' && renderApiEndpoints('statistics')}
              {selectedSection === 'system' && renderApiEndpoints('system')}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default AdminManagement;
