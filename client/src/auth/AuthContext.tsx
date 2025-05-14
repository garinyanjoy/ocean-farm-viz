import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  authed: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  authed: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authed, setAuthed] = useState(false);

  const login = () => {
    setAuthed(true);
  };

  const logout = () => {
    setAuthed(false);
  };

  return (
    <AuthContext.Provider value={{ authed, login, logout }}></AuthContext.Provider>
  );
};
