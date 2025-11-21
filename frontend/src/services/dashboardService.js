import api from './api';

const dashboardService = {
    getDashboardData: () => {
        return api.get('dashboard/');
    },
};

export default dashboardService;
