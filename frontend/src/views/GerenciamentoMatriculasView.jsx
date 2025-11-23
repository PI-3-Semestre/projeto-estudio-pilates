import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useGerenciarMatriculasViewModel from '../viewmodels/useGerenciarMatriculasViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import MatriculaCard from '../components/MatriculaCard';

const GerenciamentoMatriculasView = () => {
    const navigate = useNavigate();
    const {
        matriculas,
        allStudios, // Importa a lista de estúdios
        loading,
        handleDeleteMatricula,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        searchText,
        setSearchText,
    } = useGerenciarMatriculasViewModel();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [matriculaToDelete, setMatriculaToDelete] = useState(null);

    const openDeleteModal = (matricula) => {
        setMatriculaToDelete(matricula);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (matriculaToDelete) {
            handleDeleteMatricula(matriculaToDelete);
        }
        setIsModalOpen(false);
        setMatriculaToDelete(null);
    };

    const handleEdit = (matricula) => {
        navigate(`/matriculas/${matricula.id}/editar`);
    };

    const handleRenovar = (matricula) => {
        navigate('/matriculas/nova', { state: { matriculaParaRenovar: matricula } });
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Gestão de Matrículas" showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-7xl">
                    {/* Controles de Ações e Ordenação */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        <button
                            onClick={() => navigate('/matriculas/nova')}
                            className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-action-primary text-white gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
                        >
                            <div className="text-white">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <span className="truncate">Nova Matrícula</span>
                        </button>

                        <div className="flex flex-col sm:flex-row gap-3 flex-wrap flex-grow">
                            {/* Campo de Busca */}
                            <div className="flex-grow">
                                <label className="flex flex-col min-w-40 h-12 w-full">
                                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                                        <div className="text-text-subtle-light dark:text-text-subtle-dark flex border-none bg-input-background-light dark:bg-input-background-dark items-center justify-center pl-4 rounded-l-xl border-r-0">
                                            <span className="material-symbols-outlined">search</span>
                                        </div>
                                        <input
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-input-background-light dark:bg-input-background-dark focus:border-none h-full placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                            placeholder="Buscar por nome ou CPF do aluno..."
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Ordenação */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                            >
                                <option value="data_inicio">Ordenar por Início</option>
                                <option value="data_fim">Ordenar por Fim</option>
                                <option value="aluno_nome">Ordenar por Aluno</option>
                                <option value="plano_nome">Ordenar por Plano</option>
                            </select>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                            >
                                <option value="asc">Crescente</option>
                                <option value="desc">Decrescente</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista de Matrículas em formato de Card */}
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Todas as Matrículas</h2>
                        {loading ? (
                            <p>Carregando matrículas...</p>
                        ) : matriculas.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {matriculas.map((matricula) => (
                                    <MatriculaCard
                                        key={matricula.id}
                                        matricula={matricula}
                                        allStudios={allStudios} // Passa a lista de estúdios
                                        onDelete={openDeleteModal}
                                        onEdit={handleEdit}
                                        onRenovar={handleRenovar}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma matrícula encontrada.</p>
                        )}
                    </div>
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
                message="Você tem certeza que deseja excluir esta matrícula? Esta ação é destrutiva."
            />
        </div>
    );
};

export default GerenciamentoMatriculasView;
