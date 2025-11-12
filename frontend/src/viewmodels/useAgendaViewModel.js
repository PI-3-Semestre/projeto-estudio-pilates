import { useState, useEffect, useCallback } from 'react';
import { getAulas } from '../services/aulasService';
import { getStudios } from '../services/studiosService';
import { format, parseISO, isSameDay, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const useAgendaViewModel = () => {
    const [aulas, setAulas] = useState([]);
    const [studios, setStudios] = useState([]);
    const [selectedStudioId, setSelectedStudioId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudios = useCallback(async () => {
        try {
            const response = await getStudios();
            setStudios(response.data);
            if (response.data.length > 0) {
                setSelectedStudioId(response.data[0].id); // Select the first studio by default
            }
        } catch (err) {
            setError('Não foi possível carregar os estúdios.');
            console.error('Erro ao buscar estúdios:', err);
        }
    }, []);

    const fetchAulas = useCallback(async (studioId) => {
        if (!studioId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAulas(studioId);
            setAulas(response.data);
        } catch (err) {
            setError('Não foi possível carregar as aulas.');
            console.error('Erro ao buscar aulas:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudios();
    }, [fetchStudios]);

    useEffect(() => {
        if (selectedStudioId) {
            fetchAulas(selectedStudioId);
        }
    }, [selectedStudioId, fetchAulas]);

    const filteredAulasByDate = aulas.filter(aula =>
        isSameDay(parseISO(aula.data_hora_inicio), selectedDate)
    );

    const getWeekDays = useCallback(() => {
        const start = startOfWeek(selectedDate, { locale: ptBR });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [selectedDate]);

    const formattedDate = (date) => format(date, 'dd/MM', { locale: ptBR });
    const formattedDayOfWeek = (date) => format(date, 'EEE', { locale: ptBR });

    return {
        aulas: filteredAulasByDate,
        studios,
        selectedStudioId,
        setSelectedStudioId,
        selectedDate,
        setSelectedDate,
        loading,
        error,
        getWeekDays,
        formattedDate,
        formattedDayOfWeek,
        currentStudioName: studios.find(s => s.id === selectedStudioId)?.nome || 'Carregando...',
    };
};

export default useAgendaViewModel;