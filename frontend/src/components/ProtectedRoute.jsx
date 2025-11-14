import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, adminMasterOnly = false, staffOnly = false }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Verifica se o usuário está autenticado
  if (!isAuthenticated) {
    // Redireciona para o login, mas salva a localização atual para que 
    // o usuário possa ser redirecionado de volta após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Verifica se a rota é apenas para Admin Master
  if (adminMasterOnly) {
    const isMaster = user?.perfis?.includes('Admin Master');
    if (!isMaster) {
      return <Navigate to="/" replace />;
    }
  }

  // 3. Verifica se a rota é para administradores (Admin ou Admin_Master)
  if (adminOnly) {
    const isAdmin = user?.perfis?.some(p => ['Administrador', 'Admin Master'].includes(p));
    
    if (!isAdmin) {
      // Se não for admin, redireciona para a página inicial.
      // O usuário já está logado, então não precisa ir para /login.
      return <Navigate to="/" replace />;
    }
  }

  // 4. Verifica se a rota é para staff (Admin, Admin_Master, Recepcionista)
  if (staffOnly) {
    const isStaff = user?.perfis?.some(p => ['Administrador', 'Admin Master', 'Recepcionista'].includes(p));
    if (!isStaff) {
      return <Navigate to="/" replace />;
    }
  }

  // 5. Se tudo estiver ok, renderiza o componente filho
  return children;
};

export default ProtectedRoute;
