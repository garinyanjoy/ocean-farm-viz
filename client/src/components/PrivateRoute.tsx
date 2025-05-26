import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isInitialized } = useAuth();

  // 等待认证状态初始化
  if (!isInitialized) {
    return null; // 或者显示加载指示器
  }

  // 如果未登录，重定向到登录页面
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 已登录，显示受保护的内容
  return <>{children}</>;
};

export default PrivateRoute; 