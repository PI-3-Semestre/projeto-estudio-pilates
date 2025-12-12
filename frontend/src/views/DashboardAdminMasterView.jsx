import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import useDashboardAdminMasterViewModel from '../viewmodels/useDashboardAdminMasterViewModel';
import { useAuth } from '../context/AuthContext';
import Accordion from '../components/Accordion';

const DashboardAdminMasterView = () => {
    const { dashboardData, loading } = useDashboardAdminMasterViewModel();
    const { user } = useAuth();

    const formatPrice = (price) => {
        if (!price) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const QuickActionButton = ({ to, icon, label }) => (
        <Link to={to} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-background-dark/50 dark:hover:bg-white/10">
            <span className="material-symbols-outlined text-2xl text-primary">{icon}</span>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</h3>
        </Link>
    );

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
            <div className="flex flex-col rounded-xl bg-primary/20 p-4 dark:bg-primary/30">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Visão Geral</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 text-gray-800 dark:text-gray-100 sm:grid-cols-3">
                    <StatCard title="Estúdios Ativos" value={dashboardData?.total_studios_ativos ?? 0} isLoading={loading} />
                    <StatCard title="Alunos Ativos" value={dashboardData?.usuarios?.alunos_ativos ?? 0} isLoading={loading} />
                    <StatCard title="Colaboradores" value={dashboardData?.usuarios?.colaboradores_ativos ?? 0} isLoading={loading} />
                </div>
            </div>
            <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financeiro (Mês Atual)</h2>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard title="Receita" value={formatPrice(dashboardData?.financeiro?.receita_confirmada_mes)} isLoading={loading} />
                    <StatCard title="Pendente" value={formatPrice(dashboardData?.financeiro?.receita_pendente_mes)} isLoading={loading} />
                    <StatCard title="Atrasados" value={dashboardData?.financeiro?.pagamentos_atrasados_total ?? 0} subValue="Total" isLoading={loading} />
                </div>
            </div>
            <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agendamentos (Hoje)</h2>
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <StatCard title="Aulas" value={dashboardData?.agendamentos?.aulas_hoje ?? 0} isLoading={loading} />
                    <StatCard title="Ocupação" value={`${dashboardData?.agendamentos?.taxa_ocupacao_hoje ?? 0}%`} isLoading={loading} />
                    <StatCard title="Em Espera" value={dashboardData?.agendamentos?.alunos_em_lista_espera ?? 0} isLoading={loading} />
                </div>
            </div>
        </div>
    );

    const ActionsContent = () => (
        <div className="grid grid-cols-3 gap-3">
            <QuickActionButton to="/agenda" icon="calendar_month" label="Agenda" />
            <QuickActionButton to="/alunos" icon="school" label="Alunos" /> {/* Added Alunos button */}
            <QuickActionButton to="/colaboradores" icon="groups" label="Colaboradores" />
            <QuickActionButton to="/studios" icon="store" label="Unidades" />
            <QuickActionButton to="/planos" icon="add_business" label="Planos" />
            <QuickActionButton to="/usuarios" icon="group" label="Usuários" />
            <QuickActionButton to="/financeiro" icon="payments" label="Financeiro" />
            <QuickActionButton to="/configuracoes" icon="settings" label="Ajustes" />
            <QuickActionButton to="/perfil" icon="person" label="Perfil" />
        </div>
    );

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={`Olá, ${user?.first_name || 'Admin'}`} />
            
            <main className="flex-grow p-4 space-y-4">
                {/* Mobile View: Accordion */}
                <div className="md:hidden space-y-4">
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                        <ActionsContent />
                    </div>
                    <Accordion title="Ver Métricas Detalhadas">
                        <MetricsContent />
                    </Accordion>
                </div>

                {/* Desktop View: Grid */}
                <div className="hidden md:grid md:grid-cols-3 md:gap-4">
                    <div className="md:col-span-2 space-y-4">
                        <MetricsContent />
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                             <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
                            <ActionsContent />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardAdminMasterView;
