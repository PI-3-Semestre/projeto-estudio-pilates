import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// Views
import LoginView from "./views/LoginView";
import DashboardAdminMasterView from "./views/DashboardAdminMasterView";
import GerenciarAlunosView from "./views/GerenciarAlunosView";
import CadastrarUsuarioView from "./views/CadastrarUsuarioView";
import AdminCadastroView from "./views/AdminCadastroView";
import CadastrarAlunoView from "./views/CadastrarAlunoView";
import CadastrarColaboradorView from "./views/CadastrarColaboradorView";
import GerenciarColaboradoresView from "./views/GerenciarColaboradoresView";
import GestaoUsuariosView from "./views/GestaoUsuariosView";
import DetalhesColaboradorView from "./views/DetalhesColaboradorView";
import DetalhesAlunoView from "./views/DetalhesAlunoView";
import EditarAlunoView from "./views/EditarAlunoView";
import EditarColaboradorView from "./views/EditarColaboradorView";
import ModalidadesView from "./views/ModalidadesView";
import AgendaView from "./views/AgendaView";
import MarcarAulaView from "./views/MarcarAulaView";
import DetalhesAulaView from "./views/DetalhesAulaView";
import EditarAulaView from "./views/EditarAulaView";
import GerenciamentoStudiosView from "./views/GerenciamentoStudiosView";
import CadastrarStudioView from "./views/CadastrarStudioView";
import DetalhesStudioView from "./views/DetalhesStudioView";
import EditarStudioView from "./views/EditarStudioView";
import ConfiguracoesView from "./views/ConfiguracoesView";
import HorariosView from "./views/HorariosView";
import CadastrarHorarioView from "./views/CadastrarHorarioView";
import EditarHorarioView from "./views/EditarHorarioView";
import BloqueiosView from "./views/BloqueiosView";
import CadastrarBloqueioView from "./views/CadastrarBloqueioView";
import EditarBloqueioView from "./views/EditarBloqueioView";
import PlanosView from "./views/PlanosView";
import PlanoFormView from "./views/PlanoFormView";
import DashboardStudioView from "./views/DashboardStudioView";

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
        path="/alunos/:cpf"
        element={
          <ProtectedRoute adminOnly={true}>
            <DetalhesAlunoView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alunos/:cpf/editar"
        element={
          <ProtectedRoute adminOnly={true}>
            <EditarAlunoView />
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
        path="/admin/cadastrar-aluno"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminCadastroView />
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
        path="/colaboradores/cadastrar-perfil/:userId"
        element={
          <ProtectedRoute adminOnly={true}>
            <CadastrarColaboradorView />
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
        path="/studios"
        element={
          <ProtectedRoute adminOnly={true}>
            <GerenciamentoStudiosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studios/cadastrar"
        element={
          <ProtectedRoute adminOnly={true}>
            <CadastrarStudioView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studios/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <DetalhesStudioView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studios/:id/editar"
        element={
          <ProtectedRoute adminOnly={true}>
            <EditarStudioView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studios/:studioId/dashboard"
        element={
          <ProtectedRoute adminOnly={true}>
            <DashboardStudioView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marcar-aula"
        element={
          <ProtectedRoute adminOnly={true}>
            <MarcarAulaView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aulas/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <DetalhesAulaView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aulas/:id/editar"
        element={
          <ProtectedRoute adminOnly={true}>
            <EditarAulaView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <ConfiguracoesView />
          </ProtectedRoute>
        }
      />

      {/* Rotas de Horários */}
      <Route
        path="/horarios"
        element={
          <ProtectedRoute>
            <HorariosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/horarios/novo"
        element={
          <ProtectedRoute>
            <CadastrarHorarioView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/horarios/editar/:id"
        element={
          <ProtectedRoute>
            <EditarHorarioView />
          </ProtectedRoute>
        }
      />

      {/* Rotas de Bloqueios */}
      <Route
        path="/bloqueios"
        element={
          <ProtectedRoute>
            <BloqueiosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bloqueios/novo"
        element={
          <ProtectedRoute>
            <CadastrarBloqueioView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bloqueios/editar/:id"
        element={
          <ProtectedRoute>
            <EditarBloqueioView />
          </ProtectedRoute>
        }
      />

      {/* Rotas de Planos */}
      <Route
        path="/planos"
        element={
          <ProtectedRoute adminOnly={true}>
            <PlanosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planos/novo"
        element={
          <ProtectedRoute adminOnly={true}>
            <PlanoFormView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planos/editar/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <PlanoFormView />
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
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
