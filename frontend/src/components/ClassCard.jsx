import React from 'react';
import Icon from './Icon';
import { format, parseISO, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ClassCard = ({ aula, onMarcarAula, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 animate-pulse transition-colors duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  // Fallbacks para aula e suas propriedades
  const modalidadeNome = aula?.modalidade?.nome || 'Modalidade Indisponível';
  const studioNome = aula?.studio?.nome || 'Estúdio Indisponível';
  const studioEndereco = aula?.studio?.endereco;
  const instrutorPrincipal = aula?.instrutor_principal || 'Instrutor Indisponível';
  const dataHoraInicioStr = aula?.data_hora_inicio;
  const duracaoMinutos = aula?.duracao_minutos;
  const capacidadeMaxima = aula?.capacidade_maxima || 0;
  const vagasPreenchidas = aula?.vagas_preenchidas || 0;

  let formattedFullDate = 'Data Indisponível';
  let formattedTimeRange = 'Horário Indisponível';
  let isFull = false;

  if (dataHoraInicioStr && duracaoMinutos !== undefined && duracaoMinutos !== null) {
    try {
      const parsedStartDate = parseISO(dataHoraInicioStr);
      const endDate = addMinutes(parsedStartDate, duracaoMinutos);

      formattedFullDate = format(parsedStartDate, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
      const startTime = format(parsedStartDate, 'HH:mm');
      const endTime = format(endDate, 'HH:mm');
      formattedTimeRange = `${startTime} - ${endTime}`;
    } catch (e) {
      console.error("Erro ao formatar data/hora da aula:", e);
    }
  }

  const vagasDisponiveis = capacidadeMaxima - vagasPreenchidas;
  isFull = vagasDisponiveis <= 0;

  const getVagasClasses = (isFull) => {
    if (isFull) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    } else {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 transform hover:scale-[1.02] transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          {/* Modalidade (Título principal com ícone) */}
          <h3 className="flex items-center text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
            <Icon name="fitness_center" className="text-primary mr-2 text-2xl" />
            {modalidadeNome}
          </h3>
          {/* Estúdio (Subtítulo com ícone) */}
          <p className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            <Icon name="location_on" className="text-gray-500 dark:text-gray-400 mr-2 text-xl" />
            {studioNome}
          </p>
          {/* Endereço do Estúdio (Detalhe, indentado e com fonte menor) */}
          {studioEndereco && (
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              {studioEndereco}
            </p>
          )}
          {/* Data e Hora */}
          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mt-2">
            {formattedFullDate} | {formattedTimeRange}
          </p>
        </div>
        {/* Vagas Disponíveis (Badge) */}
        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getVagasClasses(isFull)}`}>
          {isFull ? 'LOTADO' : `${vagasDisponiveis}/${capacidadeMaxima} VAGAS`}
        </span>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Instrutor (Legível) */}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Instrutor: {instrutorPrincipal}
        </p>
        {/* Botão Marcar Aula / Entrar na Lista de Espera */}
        {aula?.id && (
          <button
            onClick={() => onMarcarAula(aula.id, isFull)}
            className={`flex items-center justify-center transition-colors duration-200
                       px-4 py-2 rounded-lg text-base font-semibold w-full sm:w-auto
                       ${isFull ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
          >
            <Icon name={isFull ? "group_add" : "event_available"} style={{ fontSize: '20px' }} className="mr-2" />
            {isFull ? 'Entrar na Lista de Espera' : 'Marcar Aula'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
