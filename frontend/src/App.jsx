import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import GerenciamentoFinanceiroView from "./views/GerenciamentoFinanceiroView";
import GerenciamentoProdutosView from "./views/GerenciamentoProdutosView";
import GestaoVendasView from "./views/GestaoVendasView";
import CadastrarVendaView from "./views/CadastrarVendaView";
import DetalhesVendaView from "./views/DetalhesVendaView";
import GerenciamentoPagamentosView from "./views/GerenciamentoPagamentosView";
import DetalhesPagamentoView from "./views/DetalhesPagamentoView";
import CadastrarPagamentoView from "./views/CadastrarPagamentoView";
import EditarPagamentoView from "./views/EditarPagamentoView";
import GerenciamentoMatriculasView from "./views/GerenciamentoMatriculasView";
import CadastrarMatriculaView from "./views/CadastrarMatriculaView";
import DetalhesMatriculaView from "./views/DetalhesMatriculaView";
import EditarMatriculaView from "./views/EditarMatriculaView";
import RelatoriosView from "./views/RelatoriosView";
import DashboardAlunoView from "./views/DashboardAlunoView";
import MeusAgendamentosView from "./views/MeusAgendamentosView"; // Importar MeusAgendamentosView

// Componente para redirecionar para a dashboard correta com base no userType
const HomeRedirect = () => {
  const { user, userType, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (userType) {
        switch (userType) {
          case 'aluno':
            if (user?.unidades && user.unidades.length === 1) {
              navigate(`/aluno/dashboard/${user.unidades[0].id}`, { replace: true });
            } else {
              // Se tiver múltiplas unidades ou nenhuma, redireciona para uma rota genérica de aluno
              // ou para uma tela de seleção de estúdio, se implementada.
              navigate('/aluno/dashboard', { replace: true });
            }
            break;
          case 'admin_master':
            navigate('/admin-master/dashboard', { replace: true });
            break;
          case 'administrador':
            navigate('/administrador/painel', { replace: true });
            break;
          case 'recepcionista':
            navigate('/recepcionista/atendimento', { replace: true });
            break;
          // Adicione outros tipos de colaborador conforme necessário
          default:
            navigate('/dashboard-generico', { replace: true }); // Página padrão ou de erro
            break;
        }
      } else {
        // Se userType não estiver definido (e não estiver carregando), redireciona para o login
        navigate('/login', { replace: true });
      }
    }
  }, [user, userType, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
    </div>
  );
};


// Lida com as rotas que o usuário pode ver quando NÃO está logado.
const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      {/* Redireciona qualquer outra rota pública para o login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

// Lida com as rotas que o usuário só pode ver quando ESTÁ logado.
const PrivateRoutes = () => {
  return (
    <Routes>
      {/* Rota raiz e /dashboard agora usam HomeRedirect para direcionar corretamente */}
      <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />

      {/* Rotas do Aluno */}
      <Route
        path="/aluno/dashboard"
        element={
          <ProtectedRoute allowedUserTypes={['aluno']}>
            <DashboardAlunoView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/dashboard/:studioId"
        element={
          <ProtectedRoute allowedUserTypes={['aluno']}>
            <DashboardAlunoView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/meus-agendamentos"
        element={
          <ProtectedRoute allowedUserTypes={['aluno']}>
            <MeusAgendamentosView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/aluno/marcar-aula" // Rota para o aluno marcar aula
        element={
          <ProtectedRoute allowedUserTypes={['aluno']}> {/* Permitir apenas alunos */}
            <MarcarAulaView />
          </ProtectedRoute>
        }
      />
      {/* Adicionar rota para seleção de estúdio, se necessário */}
      <Route
        path="/aluno/selecionar-studio"
        element={
          <ProtectedRoute allowedUserTypes={['aluno']}>
            {/* Componente para seleção de estúdio */}
            <div>Tela de Seleção de Estúdio (Ainda não implementada)</div>
          </ProtectedRoute>
        }
      />


      {/* Rotas de Admin Master */}
      <Route
        path="/admin-master/dashboard"
        element={
          <ProtectedRoute allowedUserTypes={['admin_master']}>
            <DashboardAdminMasterView />
          </ProtectedRoute>
        }
      />
      {/* Rotas de Administrador */}
      <Route
        path="/administrador/painel"
        element={
          <ProtectedRoute allowedUserTypes={['administrador']}>
            {/* Componente para o painel do administrador */}
            <div>Painel do Administrador (Ainda não implementado)</div>
          </ProtectedRoute>
        }
      />
      {/* Rotas de Recepcionista */}
      <Route
        path="/recepcionista/atendimento"
        element={
          <ProtectedRoute allowedUserTypes={['recepcionista']}>
            {/* Componente para o atendimento da recepcionista */}
            <div>Atendimento da Recepcionista (Ainda não implementada)</div>
          </ProtectedRoute>
        }
      />
      {/* Rotas de Dashboard Genérica (para tipos não mapeados) */}
      <Route
        path="/dashboard-generico"
        element={
          <ProtectedRoute>
            {/* Componente para dashboard genérica */}
            <div>Dashboard Genérica (Ainda não implementada)</div>
          </ProtectedRoute>
        }
      />


      {/* Rotas existentes para colaboradores/admins */}
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
          <ProtectedRoute allowedUserTypes={['aluno', 'admin_master', 'administrador', 'recepcionista', 'fisioterapeuta', 'instrutor']}>
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

      {/* Rota de Produtos */}
      <Route
        path="/produtos"
        element={
          <ProtectedRoute adminOnly={true}>
            <GerenciamentoProdutosView />
          </ProtectedRoute>
        }
      />

      {/* Rota de Gerenciamento Financeiro */}
      <Route
        path="/financeiro"
        element={
          <ProtectedRoute adminOnly={true}>
            <GerenciamentoFinanceiroView />
          </ProtectedRoute>
        }
      />

      {/* Rotas de Vendas */}
      <Route
        path="/vendas"
        element={
          <ProtectedRoute adminOnly={true}>
            <GestaoVendasView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendas/nova"
        element={
          <ProtectedRoute adminOnly={true}>
            <CadastrarVendaView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendas/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <DetalhesVendaView />
          </ProtectedRoute>
        }
      />

      {/* Rotas de Pagamentos */}
      <Route
        path="/financeiro/pagamentos"
        element={
          <ProtectedRoute adminOnly={true}>
            <GerenciamentoPagamentosView />
          </ProtectedRoute>
        }
      />
      <Route path="/financeiro/pagamentos/:id" element={<ProtectedRoute adminOnly={true}><DetalhesPagamentoView /></ProtectedRoute>} />
      <Route path="/financeiro/pagamentos/novo" element={<ProtectedRoute adminOnly={true}><CadastrarPagamentoView /></ProtectedRoute>} />
      <Route path="/financeiro/pagamentos/:id/editar" element={<ProtectedRoute adminOnly={true}><EditarPagamentoView /></ProtectedRoute>} />

      {/* Rotas de Matrículas */}
      <Route
        path="/matriculas"
        element={
          <ProtectedRoute adminOnly={true}>
            <GerenciamentoMatriculasView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matriculas/nova"
        element={
          <ProtectedRoute adminOnly={true}>
            <CadastrarMatriculaView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matriculas/:id"
        element={
          <ProtectedRoute adminOnly={true}>
            <DetalhesMatriculaView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matriculas/:id/editar"
        element={
          <ProtectedRoute adminOnly={true}>
            <EditarMatriculaView />
          </ProtectedRoute>
        }
      />

      {/* Rota de Relatórios */}
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute adminOnly={true}>
            <RelatoriosView />
          </ProtectedRoute>
        }
      />


      {/* Catch-all para rotas privadas não encontradas, redireciona para a HomeRedirect */}
      <Route path="*" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
    </Routes>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <p className="text-gray-700 dark:text-gray-300">Carregando autenticação...</p>
      </div>
    );
  }

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
