import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    // 这里可以添加实际的登录逻辑
    login();
    navigate('/main-info');
  };

  return (
    <div>
      <button onClick={handleLogin}>登录</button>
    </div>
  );
};

export default Login;
