import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusPagamentosWidget = ({ data, isLoading }) => {
    const statusColors = {
        'PAGO': 'rgba(75, 192, 192, 0.6)',
        'PENDENTE': 'rgba(255, 206, 86, 0.6)',
        'ATRASADO': 'rgba(255, 99, 132, 0.6)',
    };

    const chartData = {
        labels: data?.status_pagamentos?.map(item => item.status) || [],
        datasets: [
            {
                data: data?.status_pagamentos?.map(item => item.valor_total) || [],
                backgroundColor: data?.status_pagamentos?.map(item => statusColors[item.status] || '#ccc') || [],
                borderColor: data?.status_pagamentos?.map(item => statusColors[item.status]?.replace('0.6', '1')) || [],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
        },
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-card-dark h-80 animate-pulse">
                <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-600 rounded-md mb-4"></div>
                <div className="h-56 w-full bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-6"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-card-dark h-80">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Status de Pagamentos</h3>
            <div className="h-64">
                <Doughnut data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default StatusPagamentosWidget;
