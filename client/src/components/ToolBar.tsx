import React from 'react';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Sync as SyncIcon, Api as ApiIcon } from '@mui/icons-material';
import axios from 'axios';

const ToolBarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  width: '100%',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '12px 32px',
  fontSize: '1.1rem',
  textTransform: 'none',
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: theme.palette.primary.main,
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  minWidth: '200px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
  },
  transition: 'all 0.3s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    padding: '10px 24px',
    minWidth: '160px',
  },
}));

const ToolBar: React.FC = () => {
  const handleTestConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/test');
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
    <ToolBarContainer>
      <StyledButton
        startIcon={<ApiIcon />}
        onClick={handleTestConnection}
        variant="contained"
      >
        测试API连接
      </StyledButton>
      <StyledButton
        startIcon={<SyncIcon />}
        onClick={handleRefreshData}
        variant="contained"
      >
        刷新监控数据
      </StyledButton>
    </ToolBarContainer>
  );
};

export default ToolBar; 