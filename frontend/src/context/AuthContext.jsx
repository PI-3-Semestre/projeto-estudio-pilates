import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api'; // Import the api instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // Novo estado para userType
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('user_type'); // Remover user_type
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setUserType(null); // Limpar userType
    setIsAuthenticated(false);
    // Opcional: redirecionar para o login
    // window.location.href = '/login';
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const storedUserType = localStorage.getItem('user_type'); // Obter user_type

      if (storedToken && storedUser && storedUserType) {
        try {
          // Attempt to fetch user data or any protected resource
          // The API interceptor will handle token refresh if needed,
          // or clear storage and redirect to login if refresh fails.
          const response = await api.get('/usuarios/me/'); // Assuming this endpoint exists
          setUser(response.data); // Update user with fresh data from API
          setUserType(storedUserType); // Definir userType
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token validation failed or refresh failed:", error);
          // If the API call fails, it means the token is invalid or expired
          // and the interceptor should have handled clearing localStorage and redirecting.
          // Ensure local state is also cleared.
          logout();
        }
      }
      setLoading(false); // Set loading to false after check
    };

    checkAuthStatus();
  }, [logout]);

  const login = useCallback((userData, accessToken, refreshToken, userTypeData) => { // Adicionar userTypeData
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('user_type', userTypeData); // Armazenar user_type
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser(userData);
    setUserType(userTypeData); // Definir userType no estado
    setIsAuthenticated(true);
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    userType, // Fornecer userType
    isAuthenticated,
    login,
    logout,
    loading, // Provide loading state
  }), [user, userType, isAuthenticated, login, logout, loading]); // Adicionar userType às dependências

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
