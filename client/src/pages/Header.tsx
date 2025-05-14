import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { BellOutlined } from '@ant-design/icons'; // 假设使用Ant Design图标库

// 类型定义
interface HeaderButton {
  id: string;
  text: string;
  path: string;
}

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color:rgb(30, 162, 215); /* 天蓝色 */
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const LeftSection = styled(Section)`
  justify-content: flex-start;
  gap: 0.1rem;
`;

const CenterSection = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const RightSection = styled(Section)`
  justify-content: flex-end;
  gap: 2rem;
`;

const SystemTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: 1px;
  white-space: nowrap;
`;

const TimeDisplay = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 1.1rem;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LogoutButton = styled(NavButton)`
  color: #ff4d4f;
  &:hover {
    background-color: rgba(255, 77, 79, 0.1);
  }
`;

const AdminButton = styled.button`
  background: none;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
  display: flex;
  align-items: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // 假设存在一个状态来标识用户是否为管理员

  // 导航按钮配置
  const navButtons: HeaderButton[] = [
    { id: 'main-info', text: '主要信息', path: '/main-info' },
    { id: 'underwater', text: '水下系统', path: '/underwater' },
    { id: 'data-center', text: '数据中心', path: '/data-center' },
    { id: 'intelligent', text: '智能中心', path: '/intelligent' }
  ];

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
      setCurrentTime(formattedTime);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 处理导航点击
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // 处理退出登录
  const handleLogout = () => {
    // 这里可以添加退出登录逻辑
    navigate('/login');
  };

  // 处理管理员按钮点击
  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      alert('无管理员权限');
    }
  };

  return (
    <HeaderContainer>
      {/* 左侧导航区 */}
      <LeftSection>
        {navButtons.map((button) => (
          <NavButton
            key={button.id}
            onClick={() => handleNavigation(button.path)}
          >
            {button.text}
          </NavButton>
        ))}
      </LeftSection>

      {/* 中间标题 */}
      <CenterSection>
        <SystemTitle>智慧海洋牧场可视化系统</SystemTitle>
      </CenterSection>

      {/* 右侧功能区 */}
      <RightSection>
        <TimeDisplay>{currentTime}</TimeDisplay>
        <LogoutButton onClick={handleLogout}>退出系统</LogoutButton>
        <AdminButton onClick={handleAdminClick}>
          <BellOutlined /> {}
        </AdminButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
