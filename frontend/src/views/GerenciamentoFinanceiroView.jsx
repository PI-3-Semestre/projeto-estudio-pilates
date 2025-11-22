import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import useGerenciamentoFinanceiroViewModel from '../viewmodels/useGerenciamentoFinanceiroViewModel';

const GerenciamentoFinanceiroView = () => {
    const {
        resumo,
        transacoes,
        loadingResumo,
        loadingTransacoes,
        filters,
        applyFilters,
        handleDeleteTransacao,
        error,
    } = useGerenciamentoFinanceiroViewModel();

    const formatPrice = (price) => {
        if (!price) return "R$ 0,00";
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
            <Header title="Gerenciamento Financeiro" showBackButton={true} />
            
            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-4xl">
                    {/* Resumo Financeiro */}
                    <div className="flex flex-col rounded-xl bg-primary/20 p-4 dark:bg-primary/30 mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumo Financeiro</h2>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-gray-800 dark:text-gray-100 sm:grid-cols-3">
                            <SummaryCard title="Receita Total" value={formatPrice(resumo?.receitaTotal)} isLoading={loadingResumo} />
                            <SummaryCard title="Pag. Pendentes" value={formatPrice(resumo?.pagamentosPendentes)} isLoading={loadingResumo} />
                            {/* Adicionar mais cards de resumo conforme o backend */}
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50 mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Filtros</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data Início</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={filters.startDate}
                                    onChange={(e) => applyFilters({ startDate: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data Fim</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={filters.endDate}
                                    onChange={(e) => applyFilters({ endDate: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Tipo</label>
                                <select
                                    id="typeFilter"
                                    value={filters.type}
                                    onChange={(e) => applyFilters({ type: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="all">Todos</option>
                                    <option value="receita">Receita</option>
                                    <option value="despesa">Despesa</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabela de Transações */}
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Transações</h2>
                        {loadingTransacoes ? (
                            <p>Carregando transações...</p>
                        ) : transacoes.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Data</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Descrição</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Valor</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Tipo</th>
                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-card-dark dark:divide-gray-700">
                                        {transacoes.map((transacao) => (
                                            <tr key={transacao.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{transacao.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{transacao.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatPrice(transacao.amount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{transacao.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleDeleteTransacao(transacao.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma transação encontrada.</p>
                        )}
                    </div>

                    {/* Botões de Ação Rápida */}
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionButton to="/planos" icon="sell" label="Gestão de Planos" />
                        <QuickActionButton to="/produtos" icon="inventory_2" label="Gestão de Produtos" />
                        <QuickActionButton to="/matriculas" icon="assignment_ind" label="Gestão de Matrículas" />
                        <QuickActionButton to="/vendas" icon="shopping_cart" label="Gestão de Vendas" />
                        <QuickActionButton to="/financeiro/pagamentos" icon="payments" label="Gestão de Pagamentos" /> {/* Rota corrigida */}
                        <QuickActionButton to="/relatorios" icon="bar_chart" label="Relatórios Financeiros" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GerenciamentoFinanceiroView;
