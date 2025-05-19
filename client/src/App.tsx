import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "@mui/material";
import Header from "./pages/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UnderWaterSystem from "./pages/UnderWaterSystem";
import DataCenter from "./pages/DataCenter";
import AdminManagement from "./pages/AdminManagement";
import Home from "./pages/Home";
import IntelligentCenter from "./pages/IntelligentCenter";
import { AuthProvider, useAuth } from "./auth/AuthContext";

// 检查用户是否已登录的守卫组件
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('username') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// 检查用户是否有管理员权限的守卫组件
const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  
  if (!isAdmin) {
    return <Navigate to="/main-info" />;
  }
  
  return children;
};

// 应用内容组件，包含所有需要验证的路由
const AppContent = () => {
  // 跟踪用户认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('username') !== null);
  
  // 监听localStorage变化
  useEffect(() => {
    // 创建一个监听函数来检测登录状态变化
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('username') !== null;
      setIsAuthenticated(authStatus);
    };

    // 添加事件监听器
    window.addEventListener('storage', checkAuthStatus);
    
    // 为了保证其他组件可以触发状态更新，创建一个自定义事件
    window.addEventListener('authChange', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);
  
  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route 
            path="/main-info" 
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            } 
          />
          <Route 
            path="/underwater" 
            element={
              <RequireAuth>
                <UnderWaterSystem />
              </RequireAuth>
            } 
          />
          <Route 
            path="/data-center" 
            element={
              <RequireAuth>
                <DataCenter />
              </RequireAuth>
            } 
          />
          <Route 
            path="/intelligent" 
            element={
              <RequireAuth>
                <IntelligentCenter />
              </RequireAuth>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <RequireAdmin>
                <AdminManagement />
              </RequireAdmin>
            } 
          />
        </Routes>
      </Container>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
