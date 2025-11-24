import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useEditarMatriculaViewModel from '../viewmodels/useEditarMatriculaViewModel';

const EditarMatriculaView = () => {
    const navigate = useNavigate();
    const {
        matricula,
        dataInicio,
        setDataInicio,
        dataFim,
        setDataFim,
        loading,
        submitting,
        handleSubmit,
    } = useEditarMatriculaViewModel();

    if (loading) {
        return <div>Carregando dados da matrícula...</div>;
    }

    if (!matricula) {
        return <div>Matrícula não encontrada.</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={`Editar Matrícula #${matricula.id}`} showBackButton={true} />

            <main className="flex-grow p-4">
                <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
                    
                    {/* Informações não editáveis */}
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aluno</p>
                            <p className="text-lg text-gray-800 dark:text-gray-200">{matricula.aluno?.nome || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plano</p>
                            <p className="text-lg text-gray-800 dark:text-gray-200">{matricula.plano?.nome || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Datas Editáveis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-2">
                            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data de Início</label>
                            <input
                                id="dataInicio"
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data de Fim</label>
                            <input
                                id="dataFim"
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/matriculas/${matricula.id}`)}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {submitting ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditarMatriculaView;
