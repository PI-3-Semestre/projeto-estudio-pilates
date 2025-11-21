import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const useDashboardStudioViewModel = () => {
    const { studioId } = useParams(); // Get studioId from URL
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        if (!studioId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await studiosService.getDashboardStudio(studioId);
            setDashboardData(response.data);
        } catch (err) {
            setError(err);
            showToast('Erro ao carregar os dados do dashboard do estúdio.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [studioId, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        dashboardData,
        loading,
        error,
    };
};

export default useDashboardStudioViewModel;
