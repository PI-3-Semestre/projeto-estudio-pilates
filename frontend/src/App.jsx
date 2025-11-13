import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ErrorBoundary from "./components/ErrorBoundary";

import ProtectedRoute from "./components/ProtectedRoute";
import LoginView from "./views/LoginView";
import AdminCadastroView from "./views/AdminCadastroView";
import DashboardAdminMasterView from "./views/DashboardAdminMasterView";
import GerenciarAlunosView from "./views/GerenciarAlunosView";
import CadastrarUsuarioView from "./views/CadastrarUsuarioView";
import CadastrarAlunoView from "./views/CadastrarAlunoView";
import CadastrarColaboradorView from "./views/CadastrarColaboradorView";
import GerenciarColaboradoresView from "./views/GerenciarColaboradoresView";
import GestaoUsuariosView from "./views/GestaoUsuariosView";
import DetalhesColaboradorView from "./views/DetalhesColaboradorView";
import DetalhesAlunoView from "./views/DetalhesAlunoView";
import EditarColaboradorView from "./views/EditarColaboradorView";
import ModalidadesView from "./views/ModalidadesView";
import AgendaView from "./views/AgendaView";
import MarcarAulaView from "./views/MarcarAulaView";

// Lida com as rotas que o usuário pode ver quando NÃO está logado.
const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

// Lida com as rotas que o usuário só pode ver quando ESTÁ logado.
const PrivateRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardAdminMasterView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos"
        element={
          <ProtectedRoute adminOnly={true}>
            <GerenciarAlunosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/colaboradores"
        element={
          <ProtectedRoute adminOnly={true}>
            <GerenciarColaboradoresView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute adminOnly={true}>
            <GestaoUsuariosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/colaboradores/:cpf"
        element={
          <ProtectedRoute adminOnly={true}>
            <DetalhesColaboradorView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/colaboradores/:cpf/editar"
        element={
          <ProtectedRoute adminOnly={true}>
            <EditarColaboradorView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos/:cpf"
        element={
          <ProtectedRoute adminOnly={true}>
            <DetalhesAlunoView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos/cadastrar-usuario"
        element={
          <ProtectedRoute adminOnly={true}>
            <CadastrarUsuarioView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos/cadastrar-perfil/:userId"
        element={
          <ProtectedRoute adminOnly={true}>
            <CadastrarAlunoView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/colaboradores/cadastrar-perfil/:userId"
        element={
          <ProtectedRoute adminOnly={true}>
            <CadastrarColaboradorView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cadastrar-aluno"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminCadastroView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modalidades"
        element={
          <ProtectedRoute adminOnly={true}>
            <ModalidadesView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute adminOnly={true}>
            <AgendaView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marcar-aula"
        element={
          <ProtectedRoute adminOnly={true}> {/* Assuming adminOnly for staff for now */}
            <MarcarAulaView />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
