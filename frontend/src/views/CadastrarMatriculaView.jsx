import React from 'react';
import Header from '../components/Header';
import useCadastrarMatriculaViewModel from '../viewmodels/useCadastrarMatriculaViewModel';
import RenovacaoPagamentoModal from '../components/RenovacaoPagamentoModal';

const CadastrarMatriculaView = () => {
    const {
        alunoSearchQuery, setAlunoSearchQuery,
        alunoSearchResults, setAlunoSearchResults,
        selectedAluno, setSelectedAluno,
        allPlanos,
        selectedPlano, setSelectedPlano,
        allStudios,
        selectedStudio, setSelectedStudio,
        dataInicio, setDataInicio,
        dataFim, setDataFim,
        loading,
        submitting,
        isRenovacao,
        matriculaAnterior,
        novaMatricula,
        setNovaMatricula,
        handleSubmit,
    } = useCadastrarMatriculaViewModel();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        // Adiciona 1 dia para corrigir problemas de fuso horário na exibição
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={isRenovacao ? "Renovar Matrícula" : "Nova Matrícula"} showBackButton={true} />

            <main className="flex-grow p-4">
                <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
                    
                    {isRenovacao && matriculaAnterior && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <h3 className="font-bold text-blue-800 dark:text-blue-200">Contexto da Renovação</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Renovando matrícula para o aluno: <strong>{matriculaAnterior.aluno.nome}</strong>
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Matrícula anterior expirou em: <strong>{formatDate(matriculaAnterior.data_fim)}</strong>
                            </p>
                        </div>
                    )}

                    {/* 1. Aluno */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Aluno</label>
                        {selectedAluno ? (
                            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <p className="text-gray-800 dark:text-gray-200">{selectedAluno.nome}</p>
                                {!isRenovacao && (
                                    <button type="button" onClick={() => setSelectedAluno(null)} className="text-red-500 hover:text-red-700">Remover</button>
                                )}
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={alunoSearchQuery}
                                    onChange={(e) => setAlunoSearchQuery(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Digite o nome do aluno..."
                                />
                                {alunoSearchResults.length > 0 && (
                                    <ul className="mt-2 border border-gray-200 dark:border-gray-600 rounded-md max-h-40 overflow-y-auto">
                                        {alunoSearchResults.map(aluno => (
                                            <li key={aluno.usuario_id} onClick={() => { setSelectedAluno(aluno); setAlunoSearchResults([]); setAlunoSearchQuery(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                                {aluno.nome}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>

                    {/* 2. Seleção de Plano */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Plano</label>
                        <select
                            value={selectedPlano ? JSON.stringify(selectedPlano) : ''}
                            onChange={(e) => setSelectedPlano(JSON.parse(e.target.value))}
                            className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={loading}
                        >
                            <option value="">-- Selecione um plano --</option>
                            {allPlanos.map(plano => (
                                <option key={plano.id} value={JSON.stringify(plano)}>
                                    {plano.nome} - {plano.creditos_semanais}x/semana - R$ {plano.preco}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Seleção de Estúdio */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Estúdio</label>
                        <select
                            value={selectedStudio}
                            onChange={(e) => setSelectedStudio(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                            disabled={loading || isRenovacao}
                        >
                            <option value="">-- Selecione um estúdio --</option>
                            {allStudios.map(studio => (
                                <option key={studio.id} value={studio.id}>
                                    {studio.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 4. Datas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data de Início</label>
                            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                            {isRenovacao && <p className="text-xs text-gray-500 dark:text-gray-400">Sugerido com base no término da matrícula anterior.</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data de Fim</label>
                            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                    </div>

                    {/* Botão de Submissão */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2 px-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {submitting ? 'Registrando...' : (isRenovacao ? 'Confirmar Renovação' : 'Registrar Matrícula')}
                        </button>
                    </div>
                </form>
            </main>

            <RenovacaoPagamentoModal
                isOpen={!!novaMatricula}
                onClose={() => setNovaMatricula(null)}
                matricula={novaMatricula}
            />
        </div>
    );
};

export default CadastrarMatriculaView;
