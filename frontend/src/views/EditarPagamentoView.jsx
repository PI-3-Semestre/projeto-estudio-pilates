import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useEditarPagamentoViewModel from '../viewmodels/useEditarPagamentoViewModel';

const EditarPagamentoView = () => {
    const navigate = useNavigate();
    const {
        pagamento,
        valorTotal, setValorTotal,
        dataVencimento, setDataVencimento,
        status, setStatus,
        metodoPagamento, setMetodoPagamento,
        dataPagamento, setDataPagamento,
        comprovanteFile, setComprovanteFile,
        comprovanteAtual, setComprovanteAtual,
        handleFileChange,
        loading,
        submitting,
        handleSubmit,
    } = useEditarPagamentoViewModel();

    if (loading) {
        return <div>Carregando dados do pagamento...</div>;
    }

    if (!pagamento) {
        return <div>Pagamento não encontrado.</div>;
    }

    const isMatricula = !!pagamento.matricula;
    const isVenda = !!pagamento.venda;

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={`Editar Pagamento #${pagamento.id}`} showBackButton={true} />

            <main className="flex-grow p-4">
                <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 bg-white dark:bg-card-dark p-6 rounded-xl shadow-md">
                    
                    {/* Informações da Matrícula/Venda Associada */}
                    {(isMatricula || isVenda) && (
                        <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                {isMatricula ? 'Matrícula Associada' : 'Venda Associada'}
                            </h3>
                            {isMatricula && pagamento.matricula && (
                                <>
                                    <p className="text-gray-800 dark:text-gray-200">Aluno: {pagamento.matricula.aluno?.nome || 'N/A'}</p>
                                    <p className="text-gray-600 dark:text-gray-400">Plano: {pagamento.matricula.plano?.nome || 'N/A'}</p>
                                </>
                            )}
                            {isVenda && pagamento.venda && (
                                <>
                                    <p className="text-gray-800 dark:text-gray-200">Aluno: {pagamento.venda.aluno?.nome || 'Venda Avulsa'}</p>
                                    <p className="text-gray-600 dark:text-gray-400">Venda ID: {pagamento.venda.id}</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Campos Editáveis do Pagamento */}
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
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="PENDENTE">Pendente</option>
                                <option value="PAGO">Pago</option>
                                <option value="ATRASADO">Atrasado</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Método de Pagamento</label>
                            <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="">-- Selecione --</option>
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
                                <input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                        )}
                    </div>

                    {/* Upload de Comprovante */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Comprovante</label>
                        {comprovanteFile ? (
                            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <p className="text-gray-800 dark:text-gray-200 truncate">{comprovanteFile.name}</p>
                                <button type="button" onClick={() => setComprovanteFile(null)} className="text-red-500 hover:text-red-700">Remover</button>
                            </div>
                        ) : comprovanteAtual ? (
                            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <a href={comprovanteAtual} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">Ver Comprovante Atual</a>
                                <button type="button" onClick={() => setComprovanteAtual(null)} className="text-red-500 hover:text-red-700">Remover</button>
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

                    {/* Botões de Ação */}
                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate(`/financeiro/pagamentos/${pagamento.id}`)}
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

export default EditarPagamentoView;
