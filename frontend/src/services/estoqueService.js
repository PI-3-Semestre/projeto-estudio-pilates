import api from './api';

const estoqueService = {
    /**
     * Retorna a lista de produtos e suas quantidades em estoque para um estúdio específico.
     * @param {number} studioId - O ID do estúdio.
     */
    getEstoqueByStudio: (studioId) => {
        if (!studioId) {
            return Promise.reject(new Error("É necessário fornecer o ID do estúdio."));
        }
        // Corrigido para o endpoint correto da API de estoque financeiro
        return api.get(`/financeiro/estoque/studio/${studioId}/`);
    },

    /**
     * Ajusta o estoque de um produto em um estúdio.
     * @param {object} ajusteData - Os dados do ajuste.
     * Ex: { produto_id: 1, studio_id: 1, quantidade: 50, operacao: "definir" }
     */
    ajustarEstoque: (ajusteData) => {
        return api.post('/financeiro/estoque/ajustar/', ajusteData);
    },
};

export default estoqueService;
