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
     * Cria um novo registro de pagamento, associado a uma venda ou matrícula.
     * @param {FormData} formData - Os dados do pagamento em formato FormData.
     */
    createPagamento: (formData) => {
        return api.post('/financeiro/pagamentos/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Retorna uma lista de todos os pagamentos.
     */
    getPagamentos: () => {
        return api.get('/financeiro/pagamentos/');
    },

    /**
     * Retorna os detalhes de um pagamento específico.
     * @param {number} id - O ID do pagamento.
     */
    getPagamentoById: (id) => {
        return api.get(`/financeiro/pagamentos/${id}/`);
    },

    /**
     * Atualiza completamente um pagamento existente.
     * @param {number} id - O ID do pagamento.
     * @param {object} data - Todos os dados do pagamento.
     */
    updatePagamento: (id, data) => {
        return api.put(`/financeiro/pagamentos/${id}/`, data);
    },

    /**
     * Atualiza parcialmente um pagamento existente.
     * @param {number} id - O ID do pagamento.
     * @param {object} data - Os dados a serem modificados.
     */
    patchPagamento: (id, data) => {
        return api.patch(`/financeiro/pagamentos/${id}/`, data);
    },

    /**
     * Exclui um pagamento específico.
     * @param {number} id - O ID do pagamento.
     */
    deletePagamento: (id) => {
        return api.delete(`/financeiro/pagamentos/${id}/`);
    },

    /**
     * Permite que o aluno (dono do pagamento) faça o upload de um comprovante.
     * @param {number} id - O ID do pagamento.
     * @param {FormData} formData - O FormData contendo o arquivo do comprovante.
     */
    anexarComprovante: (id, formData) => {
        return api.post(`/financeiro/pagamentos/${id}/anexar_comprovante/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Busca os detalhes de um pagamento associado a um ID de venda específico.
     * @param {number} vendaId - O ID da venda.
     */
    getPagamentoByVendaId: (vendaId) => {
        return api.get(`/financeiro/pagamentos/venda/${vendaId}/`);
    },

    /**
     * Busca todos os pagamentos associados a um ID de matrícula específico.
     * @param {number} matriculaId - O ID da matrícula.
     */
    getPagamentosByMatriculaId: (matriculaId) => {
        return api.get(`/financeiro/pagamentos/matricula/${matriculaId}/`);
    },
};

export default financeiroService;
