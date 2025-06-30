import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import oceanTheme from '../styles/oceanTheme';
import { useAuth } from '../auth/AuthContext';

// 波浪SVG
const waveSvg = `
<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
  <path d="M0,40 C300,80 600,0 1200,40 L1200,120 L0,120 Z" fill="${oceanTheme.sky}" opacity="0.3"/>
</svg>
`;

// 太阳SVG
const sunSvg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="25" fill="${oceanTheme.secondary}"/>
  <g stroke="${oceanTheme.secondary}" stroke-width="4" stroke-linecap="round">
    <line x1="50" y1="15" x2="50" y2="5"/>
    <line x1="50" y1="95" x2="50" y2="85"/>
    <line x1="15" y1="50" x2="5" y2="50"/>
    <line x1="95" y1="50" x2="85" y2="50"/>
    <line x1="26" y1="26" x2="19" y2="19"/>
    <line x1="81" y1="81" x2="74" y2="74"/>
    <line x1="26" y1="74" x2="19" y2="81"/>
    <line x1="81" y1="19" x2="74" y2="26"/>
  </g>
</svg>
`;

// 海鸥SVG
const seagullSvg = `
<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M20,30 C30,15 40,25 50,20 C60,15 70,25 80,30" stroke="white" stroke-width="3" fill="none"/>
  <path d="M30,25 C35,20 40,25 45,22" stroke="white" stroke-width="2" fill="none"/>
  <path d="M55,22 C60,25 65,20 70,25" stroke="white" stroke-width="2" fill="none"/>
</svg>
`;

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, ${oceanTheme.deepBlue} 0%, ${oceanTheme.primary} 100%);
  color: white;
  padding: 16px 0 24px 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20px;
    background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(waveSvg)}');
    background-size: cover;
  }
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  
  h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    font-family: 'AlibabaPuHuiTi-3', 'Noto Sans SC', sans-serif;
    letter-spacing: 1px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, ${oceanTheme.secondary}, transparent);
    }
  }
`;

const Sun = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 12px;
  background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(sunSvg)}');
  background-size: contain;
  animation: rotate 20s linear infinite;
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Seagull = styled.div`
  position: absolute;
  top: 15px;
  right: 10%;
  width: 60px;
  height: 30px;
  background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(seagullSvg)}');
  background-size: contain;
  background-repeat: no-repeat;
  animation: float 8s ease-in-out infinite;
  opacity: 0.7;
  
  &:nth-child(2) {
    top: 30px;
    right: 25%;
    width: 40px;
    height: 20px;
    animation-delay: 2s;
    opacity: 0.5;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 8px;
`;

const NavLink = styled(Link)<{ active?: boolean }>`
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all ${oceanTheme.transitionFast};
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    text-decoration: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: ${props => props.active ? '80%' : '0'};
    height: 2px;
    background: ${oceanTheme.secondary};
    transition: all ${oceanTheme.transitionFast};
    transform: translateX(-50%);
  }
  
  &:hover::after {
    width: 80%;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const UserAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${oceanTheme.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${oceanTheme.transitionFast};
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const AdminButton = styled(Link)`
  background: ${oceanTheme.secondary};
  color: ${oceanTheme.deepBlue};
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${oceanTheme.transitionFast};
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;

  &:hover {
    background: ${oceanTheme.sand};
    transform: translateY(-2px);
    text-decoration: none;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const TimeDisplay = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
`;

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // 更新时间
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <HeaderContainer>
      <Seagull />
      <Seagull />
      <HeaderContent>
        <Logo>
          <Sun />
          <h1>智慧海洋牧场可视化系统</h1>
        </Logo>
        <Nav>
          <NavLink to="/" active={isActive('/')}>首页</NavLink>
          <NavLink to="/data-center" active={isActive('/data-center')}>数据中心</NavLink>
          <NavLink to="/intelligent-center" active={isActive('/intelligent-center')}>智能分析</NavLink>
          <NavLink to="/underwater" active={isActive('/underwater')}>水下系统</NavLink>
        </Nav>
      <RightSection>
        <TimeDisplay>{currentTime}</TimeDisplay>
        
        {user ? (
          <>
              <UserInfo>
                <UserAvatar>
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </UserAvatar>
                <span>{user.username}</span>
              </UserInfo>
              
            {isAdmin && (
                <AdminButton to="/admin">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                用户管理
              </AdminButton>
            )}
              
              <LogoutButton onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                退出
              </LogoutButton>
          </>
        ) : (
          <>
              <NavLink to="/login">登录</NavLink>
              <NavLink to="/register">注册</NavLink>
          </>
        )}
      </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
