import React from 'react';
import { Link } from 'react-router-dom';

const MatriculaCard = ({ matricula, onDelete, onEdit, onRenovar, allStudios }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStudioName = (studioData) => {
        if (!studioData) return 'N/A';
        if (typeof studioData === 'object' && studioData.nome) {
            return studioData.nome;
        }
        if (typeof studioData === 'number' && allStudios) {
            const studio = allStudios.find(s => s.id === studioData);
            return studio ? studio.nome : `ID: ${studioData}`;
        }
        return `ID: ${studioData}`;
    };

    const handleActionClick = (e, action) => {
        e.stopPropagation(); // Impede a navegação do Link pai
        e.preventDefault(); // Impede o comportamento padrão do link
        action(matricula);
    };

    return (
        <Link to={`/matriculas/${matricula.id}`} className="relative block bg-white dark:bg-card-dark shadow-md rounded-xl p-4 space-y-2 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
            {/* Ícones de Ação */}
            <div className="absolute top-2 right-2 flex space-x-1 bg-white/50 dark:bg-black/50 backdrop-blur-sm p-1 rounded-full">
                {onRenovar && (
                    <button
                        onClick={(e) => handleActionClick(e, onRenovar)}
                        className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-800 rounded-full"
                        title="Renovar"
                    >
                        <span className="material-symbols-outlined text-lg">autorenew</span>
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={(e) => handleActionClick(e, onEdit)}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded-full"
                        title="Editar"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => handleActionClick(e, onDelete)}
                        className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded-full"
                        title="Excluir"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                )}
            </div>

            <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Matrícula #{matricula.id}</h3>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Aluno:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{matricula.aluno?.nome || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Plano:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{matricula.plano?.nome || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Início:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(matricula.data_inicio)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Fim:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(matricula.data_fim)}</p>
                </div>
                <div>
                    <p className="text-gray-500 dark:text-gray-400">Estúdio:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{getStudioName(matricula.studio)}</p>
                </div>
            </div>
        </Link>
    );
};

export default MatriculaCard;
