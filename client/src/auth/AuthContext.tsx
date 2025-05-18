import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  username: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, role: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, role: string) => {
    setUser({ username, role });
    localStorage.setItem('auth', JSON.stringify({ username, role }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
