import { useState, useEffect, useCallback, useMemo } from 'react';
import notificationsService from '../services/notificationsService';
import { useToast } from '../context/ToastContext';

const useNotificationsViewModel = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notificationsService.getNotifications();
            setNotifications(response.data);
        } catch (err) {
            showToast('Erro ao buscar notificações.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = useCallback(async (notificationId) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        try {
            await notificationsService.markAsRead(notificationId);
        } catch (err) {
            showToast('Erro ao marcar notificação como lida.', { type: 'error' });
            // Revert state on error if needed
            fetchNotifications();
        }
    }, [showToast, fetchNotifications]);

    const handleMarkAllAsRead = useCallback(async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        try {
            await notificationsService.markAllAsRead();
        } catch (err) {
            showToast('Erro ao marcar todas as notificações como lidas.', { type: 'error' });
            // Revert state on error if needed
            fetchNotifications();
        }
    }, [showToast, fetchNotifications]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.is_read).length;
    }, [notifications]);

    return {
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        handleMarkAsRead,
        handleMarkAllAsRead,
    };
};

export default useNotificationsViewModel;
