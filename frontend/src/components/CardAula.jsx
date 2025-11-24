import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CardAula = ({ aula }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/aulas/${aula.id}`);
    };

    const dataHoraInicio = parseISO(aula.data_hora_inicio);
    const dataFormatada = format(dataHoraInicio, "dd 'de' MMMM", { locale: ptBR });
    const horaFormatada = format(dataHoraInicio, "HH:mm");

    const vagasDisponiveis = aula.capacidade_maxima - aula.vagas_preenchidas;
    const isLotada = vagasDisponiveis <= 0;

    return (
        <div 
            onClick={handleCardClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-primary dark:text-primary-dark">{aula.modalidade.nome}</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{`${dataFormatada} - ${horaFormatada}`}</p>
                    </div>
                    <div 
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isLotada 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                    >
                        {isLotada ? 'Lotado' : `${aula.vagas_preenchidas}/${aula.capacidade_maxima}`}
                    </div>
                </div>
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center">
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 mr-2">person</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{aula.instrutor_principal.nome_completo}</p>
                    </div>
                    <div className="flex items-center mt-2">
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 mr-2">apartment</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{aula.studio.nome}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardAula;