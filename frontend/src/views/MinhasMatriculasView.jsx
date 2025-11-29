import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import matriculasService from '../services/matriculasService';
import Header from '../components/Header';
import { format } from 'date-fns';
import Icon from '../components/Icon'; // Supondo que você tenha um componente Icon

const MatriculaCard = ({ matricula }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        date.setUTCDate(date.getUTCDate() + 1);
        return format(date, 'dd/MM/yyyy');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ATIVA': return 'bg-green-100 text-green-800';
            case 'ENCERRADA': return 'bg-red-100 text-red-800';
            case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{matricula.plano.nome}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(matricula.status)}`}>
                    {matricula.status}
                </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Estúdio: {matricula.studio.nome}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Período: {formatDate(matricula.data_inicio)} - {formatDate(matricula.data_fim)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(matricula.plano.preco)}
            </p>
        </div>
    );
};

const MinhasMatriculasView = () => {
    const { loading: authLoading } = useAuth();
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMinhasMatriculas = async () => {
            if (authLoading) {
                return; // Aguarda a autenticação ser verificada
            }

            try {
                setLoading(true);
                const response = await matriculasService.getMinhasMatriculas();
                setMatriculas(response.data);
            } catch (err) {
                // **CORREÇÃO APLICADA AQUI**
                // Mensagem de erro mais específica para 500 Internal Server Error
                let errorMsg = "Erro ao carregar suas matrículas.";
                if (err.response && err.response.status === 500) {
                    errorMsg = "Ocorreu um erro interno no servidor ao buscar suas matrículas. Por favor, tente novamente mais tarde ou contate o suporte.";
                } else if (err.response && err.response.data && err.response.data.detail) {
                    errorMsg = err.response.data.detail;
                }
                setError(errorMsg);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMinhasMatriculas();
    }, [authLoading]);

    if (authLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
                <Header title="Minhas Matrículas" showBackButton={true} />
                <main className="flex-grow p-4">
                    <p className="text-center">Verificando autenticação...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Minhas Matrículas" showBackButton={true} />

            <main className="flex-grow p-4">
                <div className="mx-auto max-w-4xl space-y-4">
                    {loading && <p className="text-center">Carregando matrículas...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    {!loading && !error && (
                        matriculas.length > 0 ? (
                            matriculas.map(matricula => (
                                <MatriculaCard key={matricula.id} matricula={matricula} />
                            ))
                        ) : (
                            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                                <p className="text-gray-500 dark:text-gray-400">Você ainda não possui nenhuma matrícula registrada.</p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default MinhasMatriculasView;
