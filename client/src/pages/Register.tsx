import React from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = () => {
    // 这里可以添加实际的注册逻辑
    navigate('/login');
  };

  return (
    <div>
      <h2>注册页面</h2>
      <button onClick={handleRegister}>注册</button>
    </div>
  );
};

export default Register;

