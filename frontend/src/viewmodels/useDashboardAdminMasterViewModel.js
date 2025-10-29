import { useState } from 'react';

const useDashboardAdminMasterViewModel = () => {
    // In the future, you can add logic here to fetch data for the dashboard
    const [stats, setStats] = useState({
        newStudents: 2,
        updatedProfiles: 1,
        cancelledClasses: 1,
        paymentsReceived: 1,
    });

    return {
        stats,
    };
};

export default useDashboardAdminMasterViewModel;
