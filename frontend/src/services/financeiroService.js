import api from './api';

const financeiroService = {
    getResumoFinanceiro: () => {
        // Assuming an endpoint for financial summary
        return api.get('financeiro/resumo/'); 
    },
    getTransacoes: (filters) => {
        // Assuming an endpoint for transactions with filters
        return api.get('financeiro/transacoes/', { params: filters });
    },
    getDetalhesTransacao: (id) => {
        return api.get(`financeiro/transacoes/${id}/`);
    },
    createTransacao: (data) => {
        return api.post('financeiro/transacoes/', data);
    },
    updateTransacao: (id, data) => {
        return api.put(`financeiro/transacoes/${id}/`, data);
    },
    deleteTransacao: (id) => {
        return api.delete(`financeiro/transacoes/${id}/`);
    },
    // Add other specific financeiro endpoints as needed
};

export default financeiroService;
