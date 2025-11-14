import React from 'react';
import { useParams } from 'react-router-dom';
import useDashboardStudioViewModel from '../viewmodels/useDashboardStudioViewModel';
import Header from '../components/Header';
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaExclamationTriangle, FaFileAlt, FaCalendarDay, FaCalendarCheck } from 'react-icons/fa';

const DashboardStudioView = () => {
    const { studioId } = useParams();
    const { data, loading, error } = useDashboardStudioViewModel(studioId);

    const cardData = [
        {
            title: "Total de Matrículas",
            value: data?.financeiro?.total_matriculas,
            icon: <FaUsers className="text-4xl text-blue-500" />,
        },
        {
            title: "Total de Vendas",
            value: data?.financeiro?.total_vendas,
            icon: <FaShoppingCart className="text-4xl text-green-500" />,
        },
        {
            title: "Pagamentos Pendentes",
            value: data?.financeiro?.total_pagamentos_pendentes,
            icon: <FaMoneyBillWave className="text-4xl text-yellow-500" />,
        },
        {
            title: "Pagamentos Atrasados",
            value: data?.financeiro?.total_pagamentos_atrasados,
            icon: <FaExclamationTriangle className="text-4xl text-red-500" />,
        },
        {
            title: "Total de Avaliações",
            value: data?.avaliacoes?.total_avaliacoes,
            icon: <FaFileAlt className="text-4xl text-indigo-500" />,
        },
        {
            title: "Agendamentos para Hoje",
            value: data?.agendamentos?.total_agendamentos_hoje,
            icon: <FaCalendarDay className="text-4xl text-purple-500" />,
        },
        {
            title: "Agendamentos Pendentes",
            value: data?.agendamentos?.total_agendamentos_pendentes,
            icon: <FaCalendarCheck className="text-4xl text-teal-500" />,
        },
    ];

    return (
        <div className="container mx-auto p-4">
            <Header title={`Dashboard do Studio`} />
            {loading && <p className="text-center">Carregando...</p>}
            {error && <p className="text-center text-red-500">Erro ao carregar o dashboard: {error.message}</p>}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {cardData.map((card, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center">
                            <div className="mr-4">{card.icon}</div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">{card.title}</h2>
                                <p className="text-2xl font-bold text-gray-900">{card.value !== undefined ? card.value : 'N/A'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardStudioView;