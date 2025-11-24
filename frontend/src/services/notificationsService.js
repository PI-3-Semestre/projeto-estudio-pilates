import api from './api';

const notificationsService = {
    getNotifications: () => {
        return api.get('notifications/');
    },

    markAsRead: (notificationId) => {
        return api.post(`notifications/${notificationId}/mark-as-read/`);
    },

    markAllAsRead: () => {
        return api.post('notifications/mark-all-as-read/');
    },
};

export default notificationsService;
