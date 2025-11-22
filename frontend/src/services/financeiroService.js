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
    
    /**
     * Cria um novo registro de pagamento, associado a uma venda.
     * @param {object} pagamentoData - Os dados do pagamento.
     * Ex: { venda_id: 3, valor_total: "114.90", status: "PAGO", ... }
     */
    createPagamento: (pagamentoData) => {
        return api.post('/financeiro/pagamentos/', pagamentoData);
    },

    /**
     * Busca os detalhes de um pagamento associado a um ID de venda específico.
     * @param {number} vendaId - O ID da venda.
     */
    getPagamentoByVendaId: (vendaId) => {
        return api.get(`/financeiro/pagamentos/venda/${vendaId}/`);
    },
};

export default financeiroService;
