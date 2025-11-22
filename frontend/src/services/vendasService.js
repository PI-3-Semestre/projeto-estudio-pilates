import api from './api';

const vendasService = {
    /**
     * Retorna uma lista com todas as vendas registradas.
     */
    getVendas: () => {
        return api.get('/vendas/'); // Removido o parâmetro de filtro
    },

    /**
     * Retorna os detalhes de uma venda específica.
     * @param {number} id - O ID da venda.
     */
    getVendaById: (id) => {
        return api.get(`/vendas/${id}/`);
    },

    /**
     * Registra uma nova venda.
     * @param {object} vendaData - Os dados da venda.
     * Ex: { aluno: 22, studio: 1, produtos_vendidos: [...] }
     */
    createVenda: (vendaData) => {
        return api.post('/vendas/', vendaData);
    },

    /**
     * Atualiza os dados de uma venda.
     * @param {number} id - O ID da venda a ser atualizada.
     * @param {object} updateData - Os dados a serem modificados.
     */
    updateVenda: (id, updateData) => {
        return api.patch(`/vendas/${id}/`, updateData);
    },

    /**
     * Deleta uma venda do sistema.
     * @param {number} id - O ID da venda a ser deletada.
     */
    deleteVenda: (id) => {
        return api.delete(`/vendas/${id}/`);
    },
};

export default vendasService;
