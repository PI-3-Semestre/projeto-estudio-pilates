import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHorariosViewModel } from '../viewmodels/useHorariosViewModel';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import Header from '../components/Header';

const HorariosView = () => {
    const { 
        filteredHorarios,
        studios,
        studioFilter,
        setStudioFilter,
        loading, 
        handleDeleteHorario, 
        getDiaSemanaText
    } = useHorariosViewModel();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openModal = (item) => {
        setItemToDelete(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            handleDeleteHorario(itemToDelete.id);
        }
        closeModal();
    };

    return (
        <div className="flex h-screen flex-col">
            <Header title="Horários de Funcionamento" showBackButton={true} />
            
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
                {loading && <p>Carregando...</p>}
                
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">Horários de Trabalho</h2>
                        <Link to="/horarios/novo" className="flex items-center gap-2 rounded-lg bg-action-primary px-4 py-2 text-white transition-colors hover:bg-action-primary-dark">
                            <span className="material-symbols-outlined">add</span>
                            Novo Horário
                        </Link>
                    </div>

                    <div className="mb-4 max-w-xs">
                        <label htmlFor="studioFilter" className="block text-sm font-medium text-text-light dark:text-text-dark">Filtrar por Studio</label>
                        <select
                            id="studioFilter"
                            value={studioFilter}
                            onChange={(e) => setStudioFilter(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-background-dark dark:border-gray-600 dark:text-white sm:text-sm"
                        >
                            <option value="all">Todos os Estúdios</option>
                            {studios.map(studio => (
                                <option key={studio.id} value={studio.id}>{studio.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-card-dark">
                        <ul>
                            {filteredHorarios.map((horario, index) => (
                                <li key={horario.id} className={`flex items-center justify-between p-4 ${index > 0 ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
                                    <div>
                                        <p className="font-semibold text-text-light dark:text-text-dark">{getDiaSemanaText(horario.dia_semana)}</p>
                                        <p className="text-sm text-text-subtle-light dark:text-text-subtle-dark">{horario.hora_inicio} - {horario.hora_fim}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Link to={`/horarios/editar/${horario.id}`} className="text-action-primary hover:underline">Editar</Link>
                                        <button onClick={() => openModal(horario)} className="text-red-500 hover:underline">Excluir</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>

            <ConfirmDeleteModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message={`Tem certeza de que deseja excluir este horário? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
};

export default HorariosView;
