import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AvaliacaoForm from '../components/AvaliacaoForm';
import { searchAlunos } from '../services/alunosService';
import { createAvaliacaoGlobal } from '../services/avaliacoesService';
import { useDebounce } from '../hooks/useDebounce';

const AvaliacaoFormView = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const handleSearch = useCallback(async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await searchAlunos(term);
            setSearchResults(response.data);
        } catch (err) {
            console.error("Erro ao buscar alunos:", err);
        }
    }, []);

    useEffect(() => {
        handleSearch(debouncedSearchTerm);
    }, [debouncedSearchTerm, handleSearch]);

    const handleSelectAluno = (aluno) => {
        setSelectedAluno(aluno);
        setSearchTerm('');
        setSearchResults([]);
        setErrors({});
    };

    const handleSubmit = async (formData) => {
        if (!selectedAluno) {
            setErrors({ general: "Por favor, selecione um aluno antes de salvar." });
            return;
        }

        console.log('Objeto Aluno Selecionado:', selectedAluno);

        if (!selectedAluno.usuario_id) {
            setErrors({ general: "Erro: O objeto do aluno selecionado não contém um ID. Verifique a resposta da API de busca." });
            return;
        }

        const dataToSend = {
            ...formData,
            aluno: selectedAluno.usuario_id,
        };

        if (!dataToSend.foto_avaliacao_postural) {
            delete dataToSend.foto_avaliacao_postural;
        }
        if (!dataToSend.data_reavalicao) {
            delete dataToSend.data_reavalicao;
        }

        console.log('Payload Final Enviado:', dataToSend);

        setLoading(true);
        setErrors({});
        try {
            await createAvaliacaoGlobal(dataToSend);
            alert('Avaliação criada com sucesso!');
            navigate('/avaliacoes');
        } catch (err) {
            const backendErrors = err.response?.data;
            if (backendErrors) {
                setErrors(backendErrors);
            } else {
                setErrors({ general: 'Ocorreu um erro inesperado ao criar a avaliação.' });
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Criar Nova Avaliação" showBackButton={true} />

            <main className="flex-grow p-4">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h2 className="text-lg font-bold mb-4">1. Selecione o Aluno</h2>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Digite o nome ou CPF do aluno..."
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                            {searchResults.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                                    {searchResults.map(aluno => (
                                        <li
                                            key={aluno.id || aluno.cpf}
                                            onClick={() => handleSelectAluno(aluno)}
                                            className="p-3 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {aluno.nome} ({aluno.cpf})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {errors.aluno && <p className="text-red-500 text-sm mt-2">{errors.aluno[0]}</p>}
                        {selectedAluno && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg flex justify-between items-center">
                                <p className="font-semibold text-blue-800 dark:text-blue-200">
                                    Aluno Selecionado: {selectedAluno.nome}
                                </p>
                                <button onClick={() => setSelectedAluno(null)} className="text-red-500 hover:text-red-700">
                                    Limpar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 transition-opacity ${!selectedAluno ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <h2 className="text-lg font-bold mb-4">2. Preencha os Dados da Avaliação</h2>
                        <fieldset disabled={!selectedAluno}>
                            <AvaliacaoForm
                                onSubmit={handleSubmit}
                                onCancel={() => navigate('/avaliacoes')}
                                loading={loading}
                                errors={errors}
                            />
                        </fieldset>
                    </div>
                    {errors.general && <p className="text-red-500 text-center">{errors.general}</p>}
                    {errors.detail && <p className="text-red-500 text-center">{errors.detail}</p>}
                </div>
            </main>
        </div>
    );
};

export default AvaliacaoFormView;
