import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMinhasAvaliacoes } from '../services/avaliacoesService';
import Header from '../components/Header';
import AvaliacaoAlunoCard from '../components/AvaliacaoAlunoCard';

const MinhasAvaliacoesView = () => {
    const { loading: authLoading } = useAuth(); 
    
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMinhasAvaliacoes = async () => {
            if (authLoading) {
                return;
            }

            try {
                setLoading(true);
                const response = await getMinhasAvaliacoes();
                setAvaliacoes(response.data);
            } catch (err) {
                const errorMsg = err.response?.data?.detail || "Erro ao carregar suas avaliações.";
                setError(errorMsg);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMinhasAvaliacoes();
    }, [authLoading]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
                <Header title="Minhas Avaliações" showBackButton={true} /> {/* **CORREÇÃO APLICADA AQUI** */}
                <main className="flex-grow p-4">
                    <p className="text-center">Verificando autenticação...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Minhas Avaliações" showBackButton={true} /> {/* **CORREÇÃO APLICADA AQUI** */}

            <main className="flex-grow p-4">
                <div className="mx-auto max-w-4xl space-y-4">
                    {loading && <p className="text-center">Carregando avaliações...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    {!loading && !error && (
                        avaliacoes.length > 0 ? (
                            avaliacoes.map(avaliacao => (
                                <AvaliacaoAlunoCard key={avaliacao.id} avaliacao={avaliacao} />
                            ))
                        ) : (
                            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                                <p className="text-gray-500 dark:text-gray-400">Você ainda não possui nenhuma avaliação registrada.</p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default MinhasAvaliacoesView;
