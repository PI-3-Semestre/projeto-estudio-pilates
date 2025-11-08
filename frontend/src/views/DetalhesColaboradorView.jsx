import React from 'react';
import { Link } from 'react-router-dom';
import useDetalhesColaboradorViewModel from '../viewmodels/useDetalhesColaboradorViewModel';
import Header from '../components/Header';

const DetalhesColaboradorView = () => {
    const { colaborador, loading, error } = useDetalhesColaboradorViewModel();

    if (loading) {
        return <p>Carregando detalhes do colaborador...</p>;
    }

    if (error) {
        return <p className="text-red-500">Erro ao carregar detalhes do colaborador.</p>;
    }

    if (!colaborador) {
        return <p>Colaborador não encontrado.</p>;
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col group/design-root">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 md:p-8">
                        <h2 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">{colaborador.nome_completo}</h2>
                        {colaborador.usuario && <p className="text-gray-500 dark:text-gray-400 mt-1">{colaborador.usuario.username}</p>}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-[-0.015em]">Dados de Acesso</h3>
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {colaborador.usuario && <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{colaborador.usuario.email}</dd>
                                    </div>}
                                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CPF</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{colaborador.usuario.cpf}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-[-0.015em]">Dados Pessoais e Profissionais</h3>
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                                <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome Completo</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{colaborador.nome_completo}</dd>
                                    </div>
                                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Registro Profissional</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{colaborador.registro_profissional}</dd>
                                    </div>
                                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Nascimento</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{colaborador.data_nascimento}</dd>
                                    </div>
                                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone / Contato</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{colaborador.telefone}</dd>
                                    </div>
                                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Admissão</dt>
                                        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{colaborador.data_admissao}</dd>
                                    </div>
                                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Demissão</dt>
                                                                                <dd className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic sm:col-span-2 sm:mt-0">{colaborador.data_demissao || 'Não informado'}</dd>
                                                                            </div>
                                                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center">
                                                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                                                                                                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                                                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colaborador.status === 'ATIVO' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>{colaborador.status}</span>
                                                                                                                        </dd>
                                                                                                                    </div>
                                                                                                                    {colaborador.usuario && colaborador.usuario.groups && <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                                                                                                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Perfis de Acesso</dt>
                                                                                                                        <dd className="mt-2 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                                                                                                                            <ul className="space-y-2">
                                                                                                                                {colaborador.usuario.groups.map(group => (
                                                                                                                                    <li key={group.id} className="flex items-center gap-2">
                                                                                                                                        <span className="material-symbols-outlined text-primary text-xl">check_box</span>
                                                                                                                                        <span>{group.name}</span>
                                                                                                                                    </li>
                                                                                                                                ))}
                                                                                                                            </ul>
                                                                                                                        </dd>
                                                                                                                    </div>}
                                                                                                                </dl>
                                                                                                            </div>
                                                                                                        </div>                                                                {colaborador.endereco && <div className="mt-8">
                                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-[-0.015em]">Endereço</h3>
                                                                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
                                                                        <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CEP</dt>
                                                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{colaborador.endereco.cep}</dd>
                                                                            </div>
                                                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Logradouro</dt>
                                                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{`${colaborador.endereco.logradouro}, Nº ${colaborador.endereco.numero}, ${colaborador.endereco.complemento}`}</dd>
                                                                            </div>
                                                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bairro / Cidade / UF</dt>
                                                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{`${colaborador.endereco.bairro}, ${colaborador.endereco.cidade}, ${colaborador.endereco.uf}`}</dd>
                                                                            </div>
                                                                        </dl>
                                                                    </div>
                                                                </div>}
                                                                {colaborador.vinculos_studio && <div className="mt-8">
                                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-[-0.015em]">Vínculos com Studios</h3>
                                                                    <div className="mt-4 space-y-4">
                                                                        {colaborador.vinculos_studio.map(vinculo => (
                                                                            <div key={vinculo.studio_id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                                                                <h4 className="font-semibold text-gray-900 dark:text-white">{vinculo.studio_nome}</h4>
                                                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">Permissões nesta Unidade</p>
                                                                                <ul className="mt-2 space-y-2">
                                                                                    {vinculo.permissoes && vinculo.permissoes.map(permissao => (
                                                                                        <li key={permissao} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                                                                                            <span className="material-symbols-outlined text-primary text-base">check_box</span>
                                                                                            <span>{permissao}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>}
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                                                                <div className="space-y-3">
                                                                    <Link to={`/colaboradores/${colaborador.usuario.cpf}/editar`} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                                                                        <span className="material-symbols-outlined text-xl">edit</span>
                                                                        Editar Colaborador
                                                                    </Link>
                                                                    <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900" type="button">
                                                                        <span className="material-symbols-outlined text-xl">delete</span>
                                                                        Deletar Colaborador
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </main>
                                                </div>
    );
};

export default DetalhesColaboradorView;