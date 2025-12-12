import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService'; // Nova importação
import { useToast } from '../context/ToastContext';

const getErrorMessage = (err, defaultMessage) => {
    if (err.response && err.response.data) {
        if (typeof err.response.data === 'object' && !err.response.data.detail) {
            const errorFields = Object.keys(err.response.data);
            if (errorFields.length > 0) {
                return errorFields.map(field => `${field}: ${err.response.data[field]}`).join('; ');
            }
        }
        return err.response.data.detail || JSON.stringify(err.response.data);
    }
    return err.message || defaultMessage;
};

const useGerenciamentoFinanceiroViewModel = () => {
    const [dashboardData, setDashboardData] = useState(null); // Novo estado
    const [loadingDashboard, setLoadingDashboard] = useState(true); // Novo estado
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoadingDashboard(true);
            const response = await dashboardService.getAdminMasterDashboardData();
            setDashboardData(response.data);
        } catch (err) {
            setError(err);
            const message = getErrorMessage(err, 'Erro ao buscar dados do dashboard.');
            showToast(message, { type: 'error' });
        } finally {
            setLoadingDashboard(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        dashboardData, // Novo retorno
        loadingDashboard, // Novo retorno
        error,
    };
};

export default useGerenciamentoFinanceiroViewModel;
