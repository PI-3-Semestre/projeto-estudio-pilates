import React from 'react';
import Icon from './Icon';
import { format, parseISO, addMinutes, subHours } from 'date-fns'; // Importar subHours
import { ptBR } from 'date-fns/locale';

const AgendamentoCard = ({ agendamento, onCancel, isLoading }) => {
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

  const aula = agendamento?.aula;
  const statusPresenca = agendamento?.status_presenca;

  const modalidadeNome = aula?.modalidade?.nome || 'Modalidade Indisponível';
  const studioNome = aula?.studio?.nome || 'Estúdio Indisponível';
  const studioEndereco = aula?.studio?.endereco;
  const instrutorPrincipal = aula?.instrutor_principal || 'Instrutor Indisponível';
  const dataHoraInicioStr = aula?.data_hora_inicio;
  const duracaoMinutos = aula?.duracao_minutos;

  let formattedFullDate = 'Data Indisponível';
  let formattedTimeRange = 'Horário Indisponível';
  let isFutureClass = false;
  let parsedStartDate;
  let cancellationDeadline; // Novo: prazo limite para cancelamento

  if (dataHoraInicioStr && duracaoMinutos !== undefined && duracaoMinutos !== null) {
    try {
      parsedStartDate = parseISO(dataHoraInicioStr);
      const endDate = addMinutes(parsedStartDate, duracaoMinutos);

      isFutureClass = parsedStartDate > new Date();
      cancellationDeadline = subHours(parsedStartDate, 3); // Calcula o prazo limite

      formattedFullDate = format(parsedStartDate, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
      const startTime = format(parsedStartDate, 'HH:mm');
      const endTime = format(endDate, 'HH:mm');
      formattedTimeRange = `${startTime} - ${endTime}`;
    } catch (e) {
      console.error("Erro ao formatar data/hora do agendamento:", e);
    }
  }

  let displayStatus = 'desconhecido';
  if (isFutureClass) {
    if (!statusPresenca || statusPresenca === '') {
      displayStatus = 'confirmado';
    } else if (statusPresenca === 'CANCELADO') {
      displayStatus = 'cancelado';
    } else {
      displayStatus = 'confirmado';
    }
  } else {
    if (statusPresenca === 'PRESENTE') {
      displayStatus = 'concluido';
    } else if (statusPresenca === 'FALTOU') {
      displayStatus = 'faltou';
    } else {
      displayStatus = 'concluido';
    }
  }

  const getStatusClasses = (status) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'concluido':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'faltou':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Condição para exibir o botão de cancelar:
  // 1. O status de exibição é 'confirmado'
  // 2. A aula é futura
  // 3. A hora atual é ANTES do prazo limite de cancelamento (3 horas antes do início da aula)
  const canCancel = displayStatus === 'confirmado' && isFutureClass && new Date() < cancellationDeadline;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 transform hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="flex items-center text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
            <Icon name="fitness_center" className="text-primary mr-2 text-2xl" />
            {modalidadeNome}
          </h3>
          <p className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-0.5">
            <Icon name="location_on" className="text-gray-500 dark:text-gray-400 mr-2 text-xl" />
            {studioNome}
          </p>
          {studioEndereco && (
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              {studioEndereco}
            </p>
          )}
          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mt-2">
            {formattedFullDate} | {formattedTimeRange}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusClasses(displayStatus)}`}>
          {displayStatus.toUpperCase()}
        </span>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Instrutor: {instrutorPrincipal}
        </p>
        {canCancel && agendamento?.id && (
          <button
            onClick={() => onCancel(agendamento.id)}
            className="flex items-center justify-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-200
                       px-4 py-2 rounded-lg border border-red-300 dark:border-red-600 text-base font-semibold w-full sm:w-auto"
          >
            <Icon name="cancel" style={{ fontSize: '20px' }} className="mr-2" />
            Cancelar Agendamento
          </button>
        )}
      </div>
    </div>
  );
};

export default AgendamentoCard;
