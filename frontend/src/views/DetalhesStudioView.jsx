import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import useDetalhesStudioViewModel from '../viewmodels/useDetalhesStudioViewModel';
import Icon from '../components/Icon';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const DetalhesStudioView = () => {
  const { id } = useParams();
  const { studio, loading, handleDelete } = useDetalhesStudioViewModel();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!studio) {
    return (
       <div className="flex items-center justify-center min-h-screen">
        <p>Studio não encontrado.</p>
      </div>
    );
  }

  const handleConfirmDelete = () => {
    handleDelete();
    setIsModalOpen(false);
  }

  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
        <Header />
        
        {/* Top App Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/studios" className="flex size-12 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Icon name="arrow_back" className="text-gray-800 dark:text-gray-200" />
          </Link>
          <h2 className="flex-1 text-center text-lg font-bold tracking-tight text-gray-800 dark:text-gray-200">
            Detalhes do Studio
          </h2>
          <button onClick={() => setIsModalOpen(true)} className="flex size-12 items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/20">
              <Icon name="delete" className="text-red-500" />
          </button>
        </div>

        {/* Main Content */}
        <main className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-center p-4">
          <div className="bg-white dark:bg-card-dark shadow-md rounded-xl p-6 md:p-8 flex flex-col gap-6">
            <h1 className="text-text-light dark:text-text-dark tracking-tight text-[32px] font-bold leading-tight text-left">
              {studio.nome}
            </h1>
            
            <div className="grid grid-cols-1">
              <div className="grid grid-cols-1 gap-1 border-t border-t-gray-200 dark:border-t-gray-700 py-5">
                <p className="text-placeholder-light dark:text-placeholder-dark text-sm font-normal leading-normal">Nome do Studio</p>
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">{studio.nome}</p>
              </div>
              <div className="grid grid-cols-1 gap-1 border-t border-t-gray-200 dark:border-t-gray-700 py-5">
                <p className="text-placeholder-light dark:text-placeholder-dark text-sm font-normal leading-normal">Endereço Completo</p>
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal whitespace-pre-line">{studio.endereco}</p>
              </div>
            </div>
            
            <div className="flex pt-4">
              <Link to={`/studios/${id}/editar`} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-primary text-text-dark text-base font-bold leading-normal tracking-wide transition-colors hover:bg-primary/90">
                <span className="truncate">Editar Studio</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <ConfirmDeleteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={studio?.nome}
        itemType="Studio"
      />
    </>
  );
};

export default DetalhesStudioView;
