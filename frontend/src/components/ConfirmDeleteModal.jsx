import React from 'react';
import Icon from './Icon';

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Ação",
  message = "Você tem certeza que deseja realizar esta ação? Esta operação não pode ser desfeita.",
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
  confirmButtonColor = "bg-red-600 hover:bg-red-700",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300"
      onClick={onClose} // Fecha o modal ao clicar fora
    >
      <div
        className="relative m-4 flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-card-light dark:bg-card-dark shadow-2xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal feche-o
      >
        <div className="flex flex-col items-center p-6 sm:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <Icon name="warning" className="text-4xl text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-text-light dark:text-text-dark tracking-tight text-[28px] font-bold leading-tight text-center pb-3">
            {title}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          <div className="flex w-full flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="truncate">{cancelButtonText}</span>
            </button>
            <button
              onClick={onConfirm}
              className={`flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 text-white text-base font-bold leading-normal tracking-[0.015em] ${confirmButtonColor} transition-colors`}
            >
              <span className="truncate">{confirmButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
