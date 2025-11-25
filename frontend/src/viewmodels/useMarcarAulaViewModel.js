import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import studiosService from '../services/studiosService';
import { getModalidades } from '../services/modalidadesService';
import { getAulas } from '../services/aulasService';
import agendamentosService from '../services/agendamentosService';
import { format, parseISO, isSameDay, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    console.log("Chamando fetchAllAulas (para atualizar vagas)..."); // DEBUG: Ponto 5
    try {
      // A rota GET /api/agendamentos/aulas/ deve retornar todas as aulas
      const response = await getAulas(); // Assumindo que getAulas não tem filtros por padrão
      setAllAulas(response.data);
      console.log("Todas as aulas disponíveis após fetch:", response.data); // DEBUG: Ponto 5
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
      // Filtrar por data
      const isSameDate = isSameDay(parseISO(aula.data_hora_inicio), selectedDate);
      if (!isSameDate) return false;

      // Filtrar por estúdio
      const isStudioMatch = selectedStudioId === 'all' || aula.studio?.id === parseInt(selectedStudioId);
      if (!isStudioMatch) return false;

      // Filtrar por modalidade
      const isModalityMatch = selectedModalityId === 'all' || aula.modalidade?.id === parseInt(selectedModalityId);
      if (!isModalityMatch) return false;

      // Apenas aulas com vagas
      const hasVacancies = aula.vagas_preenchidas < aula.capacidade_maxima;
      if (!hasVacancies) return false;

      // Apenas aulas futuras
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
      const payload = { aula: aulaId };
      const response = await agendamentosService.marcarAula(payload);
      fetchAllAulas(); // Atualiza as vagas na tela de Marcar Aula
      return { success: true, data: response }; // Retorna o agendamento criado
    } catch (err) {
      console.error("Erro ao marcar aula:", err);
      // Ajuste para extrair a mensagem de erro corretamente (Ponto 2 da Fase 2)
      const apiErrorData = err.response?.data;
      let errorMessage = "Não foi possível marcar a aula.";
      if (apiErrorData) {
        if (apiErrorData.non_field_errors && Array.isArray(apiErrorData.non_field_errors)) {
          errorMessage = apiErrorData.non_field_errors[0];
        } else if (apiErrorData.detail) { // Para o caso de 'detail' ser string ou array
          errorMessage = Array.isArray(apiErrorData.detail) ? apiErrorData.detail[0] : apiErrorData.detail;
        }
      }
      return { success: false, error: errorMessage };
    }
  }, [fetchAllAulas]);

  const entrarListaEspera = useCallback(async (aulaId) => {
    try {
      const payload = { aula: aulaId, entrar_lista_espera: true };
      const response = await agendamentosService.marcarAula(payload);
      fetchAllAulas(); // Atualiza as vagas na tela de Marcar Aula
      return { success: true, data: response }; // Retorna o agendamento criado
    } catch (err) {
      console.error("Erro ao entrar na lista de espera:", err);
      // Ajuste para extrair a mensagem de erro corretamente (Ponto 2 da Fase 2)
      const apiErrorData = err.response?.data;
      let errorMessage = "Não foi possível entrar na lista de espera.";
      if (apiErrorData) {
        if (apiErrorData.non_field_errors && Array.isArray(apiErrorData.non_field_errors)) {
          errorMessage = apiErrorData.non_field_errors[0];
        } else if (apiErrorData.detail) {
          errorMessage = Array.isArray(apiErrorData.detail) ? apiErrorData.detail[0] : apiErrorData.detail;
        }
      }
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
