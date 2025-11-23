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

    return (
        <div className="bg-white dark:bg-card-dark shadow-md rounded-xl p-4 space-y-2 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Matrícula #{matricula.id}</h3>
                {/* Adicionar um status se a API fornecer */}
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

            <div className="flex justify-end space-x-2 border-t pt-2 mt-2 border-gray-200 dark:border-gray-700">
                {onRenovar && (
                    <button
                        onClick={() => onRenovar(matricula)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        Renovar
                    </button>
                )}
                <Link
                    to={`/matriculas/${matricula.id}`}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Detalhes
                </Link>
                <button
                    onClick={() => onEdit(matricula)}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete(matricula)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                    Excluir
                </button>
            </div>
        </div>
    );
};

export default MatriculaCard;
