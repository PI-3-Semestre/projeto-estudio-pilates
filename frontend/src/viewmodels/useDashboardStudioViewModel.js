import { useState, useEffect } from 'react';
import studiosService from '../services/studiosService';

const useDashboardStudioViewModel = (studioId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!studioId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await studiosService.getDashboardStudio(studioId);
                setData(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [studioId]);

    return { data, loading, error };
};

export default useDashboardStudioViewModel;