import api from './api';

const dashboardService = {
    getAdminMasterDashboardData: () => {
        return api.get('/dashboard/');
    },
};

export default dashboardService;
