import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MatriculasAtivasWidget = ({ data, isLoading }) => {
    const chartData = {
        labels: data?.detalhes_por_plano?.map(item => item.plano_nome) || [],
        datasets: [
            {
                label: 'Matrículas Ativas',
                data: data?.detalhes_por_plano?.map(item => item.quantidade_ativas) || [],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
        ],
    };

    const chartOptions = {
        indexAxis: 'y',
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
            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Matrículas Ativas</h3>
            <p className="text-3xl font-bold text-primary mb-4">{data?.total_matriculas_ativas}</p>
            <div className="h-40">
                <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
};

export default MatriculasAtivasWidget;
