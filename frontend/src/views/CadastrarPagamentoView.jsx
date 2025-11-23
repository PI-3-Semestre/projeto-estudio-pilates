import React from 'react';
import Header from '../components/Header';
import useCadastrarPagamentoViewModel from '../viewmodels/useCadastrarPagamentoViewModel';

const CadastrarPagamentoView = () => {
    const {
        tipoAssociacao, setTipoAssociacao,
        alunoSearchQuery, setAlunoSearchQuery,
        alunoSearchResults, setAlunoSearchResults,
        selectedAluno, setSelectedAluno,
        associacoesDisponiveis,
        selectedAssociacaoId, setSelectedAssociacaoId,
        valorTotal, setValorTotal,
        dataVencimento, setDataVencimento,
        status, setStatus,
        metodoPagamento, setMetodoPagamento,
        dataPagamento, setDataPagamento,
        comprovanteFile, setComprovanteFile,
        handleFileChange,
        loading,
        submitting,
        handleSubmit,
    } = useCadastrarPagamentoViewModel();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Registrar Novo Pagamento" showBackButton={true} />

            <main className="flex-grow p-4">
                <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
                    
                    {/* 1. Tipo de Associação */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Tipo de Associação</label>
                        <select
                            value={tipoAssociacao}
                            onChange={(e) => {
                                setTipoAssociacao(e.target.value);
                                setSelectedAluno(null);
                                setAssociacoesDisponiveis([]);
                                setSelectedAssociacaoId('');
                            }}
                            className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="matricula">Matrícula</option>
                            <option value="venda">Venda</option>
                        </select>
                    </div>

                    {/* 2. Busca e Seleção de Aluno */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Buscar Aluno</label>
                        {selectedAluno ? (
                            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <p className="text-gray-800 dark:text-gray-200">{selectedAluno.nome}</p>
                                <button type="button" onClick={() => { setSelectedAluno(null); setAssociacoesDisponiveis([]); setSelectedAssociacaoId(''); }} className="text-red-500 hover:text-red-700">Remover</button>
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

                    {/* 3. Seleção da Matrícula/Venda */}
                    {selectedAluno && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Selecionar {tipoAssociacao === 'matricula' ? 'Matrícula' : 'Venda'}
                            </label>
                            <select
                                value={selectedAssociacaoId}
                                onChange={(e) => setSelectedAssociacaoId(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                disabled={loading || associacoesDisponiveis.length === 0}
                            >
                                <option value="">-- Selecione uma opção --</option>
                                {associacoesDisponiveis.map(assoc => (
                                    <option key={assoc.id} value={assoc.id}>
                                        {tipoAssociacao === 'matricula' ? `Plano: ${assoc.plano.nome} (Vence em: ${formatDate(assoc.data_fim)})` : `Venda #${assoc.id} - ${formatDate(assoc.data_venda)}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 4. Detalhes do Pagamento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Valor Total (R$)</label>
                            <input type="number" step="0.01" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data de Vencimento</label>
                            <input type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={!!comprovanteFile} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50">
                                <option value="PENDENTE">Pendente</option>
                                <option value="PAGO">Pago</option>
                                <option value="ATRASADO">Atrasado</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Método de Pagamento</label>
                            <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="PIX">PIX</option>
                                <option value="DINHEIRO">Dinheiro</option>
                                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                                <option value="BOLETO">Boleto</option>
                            </select>
                        </div>
                        {status === 'PAGO' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Data de Pagamento</label>
                                <input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} disabled={!!comprovanteFile} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50" required />
                            </div>
                        )}
                    </div>

                    {/* 5. Upload de Comprovante */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Anexar Comprovante (Opcional)</label>
                        {comprovanteFile ? (
                            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <p className="text-gray-800 dark:text-gray-200 truncate">{comprovanteFile.name}</p>
                                <button type="button" onClick={() => setComprovanteFile(null)} className="text-red-500 hover:text-red-700">Remover</button>
                            </div>
                        ) : (
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        )}
                    </div>

                    {/* Botão de Submissão */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2 px-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {submitting ? 'Registrando...' : 'Registrar Pagamento'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CadastrarPagamentoView;
