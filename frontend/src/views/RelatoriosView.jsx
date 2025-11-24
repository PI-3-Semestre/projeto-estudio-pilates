import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import useRelatoriosViewModel from '../viewmodels/useRelatoriosViewModel';
import FilterBottomSheet from '../components/FilterBottomSheet';

// Importando os widgets
import FaturamentoWidget from '../components/widgets/FaturamentoWidget';
import VendasPorProdutoWidget from '../components/widgets/VendasPorProdutoWidget';
import StatusPagamentosWidget from '../components/widgets/StatusPagamentosWidget';
import MatriculasAtivasWidget from '../components/widgets/MatriculasAtivasWidget';

const QuickPeriodButton = ({ label, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm border rounded-full transition-colors ${
            isActive 
            ? 'bg-primary text-white border-primary' 
            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
);

const RelatoriosView = () => {
    const {
        filters,
        draftFilters,
        studios,
        loading,
        handleDraftFilterChange,
        setPeriodo,
        applyAndFetch,
        clearFilters,
        faturamentoData,
        vendasPorProdutoData,
        statusPagamentosData,
        matriculasAtivasData,
    } = useRelatoriosViewModel();

    const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
    const [activePeriod, setActivePeriod] = useState('');

    const handleApplyFilters = () => {
        applyAndFetch();
        setFilterSheetOpen(false);
    };

    const handleClearFilters = () => {
        clearFilters();
        setFilterSheetOpen(false);
        setActivePeriod('');
    };

    const handlePeriodClick = (period) => {
        setPeriodo(period);
        setActivePeriod(period);
    };

    const getActiveFiltersText = () => {
        const parts = [];
        if (filters.data_inicio && filters.data_fim) {
            const start = new Date(filters.data_inicio + 'T00:00:00').toLocaleDateString();
            const end = new Date(filters.data_fim + 'T00:00:00').toLocaleDateString();
            parts.push(`${start} - ${end}`);
        }
        if (filters.studio_id) {
            const studio = studios.find(s => s.id === parseInt(filters.studio_id));
            if (studio) {
                parts.push(studio.nome);
            }
        }
        return parts.length > 0 ? parts.join(' | ') : 'Sem filtros aplicados';
    };

    // Reset active period button if dates are changed manually
    useEffect(() => {
        setActivePeriod('');
    }, [draftFilters.data_inicio, draftFilters.data_fim]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Relatórios" showBackButton={true} />
            
            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-7xl">
                    {/* Botão de Filtro */}
                    <div className="mb-4">
                        <button 
                            onClick={() => setFilterSheetOpen(true)}
                            className="flex items-center justify-center gap-2 w-full md:w-auto rounded-lg bg-white dark:bg-card-dark px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <span className="material-symbols-outlined">filter_list</span>
                            <span>{getActiveFiltersText()}</span>
                        </button>
                    </div>

                    {/* Widgets de relatório */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FaturamentoWidget data={faturamentoData} isLoading={loading} />
                        <VendasPorProdutoWidget data={vendasPorProdutoData} isLoading={loading} />
                        <StatusPagamentosWidget data={statusPagamentosData} isLoading={loading} />
                        <MatriculasAtivasWidget data={matriculasAtivasData} isLoading={loading} />
                    </div>

                    <FilterBottomSheet
                        isOpen={isFilterSheetOpen}
                        onClose={() => setFilterSheetOpen(false)}
                        title="Filtrar Relatórios"
                        onClearFilters={handleClearFilters}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Período Rápido</label>
                                <div className="flex flex-wrap gap-2">
                                    <QuickPeriodButton label="Últimos 7 dias" onClick={() => handlePeriodClick('LAST_7_DAYS')} isActive={activePeriod === 'LAST_7_DAYS'} />
                                    <QuickPeriodButton label="Este Mês" onClick={() => handlePeriodClick('THIS_MONTH')} isActive={activePeriod === 'THIS_MONTH'} />
                                    <QuickPeriodButton label="Mês Passado" onClick={() => handlePeriodClick('LAST_MONTH')} isActive={activePeriod === 'LAST_MONTH'} />
                                    <QuickPeriodButton label="Últimos 90 dias" onClick={() => handlePeriodClick('LAST_90_DAYS')} isActive={activePeriod === 'LAST_90_DAYS'} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data Início</label>
                                <input
                                    type="date"
                                    id="data_inicio"
                                    value={draftFilters.data_inicio}
                                    onChange={(e) => handleDraftFilterChange({ data_inicio: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="data_fim" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data Fim</label>
                                <input
                                    type="date"
                                    id="data_fim"
                                    value={draftFilters.data_fim}
                                    onChange={(e) => handleDraftFilterChange({ data_fim: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="studio_id" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Studio</label>
                                <select
                                    id="studio_id"
                                    value={draftFilters.studio_id}
                                    onChange={(e) => handleDraftFilterChange({ studio_id: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Todos os Studios</option>
                                    {studios.map(studio => (
                                        <option key={studio.id} value={studio.id}>{studio.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4">
                                <button 
                                    onClick={handleApplyFilters}
                                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg"
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    </FilterBottomSheet>
                </div>
            </main>
        </div>
    );
};

export default RelatoriosView;
