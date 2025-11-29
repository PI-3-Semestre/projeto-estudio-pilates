import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// Views
import LoginView from "./views/LoginView";
import EsqueceuSenhaView from "./views/EsqueceuSenhaView";
import RedefinirSenhaView from "./views/RedefinirSenhaView";
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
import CadastrarAulaView from "./views/CadastrarAulaView";
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
import MeusAgendamentosView from "./views/MeusAgendamentosView";
import GestaoAvaliacoesView from "./views/GestaoAvaliacoesView";
import AvaliacoesAlunoView from "./views/AvaliacoesAlunoView";
import DetalhesAvaliacaoView from "./views/DetalhesAvaliacaoView";
import AvaliacaoFormView from "./views/AvaliacaoFormView";
import MinhasAvaliacoesView from "./views/MinhasAvaliacoesView";
import MinhasMatriculasView from "./views/MinhasMatriculasView";
import MeusPagamentosView from "./views/MeusPagamentosView";
import MeuPerfilView from "./views/MeuPerfilView";

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
              navigate('/aluno/dashboard', { replace: true });
            }
            break;
          case 'admin_master':
            navigate('/admin-master/dashboard', { replace: true });
            break;
          case 'studio_admin':
            navigate(`/studios/${user.studios[0]}/dashboard`, { replace: true });
            break;
          case 'recepcionista':
            navigate('/recepcionista/atendimento', { replace: true });
            break;
          default:
            navigate('/dashboard-generico', { replace: true });
            break;
        }
      } else {
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
      <Route path="/esqueceu-senha" element={<EsqueceuSenhaView />} />
      <Route path="/password-reset-confirm/:token" element={<RedefinirSenhaView />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

// Lida com as rotas que o usuário só pode ver quando ESTÁ logado.
const PrivateRoutes = () => {
  const adminRoles = ['admin_master', 'studio_admin'];
  const allUserRoles = ['admin_master', 'studio_admin', 'aluno'];

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />

      {/* Rotas do Aluno */}
      <Route path="/aluno/dashboard" element={<ProtectedRoute allowedRoles={['aluno']}><DashboardAlunoView /></ProtectedRoute>} />
      <Route path="/aluno/dashboard/:studioId" element={<ProtectedRoute allowedRoles={['aluno']}><DashboardAlunoView /></ProtectedRoute>} />
      <Route path="/aluno/meus-agendamentos" element={<ProtectedRoute allowedRoles={['aluno']}><MeusAgendamentosView /></ProtectedRoute>} />
      <Route path="/aluno/minhas-avaliacoes" element={<ProtectedRoute allowedRoles={['aluno']}><MinhasAvaliacoesView /></ProtectedRoute>} />
      <Route path="/aluno/minhas-matriculas" element={<ProtectedRoute allowedRoles={['aluno']}><MinhasMatriculasView /></ProtectedRoute>} />
      <Route path="/aluno/meus-pagamentos" element={<ProtectedRoute allowedRoles={['aluno']}><MeusPagamentosView /></ProtectedRoute>} />
      <Route path="/aluno/meu-perfil" element={<ProtectedRoute allowedRoles={['aluno']}><MeuPerfilView /></ProtectedRoute>} />
      <Route path="/aluno/marcar-aula" element={<ProtectedRoute allowedRoles={['aluno']}><MarcarAulaView /></ProtectedRoute>} />
      <Route path="/aluno/selecionar-studio" element={<ProtectedRoute allowedRoles={['aluno']}><div>Tela de Seleção de Estúdio</div></ProtectedRoute>} />

      {/* Rotas de Admin Master */}
      <Route path="/admin-master/dashboard" element={<ProtectedRoute allowedRoles={['admin_master']}><DashboardAdminMasterView /></ProtectedRoute>} />
      
      {/* Rotas de Studio Admin */}
      <Route path="/studios/:studioId/dashboard" element={<ProtectedRoute allowedRoles={adminRoles}><DashboardStudioView /></ProtectedRoute>} />

      {/* Rotas de Colaboradores Genéricas (Recepcionista, etc) */}
      <Route path="/recepcionista/atendimento" element={<ProtectedRoute allowedRoles={['recepcionista']}><div>Atendimento da Recepcionista</div></ProtectedRoute>} />
      <Route path="/dashboard-generico" element={<ProtectedRoute><div>Dashboard Genérica</div></ProtectedRoute>} />

      {/* Rotas de Gestão (Admins) */}
      <Route path="/alunos" element={<ProtectedRoute allowedRoles={adminRoles}><GerenciarAlunosView /></ProtectedRoute>} />
      <Route path="/alunos/cadastrar" element={<ProtectedRoute allowedRoles={adminRoles}><AdminCadastroView /></ProtectedRoute>} />
      <Route path="/alunos/completar-perfil/:userId" element={<ProtectedRoute allowedRoles={adminRoles}><CadastrarAlunoView /></ProtectedRoute>} />
      <Route path="/alunos/detalhes/:cpf" element={<ProtectedRoute allowedRoles={adminRoles}><DetalhesAlunoView /></ProtectedRoute>} />
      <Route path="/alunos/:cpf/editar" element={<ProtectedRoute allowedRoles={adminRoles}><EditarAlunoView /></ProtectedRoute>} />
      <Route path="/alunos/:alunoId/avaliacoes" element={<ProtectedRoute allowedRoles={adminRoles}><AvaliacoesAlunoView /></ProtectedRoute>} />
      
      <Route path="/avaliacoes" element={<ProtectedRoute allowedRoles={adminRoles}><GestaoAvaliacoesView /></ProtectedRoute>} />
      <Route path="/avaliacoes/nova" element={<ProtectedRoute allowedRoles={adminRoles}><AvaliacaoFormView /></ProtectedRoute>} />
      <Route path="/avaliacoes/:id" element={<ProtectedRoute allowedRoles={allUserRoles}><DetalhesAvaliacaoView /></ProtectedRoute>} />
      
      <Route path="/colaboradores" element={<ProtectedRoute allowedRoles={adminRoles}><GerenciarColaboradoresView /></ProtectedRoute>} />
      {/* **NOVA ROTA ADICIONADA AQUI** */}
      <Route path="/colaboradores/completar-perfil/:userId" element={<ProtectedRoute allowedRoles={adminRoles}><CadastrarColaboradorView /></ProtectedRoute>} />
      <Route path="/colaboradores/:cpf" element={<ProtectedRoute allowedRoles={adminRoles}><DetalhesColaboradorView /></ProtectedRoute>} />
      <Route path="/colaboradores/:cpf/editar" element={<ProtectedRoute allowedRoles={adminRoles}><EditarColaboradorView /></ProtectedRoute>} />
      
      <Route path="/usuarios" element={<ProtectedRoute allowedRoles={adminRoles}><GestaoUsuariosView /></ProtectedRoute>} />
      <Route path="/modalidades" element={<ProtectedRoute allowedRoles={adminRoles}><ModalidadesView /></ProtectedRoute>} />
      <Route path="/agenda" element={<ProtectedRoute allowedRoles={adminRoles}><AgendaView /></ProtectedRoute>} />
      
      <Route path="/admin/cadastrar-aula" element={<ProtectedRoute allowedRoles={adminRoles}><CadastrarAulaView /></ProtectedRoute>} />
      
      <Route path="/aulas/:id" element={<ProtectedRoute allowedRoles={adminRoles}><DetalhesAulaView /></ProtectedRoute>} />
      <Route path="/aulas/:id/editar" element={<ProtectedRoute allowedRoles={adminRoles}><EditarAulaView /></ProtectedRoute>} />
      
      <Route path="/studios" element={<ProtectedRoute allowedRoles={['admin_master']}><GerenciamentoStudiosView /></ProtectedRoute>} />
      <Route path="/studios/cadastrar" element={<ProtectedRoute allowedRoles={['admin_master']}><CadastrarStudioView /></ProtectedRoute>} />
      <Route path="/studios/:id" element={<ProtectedRoute allowedRoles={adminRoles}><DetalhesStudioView /></ProtectedRoute>} />
      <Route path="/studios/:id/editar" element={<ProtectedRoute allowedRoles={adminRoles}><EditarStudioView /></ProtectedRoute>} />
      
      <Route path="/horarios" element={<ProtectedRoute allowedRoles={adminRoles}><HorariosView /></ProtectedRoute>} />
      <Route path="/horarios/novo" element={<ProtectedRoute allowedRoles={adminRoles}><CadastrarHorarioView /></ProtectedRoute>} />
      <Route path="/horarios/editar/:id" element={<ProtectedRoute allowedRoles={adminRoles}><EditarHorarioView /></ProtectedRoute>} />
      
      <Route path="/bloqueios" element={<ProtectedRoute allowedRoles={adminRoles}><BloqueiosView /></ProtectedRoute>} />
      <Route path="/bloqueios/novo" element={<ProtectedRoute allowedRoles={adminRoles}><CadastrarBloqueioView /></ProtectedRoute>} />
      <Route path="/bloqueios/editar/:id" element={<ProtectedRoute allowedRoles={adminRoles}><EditarBloqueioView /></ProtectedRoute>} />
      
      <Route path="/planos" element={<ProtectedRoute allowedRoles={adminRoles}><PlanosView /></ProtectedRoute>} />
      <Route path="/planos/novo" element={<ProtectedRoute allowedRoles={adminRoles}><PlanoFormView /></ProtectedRoute>} />
      <Route path="/planos/editar/:id" element={<ProtectedRoute allowedRoles={adminRoles}><PlanoFormView /></ProtectedRoute>} />
      
      <Route path="/produtos" element={<ProtectedRoute allowedRoles={adminRoles}><GerenciamentoProdutosView /></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute allowedRoles={adminRoles}><GerenciamentoFinanceiroView /></ProtectedRoute>} />
      <Route path="/vendas" element={<ProtectedRoute allowedRoles={adminRoles}><GestaoVendasView /></ProtectedRoute>} />
      <Route path="/vendas/nova" element={<ProtectedRoute allowedRoles={adminRoles}><CadastrarVendaView /></ProtectedRoute>} />
      <Route path="/vendas/:id" element={<ProtectedRoute allowedRoles={adminRoles}><DetalhesVendaView /></ProtectedRoute>} />
      
      <Route path="/financeiro/pagamentos" element={<ProtectedRoute allowedRoles={adminRoles}><GerenciamentoPagamentosView /></ProtectedRoute>} />
      <Route path="/financeiro/pagamentos/:id" element={<ProtectedRoute allowedRoles={adminRoles}><DetalhesPagamentoView /></ProtectedRoute>} />
      <Route path="/financeiro/pagamentos/novo" element={<ProtectedRoute allowedRoles={adminRoles}><CadastrarPagamentoView /></ProtectedRoute>} />
      <Route path="/financeiro/pagamentos/:id/editar" element={<ProtectedRoute allowedRoles={adminRoles}><EditarPagamentoView /></ProtectedRoute>} />
      
      <Route path="/matriculas" element={<ProtectedRoute allowedRoles={adminRoles}><GerenciamentoMatriculasView /></ProtectedRoute>} />
      <Route path="/matriculas/nova" element={<ProtectedRoute allowedRoles={adminRoles}><CadastrarMatriculaView /></ProtectedRoute>} />
      <Route path="/matriculas/:id" element={<ProtectedRoute allowedRoles={adminRoles}><DetalhesMatriculaView /></ProtectedRoute>} />
      <Route path="/matriculas/:id/editar" element={<ProtectedRoute allowedRoles={adminRoles}><EditarMatriculaView /></ProtectedRoute>} />
      
      <Route path="/relatorios" element={<ProtectedRoute allowedRoles={adminRoles}><RelatoriosView /></ProtectedRoute>} />

      <Route path="/marcar-aula" element={<ProtectedRoute><MarcarAulaView /></ProtectedRoute>} />
      
      <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesView /></ProtectedRoute>} />

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
