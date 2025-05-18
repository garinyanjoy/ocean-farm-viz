import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type User = {
  username: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, role: string) => void;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 初始化时从localStorage恢复用户状态
  useEffect(() => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    
    if (username && role) {
      setUser({ username, role });
      setIsAdmin(role === 'admin');
    }
  }, []);

  const login = (username: string, role: string) => {
    setUser({ username, role });
    setIsAdmin(role === 'admin');
    
    // 将用户信息存储到localStorage中
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    
    // 清除localStorage中的用户信息
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
