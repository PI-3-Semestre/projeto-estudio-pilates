import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import usePlanosViewModel from '../viewmodels/usePlanosViewModel';
import Header from '../components/Header';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const PlanosView = () => {
    const { planos, loading, removePlano } = usePlanosViewModel();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openModal = (plano) => {
        setItemToDelete(plano);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            removePlano(itemToDelete.id);
        }
        closeModal();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const SkeletonLoader = () => (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            ))}
        </div>
    );

    return (
        <div className="flex h-screen flex-col">
            <Header title="Gestão de Planos" showBackButton={true} />
            
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">Planos de Assinatura</h2>
                        <Link to="/planos/novo" className="flex items-center gap-2 rounded-lg bg-action-primary px-4 py-2 text-white transition-colors hover:bg-action-primary-dark">
                            <span className="material-symbols-outlined">add</span>
                            Criar Novo Plano
                        </Link>
                    </div>

                    {loading ? (
                        <SkeletonLoader />
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-card-dark">
                            <ul>
                                {planos.map((plano, index) => (
                                    <li key={plano.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 ${index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                                        <div className="mb-4 md:mb-0">
                                            <p className="font-semibold text-text-light dark:text-text-dark">{plano.nome}</p>
                                            <p className="text-sm text-text-subtle-light dark:text-text-subtle-dark">
                                                {plano.duracao_dias} dias - {plano.creditos_semanais}x por semana
                                            </p>
                                            <p className="font-bold text-lg text-action-primary">{formatPrice(plano.preco)}</p>
                                        </div>
                                        <div className="flex items-center gap-4 self-end md:self-center">
                                            <Link to={`/planos/editar/${plano.id}`} className="flex items-center gap-1 text-action-primary hover:underline">
                                                <span className="material-symbols-outlined text-lg">edit</span> Editar
                                            </Link>
                                            <button onClick={() => openModal(plano)} className="flex items-center gap-1 text-red-500 hover:underline">
                                                <span className="material-symbols-outlined text-lg">delete</span> Excluir
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o plano "${itemToDelete?.nome}"? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};

export default PlanosView;
