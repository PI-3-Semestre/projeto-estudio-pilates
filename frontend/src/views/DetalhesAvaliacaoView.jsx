import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getAvaliacaoById } from '../services/avaliacoesService';
import Header from '../components/Header';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const DetailItem = ({ label, value }) => (
    <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 sm:mt-0 sm:col-span-2">{value || 'Não informado'}</dd>
    </div>
);

const DetalhesAvaliacaoView = () => {
    const { id } = useParams();
    const location = useLocation(); // Hook para acessar o estado da rota
    const { userType } = useAuth();

    const [avaliacao, setAvaliacao] = useState(location.state?.avaliacao || null);
    const [loading, setLoading] = useState(!avaliacao); // Só carrega se a avaliação não veio pelo estado
    const [error, setError] = useState(null);

    useEffect(() => {
        // Se a avaliação já foi passada pelo estado, não faz nada.
        if (avaliacao) {
            return;
        }

        // Se a avaliação não veio pelo estado (ex: admin acessando URL direta), busca na API.
        const fetchAvaliacao = async () => {
            // Apenas perfis de staff podem fazer esta chamada.
            if (userType === 'aluno') {
                setError("Acesso negado. Detalhes da avaliação não foram pré-carregados.");
                setLoading(false);
                return;
            }

            try {
                const response = await getAvaliacaoById(id);
                setAvaliacao(response.data);
            } catch (err) {
                setError('Não foi possível carregar os detalhes da avaliação.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvaliacao();
    }, [id, avaliacao, userType]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Não informado';
        const date = new Date(dateString);
        date.setUTCDate(date.getUTCDate() + 1);
        return format(date, 'dd/MM/yyyy');
    };

    if (loading) {
        return <div className="text-center p-10">Carregando detalhes...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">{error}</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Detalhes da Avaliação" showBackButton={true} />

            <main className="flex-grow p-4">
                <div className="mx-auto max-w-4xl bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    {avaliacao ? (
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold leading-6 text-gray-900 dark:text-white">
                                        Avaliação de {avaliacao.aluno_nome}
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                        Realizada em {formatDate(avaliacao.data_avaliacao)} por {avaliacao.instrutor_nome}.
                                    </p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700">
                                <dl>
                                    <DetailItem label="Diagnóstico Fisioterapêutico" value={avaliacao.diagnostico_fisioterapeutico} />
                                    <DetailItem label="Objetivo do Aluno" value={avaliacao.objetivo_aluno} />
                                    <DetailItem label="Histórico Médico" value={avaliacao.historico_medico} />
                                    <DetailItem label="Patologias" value={avaliacao.patologias} />
                                    <DetailItem label="Exames Complementares" value={avaliacao.exames_complementares} />
                                    <DetailItem label="Medicamentos em Uso" value={avaliacao.medicamentos_em_uso} />
                                    <DetailItem label="Tratamentos Realizados" value={avaliacao.tratamentos_realizados} />
                                    <DetailItem label="Data da Próxima Reavaliação" value={formatDate(avaliacao.data_reavalicao)} />
                                </dl>
                            </div>
                            {avaliacao.foto_avaliacao_postural && (
                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Foto da Avaliação Postural</h4>
                                    <img 
                                        src={avaliacao.foto_avaliacao_postural} 
                                        alt="Avaliação Postural" 
                                        className="rounded-lg border w-full max-w-md"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="p-6 text-center">Nenhum detalhe de avaliação encontrado.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DetalhesAvaliacaoView;
