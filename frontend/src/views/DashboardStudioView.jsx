import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useDashboardStudioViewModel from '../viewmodels/useDashboardStudioViewModel';
import Header from '../components/Header';
import Accordion from '../components/Accordion';

const DashboardStudioView = () => {
    const { dashboardData, loading } = useDashboardStudioViewModel();
    const { studioId } = useParams();

    const formatPrice = (price) => {
        if (!price) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    // QuickActionButton is no longer needed as there are no action buttons
    // const QuickActionButton = ({ to, icon, label }) => (
    //     <Link to={to} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-background-dark/50 dark:hover:bg-white/10">
    //         <span className="material-symbols-outlined text-2xl text-primary">{icon}</span>
    //         <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</h3>
    //     </Link>
    // );

    const StatCard = ({ title, value, subValue, isLoading }) => (
        <div className="flex flex-col">
            {isLoading ? (
                <>
                    <div className="h-7 w-16 animate-pulse rounded-md bg-gray-300 dark:bg-gray-600"></div>
                    <div className="mt-1 h-5 w-24 animate-pulse rounded-md bg-gray-300 dark:bg-gray-600"></div>
                </>
            ) : (
                <>
                    <span className="text-xl font-bold">{value}</span>
                    <span className="text-sm">{title}</span>
                    {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
                </>
            )}
        </div>
    );

    const MetricsContent = () => (
        <div className="space-y-4">
            {/* Financeiro Card */}
            <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financeiro (Mês Atual)</h2>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard title="Receita Confirmada" value={formatPrice(dashboardData?.financeiro?.receita_confirmada_mes)} isLoading={loading} />
                    <StatCard title="Receita Pendente" value={formatPrice(dashboardData?.financeiro?.receita_pendente_mes)} isLoading={loading} />
                    <StatCard title="Pagamentos Atrasados" value={dashboardData?.financeiro?.pagamentos_atrasados_total ?? 0} isLoading={loading} />
                    <StatCard title="Novas Matrículas" value={dashboardData?.financeiro?.novas_matriculas_mes ?? 0} isLoading={loading} />
                    <StatCard title="Receita Produtos" value={formatPrice(dashboardData?.financeiro?.receita_produtos_mes)} isLoading={loading} />
                </div>
            </div>

            {/* Agendamentos Card */}
            <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agendamentos</h2>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard title="Aulas Hoje" value={dashboardData?.agendamentos?.aulas_hoje ?? 0} isLoading={loading} />
                    <StatCard title="Ocupação Hoje" value={`${dashboardData?.agendamentos?.taxa_ocupacao_hoje ?? 0}%`} isLoading={loading} />
                    <StatCard title="Alunos em Espera" value={dashboardData?.agendamentos?.alunos_em_lista_espera ?? 0} isLoading={loading} />
                    <StatCard title="Ocupação Média (30d)" value={`${dashboardData?.agendamentos?.taxa_ocupacao_media_30d ?? 0}%`} isLoading={loading} />
                </div>
            </div>

            {/* Usuários Card */}
            <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Usuários</h2>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard title="Alunos Ativos" value={dashboardData?.usuarios?.alunos_ativos ?? 0} isLoading={loading} />
                    <StatCard title="Colaboradores Ativos" value={dashboardData?.usuarios?.colaboradores_ativos ?? 0} isLoading={loading} />
                    <StatCard title="Novos Usuários (Semana)" value={dashboardData?.usuarios?.novos_usuarios_semana ?? 0} isLoading={loading} />
                    <StatCard title="Matrículas Expirando" value={dashboardData?.usuarios?.matriculas_expirando_mes ?? 0} isLoading={loading} />
                    <StatCard title="Alunos em Risco" value={dashboardData?.usuarios?.alunos_em_risco_churn ?? 0} isLoading={loading} />
                </div>
            </div>

            {/* Alertas Card */}
            <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Alertas</h2>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard title="Notificações Não Lidas" value={dashboardData?.alertas?.notificacoes_nao_lidas ?? 0} isLoading={loading} />
                    <StatCard title="Estoque Baixo" value={dashboardData?.alertas?.produtos_estoque_baixo ?? 0} isLoading={loading} />
                </div>
            </div>

            {/* Insights Estratégicos Card */}
            <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Insights Estratégicos</h2>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard title="Plano Mais Popular" value={dashboardData?.insights_estrategicos?.plano_mais_popular ?? 'N/A'} isLoading={loading} />
                    <StatCard title="Instrutor Destaque" value={dashboardData?.insights_estrategicos?.instrutor_destaque ?? 'N/A'} isLoading={loading} />
                    <StatCard title="Total Avaliações" value={dashboardData?.insights_estrategicos?.total_avaliacoes ?? 0} isLoading={loading} />
                </div>
            </div>
        </div>
    );

    // ActionsContent is no longer needed
    // const ActionsContent = () => (
    //     <div className="grid grid-cols-3 gap-3">
    //         <QuickActionButton to={`/studios/${studioId}/agenda`} icon="calendar_month" label="Agenda" />
    //         <QuickActionButton to={`/studios/${studioId}/alunos`} icon="school" label="Alunos" />
    //         <QuickActionButton to={`/studios/${studioId}/colaboradores`} icon="groups" label="Colaboradores" />
    //         <QuickActionButton to={`/studios/${studioId}/financeiro`} icon="payments" label="Financeiro" />
    //         <QuickActionButton to={`/studios/${studioId}/configuracoes`} icon="settings" label="Ajustes" />
    //         <QuickActionButton to={`/studios/${studioId}/perfil`} icon="person" label="Meu Perfil" />
    //     </div>
    // );

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={dashboardData?.studio_name || 'Dashboard do Estúdio'} showBackButton={true} />
            
            <main className="flex-grow p-4 space-y-4">
                {/* Mobile View: Accordion */}
                <div className="md:hidden space-y-4">
                    {/* ActionsContent removed from here */}
                    <MetricsContent /> {/* Metrics are always visible now */}
                </div>

                {/* Desktop View: Grid */}
                <div className="hidden md:grid md:grid-cols-1 md:gap-4"> {/* Adjusted grid to 1 column for metrics */}
                    <MetricsContent />
                    {/* ActionsContent removed from here */}
                </div>
            </main>
        </div>
    );
};

export default DashboardStudioView;
