import { useState, useEffect } from 'react';
import studiosService from '../services/studiosService';

const useDashboardStudioViewModel = (studioId) => {
    const [data, setData] = useState({ studio: null, dashboard: null });
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
                
                const [studioResponse, dashboardResponse] = await Promise.all([
                    studiosService.getStudioById(studioId),
                    studiosService.getDashboardStudio(studioId)
                ]);

                setData({
                    studio: studioResponse.data,
                    dashboard: dashboardResponse.data
                });

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