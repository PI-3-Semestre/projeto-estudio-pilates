import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';
import { useToast } from '../context/ToastContext';

const useDashboardAdminMasterViewModel = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await dashboardService.getDashboardData();
            setDashboardData(response.data);
        } catch (err) {
            setError(err);
            showToast('Erro ao carregar os dados do dashboard.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        dashboardData,
        loading,
        error,
    };
};

export default useDashboardAdminMasterViewModel;
