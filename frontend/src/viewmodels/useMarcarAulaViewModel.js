import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import studiosService from '../services/studiosService';
import { getModalidades } from '../services/modalidadesService';
import { getAulas } from '../services/aulasService';
import agendamentosService from '../services/agendamentosService';
import { format, parseISO, isSameDay, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função utilitária para extrair mensagens de erro da API de forma robusta
const extractErrorMessage = (err, defaultMessage) => {
  const apiErrorData = err.response?.data;
  if (!apiErrorData) {
    return defaultMessage;
  }

  if (apiErrorData.non_field_errors && Array.isArray(apiErrorData.non_field_errors)) {
    return apiErrorData.non_field_errors.join(' ');
  }

  if (apiErrorData.detail) {
    return Array.isArray(apiErrorData.detail) ? apiErrorData.detail.join(' ') : apiErrorData.detail;
  }

  // Tratamento para erros de campo (ex: {"aula": ["ID inválido"]})
  const fieldErrors = Object.values(apiErrorData).flat();
  if (fieldErrors.length > 0) {
    return fieldErrors.join(' ');
  }

  return defaultMessage;
};


const useMarcarAulaViewModel = () => {
  const { user, loading: authLoading } = useAuth();
  const [allStudios, setAllStudios] = useState([]);
  const [allModalidades, setAllModalidades] = useState([]);
  const [allAulas, setAllAulas] = useState([]); // Todas as aulas do sistema
  const [selectedStudioId, setSelectedStudioId] = useState('all'); // 'all' para todos os estúdios
  const [selectedModalityId, setSelectedModalityId] = useState('all'); // 'all' para todas as modalidades
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2.1.1 Buscar todos os estúdios
  const fetchAllStudios = useCallback(async () => {
    try {
      const response = await studiosService.getAllStudios();
      const studiosWithAllOption = [{ id: 'all', nome: 'Todos os Estúdios' }, ...response.data];
      setAllStudios(studiosWithAllOption);
    } catch (err) {
      console.error("Erro ao buscar estúdios:", err);
      setError('Não foi possível carregar os estúdios.');
    }
  }, []);

  // 2.1.2 Buscar todas as modalidades
  const fetchAllModalidades = useCallback(async () => {
    try {
      const response = await getModalidades();
      const modalidadesWithAllOption = [{ id: 'all', nome: 'Todas as Modalidades' }, ...response.data];
      setAllModalidades(modalidadesWithAllOption);
    } catch (err) {
      console.error("Erro ao buscar modalidades:", err);
      setError('Não foi possível carregar as modalidades.');
    }
  }, []);

  // 2.1.3 Buscar todas as aulas disponíveis
  const fetchAllAulas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAulas();
      setAllAulas(response.data);
    } catch (err) {
      console.error("Erro ao buscar aulas:", err);
      setError('Não foi possível carregar as aulas disponíveis.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (!authLoading) {
      fetchAllStudios();
      fetchAllModalidades();
      fetchAllAulas();
    }
  }, [authLoading, fetchAllStudios, fetchAllModalidades, fetchAllAulas]);

  // Nomes para exibição
  const currentStudioName = useMemo(() => {
    return allStudios.find(s => s.id === selectedStudioId)?.nome || 'Todos os Estúdios';
  }, [allStudios, selectedStudioId]);

  const currentModalityName = useMemo(() => {
    return allModalidades.find(m => m.id === selectedModalityId)?.nome || 'Todas as Modalidades';
  }, [allModalidades, selectedModalityId]);

  // 2.1.4 Lógica de Filtragem de Aulas
  const filteredClasses = useMemo(() => {
    return allAulas.filter(aula => {
      const isSameDate = isSameDay(parseISO(aula.data_hora_inicio), selectedDate);
      if (!isSameDate) return false;

      const isStudioMatch = selectedStudioId === 'all' || aula.studio?.id === parseInt(selectedStudioId);
      if (!isStudioMatch) return false;

      const isModalityMatch = selectedModalityId === 'all' || aula.modalidade?.id === parseInt(selectedModalityId);
      if (!isModalityMatch) return false;

      const isFutureClass = parseISO(aula.data_hora_inicio) > new Date();
      if (!isFutureClass) return false;

      return true;
    });
  }, [allAulas, selectedDate, selectedStudioId, selectedModalityId]);

  // 2.1.5 Funções de Navegação Semanal
  const getWeekDays = useCallback(() => {
    const start = startOfWeek(selectedDate, { locale: ptBR });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [selectedDate]);

  const formattedDate = (date) => format(date, 'dd/MM', { locale: ptBR });
  const formattedDayOfWeek = (date) => format(date, 'EEE', { locale: ptBR });

  const setPreviousWeek = useCallback(() => {
    const newDate = addDays(selectedDate, -7);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const setNextWeek = useCallback(() => {
    const newDate = addDays(selectedDate, 7);
    setSelectedDate(newDate);
  }, [selectedDate]);

  // 2.1.6 Indicador de Dias com Aulas Disponíveis
  const daysWithAvailableClasses = useMemo(() => {
    const dateSet = new Set();
    allAulas.forEach(aula => {
      const isStudioMatch = selectedStudioId === 'all' || aula.studio?.id === parseInt(selectedStudioId);
      const isModalityMatch = selectedModalityId === 'all' || aula.modalidade?.id === parseInt(selectedModalityId);
      const hasVacancies = aula.vagas_preenchidas < aula.capacidade_maxima;
      const isFutureClass = parseISO(aula.data_hora_inicio) > new Date();

      if (isStudioMatch && isModalityMatch && hasVacancies && isFutureClass) {
        const date = format(parseISO(aula.data_hora_inicio), 'yyyy-MM-dd');
        dateSet.add(date);
      }
    });
    return dateSet;
  }, [allAulas, selectedStudioId, selectedModalityId]);

  const marcarAula = useCallback(async (aulaId) => {
    try {
      const payload = { aula: aulaId, entrar_lista_espera: false };
      const response = await agendamentosService.marcarAula(payload);
      fetchAllAulas();
      return { success: true, data: response };
    } catch (err) {
      console.error("Erro ao marcar aula:", err);
      const errorMessage = extractErrorMessage(err, "Não foi possível marcar a aula.");
      return { success: false, error: errorMessage };
    }
  }, [fetchAllAulas]);

  const entrarListaEspera = useCallback(async (aulaId) => {
    try {
      const payload = { aula: aulaId, entrar_lista_espera: true };
      const response = await agendamentosService.marcarAula(payload);
      fetchAllAulas();
      // Retorna a mensagem específica da API para a lista de espera
      return { success: true, data: response, message: response.detail };
    } catch (err) {
      console.error("Erro ao entrar na lista de espera:", err);
      const errorMessage = extractErrorMessage(err, "Não foi possível entrar na lista de espera.");
      return { success: false, error: errorMessage };
    }
  }, [fetchAllAulas]);


  return {
    studios: allStudios,
    modalidades: allModalidades,
    filteredClasses,
    selectedStudioId,
    setSelectedStudioId,
    selectedModalityId,
    setSelectedModalityId,
    selectedDate,
    setSelectedDate,
    loading,
    error,
    getWeekDays,
    formattedDate,
    formattedDayOfWeek,
    setPreviousWeek,
    setNextWeek,
    daysWithAvailableClasses,
    currentStudioName,
    currentModalityName,
    marcarAula,
    entrarListaEspera,
  };
};

export default useMarcarAulaViewModel;
