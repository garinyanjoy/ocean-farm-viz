// @ts-ignore
import React from "react";
// @ts-ignore
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// @ts-ignore
import { Container } from "@mui/material";
import Header from "./pages/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UnderWaterSystem from "./pages/UnderWaterSystem";
import DataCenter from "./pages/DataCenter";
import AdminManagement from "./pages/AdminManagement";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import IntelligentCenter from "./pages/IntelligentCenter";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from 'styled-components';
import oceanTheme from './styles/oceanTheme';
import OceanBackground from './components/OceanBackground';
import AuthLayout from './auth/AuthLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={oceanTheme}>
    <AuthProvider>
      <Router>
          <div className="App">
            <OceanBackground />
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
                <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/data-center" element={<PrivateRoute><DataCenter /></PrivateRoute>} />
                <Route path="/intelligent-center" element={<PrivateRoute><IntelligentCenter /></PrivateRoute>} />
                <Route path="/underwater" element={<PrivateRoute><UnderWaterSystem /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute admin={true}><AdminManagement /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;