import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getMeuPerfil } from '../services/alunosService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Componente para exibir cada linha de informação no perfil
const ProfileDetailRow = ({ label, value }) => (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-gray-200 dark:border-gray-700 py-5 items-center">
        <dt className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">{label}</dt>
        <dd className="text-gray-900 dark:text-white text-sm font-normal leading-normal text-right">{value || 'Não informado'}</dd>
    </div>
);

const MeuPerfilView = () => {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                setLoading(true);
                const response = await getMeuPerfil();
                // **CORREÇÃO APLICADA AQUI**
                // A resposta da API é plana, então usamos response.data diretamente
                setPerfil(response.data);
            } catch (err) {
                setError("Não foi possível carregar seu perfil. Tente novamente mais tarde.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPerfil();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Não informado';
        return format(new Date(`${dateString}T00:00:00`), 'dd/MM/yyyy');
    };

    const formatCpf = (cpf) => {
        if (!cpf) return 'Não informado';
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
                <Header title="Meu Perfil" showBackButton={true} />
                <main className="flex-grow p-4 flex items-center justify-center">
                    <p className="text-center">Carregando perfil...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
                <Header title="Meu Perfil" showBackButton={true} />
                <main className="flex-grow p-4 flex items-center justify-center">
                    <p className="text-center text-red-500">{error}</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Meu Perfil" showBackButton={true} />

            <main className="flex flex-col flex-grow p-4">
                {/* **CORREÇÃO APLICADA AQUI** - Verificação simplificada */}
                {perfil && (
                    <div className="bg-white dark:bg-gray-800/20 shadow-md rounded-xl p-6 flex flex-col items-center w-full max-w-md mx-auto">
                        {/* ProfileHeader */}
                        <div className="flex w-full flex-col gap-4 items-center mb-6">
                            <div className="relative">
                                <div 
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32" 
                                    // **CORREÇÃO APLICADA AQUI** - Acessando 'foto' diretamente
                                    style={{ backgroundImage: `url(${perfil.foto || 'https://via.placeholder.com/128'})` }}
                                    data-alt="Student's profile picture"
                                ></div>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                    {/* **CORREÇÃO APLICADA AQUI** - Acessando 'nome' diretamente */}
                                    {perfil.nome}
                                </p>
                                {/* **CORREÇÃO APLICADA AQUI** - Acessando 'is_active' diretamente */}
                                {perfil.is_active && (
                                    <div className="mt-2 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/50 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                                        Ativo
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DescriptionList */}
                        <div className="w-full">
                            <dl>
                                {/* **CORREÇÕES APLICADAS ABAIXO** - Acessando os campos diretamente */}
                                <ProfileDetailRow label="E-mail" value={perfil.email} />
                                <ProfileDetailRow label="CPF" value={formatCpf(perfil.cpf)} />
                                <ProfileDetailRow label="Nascimento" value={formatDate(perfil.dataNascimento)} />
                                <ProfileDetailRow label="Telefone" value={perfil.contato} />
                                <ProfileDetailRow label="Profissão" value={perfil.profissao || 'Não informado'} />
                            </dl>
                        </div>
                    </div>
                )}
            </main>

            {/* **CORREÇÃO APLICADA AQUI** - Rodapé removido */}
        </div>
    );
};

export default MeuPerfilView;
