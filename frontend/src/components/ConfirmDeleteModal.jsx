import React from 'react';
import Icon from './Icon';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName, itemType = 'item' }) => {
  if (!isOpen) {
    return null;
  }

  // Impedir que cliques dentro do modal o fechem
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose} // Fecha o modal se clicar fora
    >
      <div 
        className="relative m-4 flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-card-light dark:bg-card-dark shadow-2xl transform transition-all duration-300"
        onClick={handleModalContentClick}
      >
        <div className="flex flex-col items-center p-6 sm:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-4">
            <Icon name="warning" className="text-4xl text-red-500" />
          </div>
          
          <h2 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-bold leading-tight text-center pb-3">
            Excluir {itemType}?
          </h2>
          
          <p className="text-text-light/70 dark:text-text-dark/70 text-base font-normal leading-normal pb-6 text-center">
            Tem certeza que deseja excluir <strong className="font-bold text-text-light dark:text-text-dark">{itemName}</strong>? Esta ação não pode ser desfeita.
          </p>
          
          <div className="flex w-full flex-col-reverse sm:flex-row gap-3">
            <button 
              onClick={onClose} 
              className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-transparent text-text-light dark:text-text-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-500/10 transition-colors"
            >
              <span className="truncate">Cancelar</span>
            </button>
            <button 
              onClick={onConfirm}
              className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-red-600 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors"
            >
              <span className="truncate">Sim, Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
