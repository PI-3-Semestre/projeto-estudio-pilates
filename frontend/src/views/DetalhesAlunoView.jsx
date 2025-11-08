import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useDetalhesAlunoViewModel from '../viewmodels/useDetalhesAlunoViewModel';

const DetalhesAlunoView = () => {
    const navigate = useNavigate();
    const { cpf } = useParams();
    const { aluno, usuario, loading, error, formatarData } = useDetalhesAlunoViewModel(cpf);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Carregando...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen"><p>Erro ao carregar os dados do aluno: {error.message}</p></div>;
    }

    if (!aluno) {
        return null;
    }

    const DetailRow = ({ label, value, isStatus = false }) => (
        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className={`mt-1 text-sm sm:col-span-2 sm:mt-0 ${value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 italic'}`}>
                {isStatus ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${value ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                        {value ? 'Ativo' : 'Inativo'}
                    </span>
                ) : (value || 'Não informado')}
            </dd>
        </div>
    );

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <header className="flex items-center p-4 justify-between bg-background-light dark:bg-background-dark sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="flex size-10 shrink-0 items-center justify-center text-gray-700 dark:text-gray-300">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-1 text-center">Detalhes do Aluno</h1>
                <div className="size-10"></div>
            </header>

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 md:p-8">
                        <h2 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">{aluno.nome}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{usuario?.username || ''}</p>

                        {/* Dados de Acesso */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-[-0.015em]">Dados de Acesso</h3>
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <DetailRow label="E-mail" value={usuario?.email} />
                                    <DetailRow label="CPF" value={aluno.cpf} />
                                </dl>
                            </div>
                        </div>

                        {/* Dados Pessoais */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-[-0.015em]">Dados Pessoais</h3>
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <DetailRow label="Nome Completo" value={aluno.nome} />
                                    <DetailRow label="Data de Nascimento" value={formatarData(aluno.dataNascimento)} />
                                    <DetailRow label="Telefone / Contato" value={aluno.contato} />
                                    <DetailRow label="Profissão" value={aluno.profissao} />
                                    <DetailRow label="Status" value={aluno.is_active} isStatus={true} />
                                </dl>
                            </div>
                        </div>

                        {/* Unidades */}
                        {aluno.unidades && aluno.unidades.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-[-0.015em]">Unidades</h3>
                                <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {aluno.unidades.map((unidade, index) => (
                                            <DetailRow key={unidade.id || index} label={`Unidade ${index + 1}`} value={unidade.nome} />
                                        ))}
                                    </dl>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="space-y-3">
                            <button
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-xl">edit</span>
                                Editar Aluno
                            </button>
                            <button
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                type="button"
                            >
                                <span className="material-symbols-outlined text-xl">delete</span>
                                Deletar Aluno
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetalhesAlunoView;
