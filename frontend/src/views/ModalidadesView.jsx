import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useModalidadesViewModel from '../viewmodels/useModalidadesViewModel';

// Modal Component
const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-slate-800">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{title}</h2>
                <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>
            <div className="mt-4">{children}</div>
        </div>
    </div>
);

const ModalidadesView = () => {
    const navigate = useNavigate();
    const { modalidades, loading, error, addModalidade, editModalidade, removeModalidade } = useModalidadesViewModel();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // 'add', 'edit', 'delete'
    const [currentModalidade, setCurrentModalidade] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const openModal = (type, modalidade = null) => {
        setModalType(type);
        setCurrentModalidade(modalidade);
        setInputValue(modalidade ? modalidade.nome : '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalType(null);
        setCurrentModalidade(null);
        setInputValue('');
    };

    const handleConfirm = async () => {
        if (modalType === 'add') {
            await addModalidade(inputValue);
        } else if (modalType === 'edit') {
            await editModalidade(currentModalidade.id, inputValue);
        } else if (modalType === 'delete') {
            await removeModalidade(currentModalidade.id);
        }
        closeModal();
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-3">
                    <div className="h-[68px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-[68px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-[68px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                    <p className="text-red-500">{error}</p>
                </div>
            );
        }

        if (modalidades.length === 0) {
            return (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                    <p className="text-slate-500 dark:text-slate-400">Nenhuma modalidade cadastrada.</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {modalidades.map(m => (
                    <div key={m.id} className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800/50">
                        <p className="truncate text-base font-medium text-slate-900 dark:text-slate-50">{m.nome}</p>
                        <div className="flex shrink-0 items-center gap-2">
                            <button onClick={() => openModal('edit', m)} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">
                                <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button onClick={() => openModal('delete', m)} className="flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderModalContent = () => {
        if (!isModalOpen) return null;

        switch (modalType) {
            case 'add':
            case 'edit':
                return (
                    <Modal title={modalType === 'add' ? 'Adicionar Modalidade' : 'Editar Modalidade'} onClose={closeModal}>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nome da modalidade"
                                className="w-full rounded-lg border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                            />
                            <div className="flex justify-end gap-3">
                                <button onClick={closeModal} className="rounded-lg px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button>
                                <button onClick={handleConfirm} className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">Salvar</button>
                            </div>
                        </div>
                    </Modal>
                );
            case 'delete':
                return (
                    <Modal title="Confirmar Exclusão" onClose={closeModal}>
                        <div className="space-y-4">
                            <p>Tem certeza que deseja excluir a modalidade "{currentModalidade?.nome}"?</p>
                            <div className="flex justify-end gap-3">
                                <button onClick={closeModal} className="rounded-lg px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button>
                                <button onClick={handleConfirm} className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">Excluir</button>
                            </div>
                        </div>
                    </Modal>
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between bg-background-light/80 px-4 backdrop-blur-sm dark:bg-background-dark/80">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center text-slate-800 dark:text-slate-200">
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                </div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">Modalidades de Aula</h1>
                <div className="h-10 w-10"></div>
            </header>

            <main className="flex-1 px-4 pb-28 pt-4">
                <div className="mx-auto max-w-2xl space-y-3">
                    {renderContent()}
                </div>
            </main>

            <div className="pointer-events-none fixed bottom-0 right-0 z-20 p-6">
                <button onClick={() => openModal('add')} className="pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                    <span className="material-symbols-outlined text-3xl">add</span>
                </button>
            </div>

            {renderModalContent()}
        </div>
    );
};

export default ModalidadesView;