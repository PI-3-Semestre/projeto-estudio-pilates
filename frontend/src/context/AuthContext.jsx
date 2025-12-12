import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api'; // Import the api instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('user_type');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const storedUserType = localStorage.getItem('user_type');

      if (storedToken && storedUser && storedUserType) {
        try {
          // **CORREÇÃO APLICADA AQUI**
          // Confia nos dados do usuário armazenados no localStorage,
          // que já contêm o ID correto do aluno.
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserType(storedUserType);
          setIsAuthenticated(true);

          // Faz uma chamada silenciosa para validar o token.
          // O interceptor de resposta cuidará da renovação ou do logout se o token falhar.
          await api.get('/usuarios/me/');

        } catch (error) {
          console.error("Falha na validação do token:", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [logout]);

  const login = useCallback((userData, accessToken, refreshToken, userTypeData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('user_type', userTypeData);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser(userData);
    setUserType(userTypeData);
    setIsAuthenticated(true);
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    userType,
    isAuthenticated,
    login,
    logout,
    loading,
  }), [user, userType, isAuthenticated, login, logout, loading]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
