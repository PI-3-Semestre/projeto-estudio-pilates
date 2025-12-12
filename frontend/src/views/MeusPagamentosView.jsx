import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import financeiroService from '../services/financeiroService';
import Header from '../components/Header';
import { format } from 'date-fns';
import Icon from '../components/Icon';

const PagamentoCard = ({ pagamento }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        date.setUTCDate(date.getUTCDate() + 1);
        return format(date, 'dd/MM/yyyy');
    };

    const formatPrice = (price) => {
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice)) {
            return "R$ 0,00";
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(numericPrice);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAGO': return 'bg-green-100 text-green-800';
            case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
            case 'ATRASADO': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {pagamento.matricula?.plano?.nome || pagamento.venda?.descricao || 'Pagamento'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                    {pagamento.status}
                </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Valor: {formatPrice(pagamento.valor_total)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Vencimento: {formatDate(pagamento.data_vencimento)}
            </p>
            {pagamento.data_pagamento && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pago em: {formatDate(pagamento.data_pagamento)}
                </p>
            )}
            {pagamento.comprovante_pagamento && (
                <div className="mt-2">
                    <a 
                        href={pagamento.comprovante_pagamento} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                        <Icon name="attach_file" style={{ fontSize: '16px' }} />
                        Ver Comprovante
                    </a>
                </div>
            )}
        </div>
    );
};

const MeusPagamentosView = () => {
    const { loading: authLoading } = useAuth();
    const [pagamentos, setPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMeusPagamentos = async () => {
            if (authLoading) {
                return; // Aguarda a autenticação ser verificada
            }

            try {
                setLoading(true);
                const response = await financeiroService.getMeusPagamentos();
                setPagamentos(response.data);
            } catch (err) {
                const errorMsg = err.response?.data?.detail || "Erro ao carregar seus pagamentos.";
                setError(errorMsg);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMeusPagamentos();
    }, [authLoading]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
                <Header title="Meus Pagamentos" showBackButton={true} />
                <main className="flex-grow p-4">
                    <p className="text-center">Verificando autenticação...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Meus Pagamentos" showBackButton={true} />

            <main className="flex-grow p-4">
                <div className="mx-auto max-w-4xl space-y-4">
                    {loading && <p className="text-center">Carregando pagamentos...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    {!loading && !error && (
                        pagamentos.length > 0 ? (
                            pagamentos.map(pagamento => (
                                <PagamentoCard key={pagamento.id} pagamento={pagamento} />
                            ))
                        ) : (
                            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                                <p className="text-gray-500 dark:text-gray-400">Você ainda não possui nenhum pagamento registrado.</p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default MeusPagamentosView;
