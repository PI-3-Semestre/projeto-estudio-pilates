import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationItem = ({ notification, onClick }) => {
    const { level, is_read, message, created_at } = notification;

    const levelStyles = {
        INFO: {
            icon: 'info',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-500',
        },
        SUCCESS: {
            icon: 'check_circle',
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-500',
        },
        WARNING: {
            icon: 'warning',
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-500',
        },
        ERROR: {
            icon: 'error',
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-500',
        },
    };

    const styles = levelStyles[level] || levelStyles.INFO;

    const timeAgo = formatDistanceToNow(new Date(created_at), {
        addSuffix: true,
        locale: ptBR,
    });

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 border-l-4 transition-colors hover:brightness-95 dark:hover:brightness-125 ${is_read ? 'opacity-70 bg-gray-50 dark:bg-white/5' : styles.bg} ${styles.border}`}
        >
            <div className="flex items-start gap-3">
                <span className={`material-symbols-outlined text-xl ${styles.color}`}>{styles.icon}</span>
                <div className="flex-1">
                    <p className="text-sm text-text-light dark:text-text-dark">{message}</p>
                    <p className="text-xs text-text-subtle-light dark:text-text-subtle-dark mt-1">{timeAgo}</p>
                </div>
            </div>
        </button>
    );
};

export default NotificationItem;
