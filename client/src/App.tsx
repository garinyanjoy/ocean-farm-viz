
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Container, Typography } from "@mui/material";
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
  const { user } = useAuth(); // 使用全局认证状态
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 给AuthContext一些时间来从localStorage加载用户信息
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return null; // 可以替换为加载指示器
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// 检查用户是否有管理员权限的守卫组件
const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { isAdmin } = useAuth(); // 使用全局认证状态
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 给AuthContext一些时间来从localStorage加载用户信息
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return null; // 可以替换为加载指示器
  }
  
  if (!isAdmin) {
    return <Navigate to="/main-info" />;
  }
  
  return children;
};

// 应用内容组件，包含所有需要验证的路由
const AppContent = () => {
  const { user, isInitialized } = useAuth(); // 使用AuthContext的全局状态
  const isAuthenticated = !!user;
  
  // 等待认证状态初始化
  if (!isInitialized) {
    return (
      <Container 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <Typography>加载中...</Typography>
      </Container>
    );
  }
  
  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/main-info" : "/login"} />} />
          
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
