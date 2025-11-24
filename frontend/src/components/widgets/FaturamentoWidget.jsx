import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FaturamentoWidget = ({ data, isLoading }) => {
    const formatPrice = (price) => {
        if (!price) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const chartData = {
        labels: data?.faturamento_mensal?.map(item => new Date(item.mes + '-02').toLocaleString('default', { month: 'short' })) || [],
        datasets: [
            {
                label: 'Faturamento Mensal',
                data: data?.faturamento_mensal?.map(item => item.total) || [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-card-dark h-80 animate-pulse">
                <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-600 rounded-md mb-4"></div>
                <div className="h-12 w-1/2 bg-gray-300 dark:bg-gray-600 rounded-md mb-6"></div>
                <div className="h-40 w-full bg-gray-300 dark:bg-gray-600 rounded-md"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-card-dark h-80">
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Faturamento Total</h3>
            <p className="text-3xl font-bold text-primary mb-4">{formatPrice(data?.faturamento_total)}</p>
            <div className="h-40">
                <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
};

export default FaturamentoWidget;
