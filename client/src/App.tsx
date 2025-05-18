import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container } from "@mui/material";
import Header from "./pages/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UnderWaterSystem from "./pages/UnderWaterSystem";
import DataCenter from "./pages/DataCenter";
import AdminManagement from "./pages/AdminManagement";
import Home from "./pages/Home";
import IntelligentCenter from "./pages/IntelligentCenter";

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={< Login/>} />
          <Route path="/main-info" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/underwater" element={<UnderWaterSystem />} />
          <Route path="/data-center" element={<DataCenter />} />
          <Route path="/admin" element={<AdminManagement />} />
          <Route path="/intelligent" element={<IntelligentCenter />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;