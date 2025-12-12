import React from 'react';

const FilterBottomSheet = ({ isOpen, onClose, onClearFilters, children, title = "Filtros e Ordenação" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            ></div>

            {/* Content Sheet */}
            <div className={`relative w-full bg-white dark:bg-card-dark rounded-t-2xl shadow-lg p-4 transition-transform duration-300 ease-in-out ${isOpen ? 'transform-none' : 'translate-y-full'}`}>
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onClearFilters}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Limpar Filtros
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Filtros e Ordenação (Conteúdo) */}
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FilterBottomSheet;
