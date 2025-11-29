import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  adminOnly = false,
  adminMasterOnly = false,
  staffOnly = false,
  allowedUserTypes = [], // Nova prop: array de tipos de usuário permitidos
}) => {
  const { user, userType, isAuthenticated, loading } = useAuth(); // Obter userType e loading state
  const location = useLocation();

  // Se o status de autenticação ainda estiver carregando, renderiza um indicador de carregamento
  if (loading) {
    return <div>Carregando autenticação...</div>; // Ou um spinner mais sofisticado
  }

  // 1. Verifica se o usuário está autenticado
  if (!isAuthenticated) {
    // Redireciona para o login, mas salva a localização atual para que
    // o usuário possa ser redirecionado de volta após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Verifica se o userType do usuário está entre os tipos permitidos para esta rota
  if (allowedUserTypes.length > 0 && !allowedUserTypes.includes(userType)) {
    // Se o tipo de usuário não for permitido, redireciona para a página inicial
    // ou para uma página de acesso negado.
    console.warn(`Acesso negado: userType '${userType}' não permitido para esta rota. Tipos permitidos: ${allowedUserTypes.join(', ')}`);
    return <Navigate to="/" replace />; // Redireciona para a HomeRedirect que irá para a dashboard correta
  }

  // 3. Verifica se a rota é apenas para Admin Master (baseado em perfis)
  // Esta verificação só faz sentido se o user tiver perfis (ou seja, não for 'aluno')
  if (adminMasterOnly && userType !== 'aluno') {
    const isMaster = user?.perfis?.includes("Admin Master");
    if (!isMaster) {
      console.warn(`Acesso negado: Apenas Admin Master pode acessar esta rota. userType: ${userType}`);
      return <Navigate to="/" replace />;
    }
  }

  // 4. Verifica se a rota é para administradores (Admin ou Admin_Master) (baseado em perfis)
  if (adminOnly && userType !== 'aluno') {
    const isAdmin = user?.perfis?.some((p) =>
      ["Administrador", "Admin Master"].includes(p)
    );
    if (!isAdmin) {
      console.warn(`Acesso negado: Apenas Admin ou Admin Master podem acessar esta rota. userType: ${userType}`);
      return <Navigate to="/" replace />;
    }
  }

  // 5. Verifica se a rota é para staff (Admin, Admin_Master, Recepcionista) (baseado em perfis)
  if (staffOnly && userType !== 'aluno') {
    const isStaff = user?.perfis?.some((p) =>
      ["Administrador", "Admin Master", "Recepcionista"].includes(p)
    );
    if (!isStaff) {
      console.warn(`Acesso negado: Apenas Staff pode acessar esta rota. userType: ${userType}`);
      return <Navigate to="/" replace />;
    }
  }

  // 6. Se todas as verificações passarem, renderiza o componente filho
  return children;
};

export default ProtectedRoute;
