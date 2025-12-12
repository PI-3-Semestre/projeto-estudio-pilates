import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationItem from './NotificationItem';

const NotificationsPanel = ({ notifications, loading, onMarkAsRead, onMarkAllAsRead, onClose }) => {
    const navigate = useNavigate();

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }

        let path = '/dashboard'; // Default path
        switch (notification.content_type) {
            case 'pagamento':
                path = `/pagamentos/${notification.object_id}`;
                break;
            case 'aula':
                path = `/aulas/${notification.object_id}`;
                break;
            // Add other content types here
        }
        navigate(path);
        onClose(); // Close panel after navigation
    };

    const SkeletonLoader = () => (
        <div className="space-y-2 p-2">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            ))}
        </div>
    );

    return (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-sm rounded-lg bg-white dark:bg-card-dark shadow-lg border border-border-light dark:border-border-dark overflow-hidden z-50">
            <div className="flex justify-between items-center p-4 border-b dark:border-border-dark">
                <h3 className="font-bold text-text-light dark:text-text-dark">Notificações</h3>
                <button 
                    onClick={onMarkAllAsRead} 
                    className="text-sm text-action-primary hover:underline disabled:opacity-50"
                    disabled={!notifications || notifications.every(n => n.is_read)}
                >
                    Marcar todas como lidas
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <SkeletonLoader />
                ) : notifications && notifications.length > 0 ? (
                    notifications.map(n => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onClick={() => handleNotificationClick(n)}
                        />
                    ))
                ) : (
                    <p className="p-4 text-center text-sm text-text-subtle-light dark:text-text-subtle-dark">
                        Nenhuma notificação nova.
                    </p>
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
