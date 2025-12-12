import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import useGerenciamentoFinanceiroViewModel from '../viewmodels/useGerenciamentoFinanceiroViewModel';
import { useToast } from '../context/ToastContext';

const GerenciamentoFinanceiroView = () => {
    const {
        dashboardData,
        loadingDashboard,
        error,
    } = useGerenciamentoFinanceiroViewModel();
    const { showToast } = useToast();

    const formatPrice = (price) => {
        if (price === null || price === undefined) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const SummaryCard = ({ title, value, isLoading }) => (
        <div className="flex flex-col">
            {isLoading ? (
                <>
                    <div className="h-7 w-24 animate-pulse rounded-md bg-gray-300 dark:bg-gray-600"></div>
                    <div className="mt-1 h-5 w-32 animate-pulse rounded-md bg-gray-300 dark:bg-gray-600"></div>
                </>
            ) : (
                <>
                    <span className="text-xl font-bold">{value}</span>
                    <span className="text-sm">{title}</span>
                </>
            )}
        </div>
    );

    const QuickActionButton = ({ to, icon, label }) => (
        <Link to={to} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm hover:bg-gray-50 dark:bg-white/10 dark:hover:bg-white/20">
            <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</h3>
        </Link>
    );

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Gestão Financeira" showBackButton={true} />
            
            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-4xl">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Erro:</strong>
                            <span className="block sm:inline"> {error.message || 'Ocorreu um erro ao carregar o dashboard.'}</span>
                        </div>
                    )}

                    {loadingDashboard ? (
                        <p>Carregando dados do dashboard...</p>
                    ) : (
                        dashboardData && (
                            <>
                                {/* Seção Financeiro */}
                                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50 mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Resumo Financeiro</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <SummaryCard title="Receita Confirmada Mês" value={formatPrice(dashboardData.financeiro.receita_confirmada_mes)} />
                                        <SummaryCard title="Receita Pendente Mês" value={formatPrice(dashboardData.financeiro.receita_pendente_mes)} />
                                        <SummaryCard title="Pagamentos Atrasados" value={dashboardData.financeiro.pagamentos_atrasados_total} />
                                    </div>
                                </div>

                                {/* Seção Insights Estratégicos */}
                                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50 mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Insights Estratégicos</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <SummaryCard title="Novas Matrículas Mês" value={dashboardData.insights_estrategicos.novas_matriculas_mes} />
                                        <SummaryCard title="Receita Produtos Mês" value={formatPrice(dashboardData.insights_estrategicos.receita_produtos_mes)} />
                                        <SummaryCard title="Taxa Ocupação Média 30d" value={`${dashboardData.insights_estrategicos.taxa_ocupacao_media_30d}%`} />
                                        <SummaryCard title="Plano Mais Popular" value={dashboardData.insights_estrategicos.plano_mais_popular} />
                                        <SummaryCard title="Instrutor Destaque" value={dashboardData.insights_estrategicos.instrutor_destaque} />
                                    </div>
                                </div>
                            </>
                        )
                    )}

                    {/* Botões de Ação Rápida (permanecem inalterados) */}
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionButton to="/planos" icon="sell" label="Gestão de Planos" />
                        <QuickActionButton to="/produtos" icon="inventory_2" label="Gestão de Produtos" />
                        <QuickActionButton to="/matriculas" icon="assignment_ind" label="Gestão de Matrículas" />
                        <QuickActionButton to="/vendas" icon="shopping_cart" label="Gestão de Vendas" />
                        <QuickActionButton to="/financeiro/pagamentos" icon="payments" label="Gestão de Pagamentos" />
                        <QuickActionButton to="/relatorios" icon="bar_chart" label="Relatórios Financeiros" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GerenciamentoFinanceiroView;
