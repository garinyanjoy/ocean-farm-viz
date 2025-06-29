import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  admin?: boolean; // 添加可选的admin属性
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, admin = false }) => {
  const { user, isAdmin, isInitialized } = useAuth();
  
  // 等待认证状态初始化
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  // 如果用户未登录，重定向到登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // 如果需要管理员权限但用户不是管理员，重定向到首页
  if (admin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // 用户已登录，渲染子组件
  return <>{children}</>;
};

export default PrivateRoute; 