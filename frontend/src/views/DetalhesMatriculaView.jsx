import React from 'react';
import Header from '../components/Header';
import useDetalhesMatriculaViewModel from '../viewmodels/useDetalhesMatriculaViewModel';
import { Link } from 'react-router-dom';

const DetalhesMatriculaView = () => {
    const { matricula, pagamentos, loading, error } = useDetalhesMatriculaViewModel();

    const formatPrice = (price) => {
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return "R$ 0,00";
        }
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericPrice);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return <div>Carregando detalhes da matrícula...</div>;
    }

    if (error || !matricula) {
        return <div>Erro ao carregar a matrícula. Tente novamente.</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title={`Detalhes da Matrícula #${matricula.id}`} showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-background-dark/50 space-y-6">
                        
                        {/* Aluno */}
                        <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Aluno</h3>
                            <p className="text-gray-800 dark:text-gray-200">{matricula.aluno?.nome || 'N/A'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">CPF: {matricula.aluno?.cpf || 'N/A'}</p>
                        </div>

                        {/* Plano */}
                        <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Plano</h3>
                            <p className="text-gray-800 dark:text-gray-200">{matricula.plano?.nome || 'N/A'}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Duração:</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{matricula.plano?.duracao_dias} dias</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Créditos/Semana:</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{matricula.plano?.creditos_semanais}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Preço:</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatPrice(matricula.plano?.preco)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Período e Estúdio */}
                        <div className="border-b pb-4 border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-400">Data de Início</p>
                                <p className="text-gray-900 dark:text-white">{formatDate(matricula.data_inicio)}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-400">Data de Fim</p>
                                <p className="text-gray-900 dark:text-white">{formatDate(matricula.data_fim)}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-400">Estúdio</p>
                                <p className="text-gray-900 dark:text-white">{matricula.studio?.nome || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Histórico de Pagamentos */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Histórico de Pagamentos</h3>
                            {pagamentos.length > 0 ? (
                                <div className="space-y-3">
                                    {pagamentos.map(pagamento => (
                                        <div key={pagamento.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                            <div>
                                                <p className={`font-semibold ${pagamento.status === 'PAGO' ? 'text-green-600' : 'text-yellow-600'}`}>{pagamento.status}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Vencimento: {formatDate(pagamento.data_vencimento)}</p>
                                            </div>
                                            <p className="font-bold text-gray-900 dark:text-white">{formatPrice(pagamento.valor_total)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum pagamento associado a esta matrícula.</p>
                            )}
                        </div>

                        {/* Ações */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end space-x-3">
                            <Link 
                                to={`/financeiro/pagamentos/novo?matriculaId=${matricula.id}`}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
                            >
                                Registrar Pagamento
                            </Link>
                            <Link 
                                to={`/matriculas/${matricula.id}/editar`}
                                className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600"
                            >
                                Editar Matrícula
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetalhesMatriculaView;
