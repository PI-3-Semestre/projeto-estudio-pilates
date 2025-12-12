import api from './api';

const relatoriosService = {
    getFaturamento: (params) => {
        return api.get('/relatorios/faturamento/', { params });
    },
    getVendasPorProduto: (params) => {
        return api.get('/relatorios/vendas-por-produto/', { params });
    },
    getStatusPagamentos: (params) => {
        return api.get('/relatorios/status-pagamentos/', { params });
    },
    getMatriculasAtivas: (params) => {
        return api.get('/relatorios/matriculas-ativas/', { params });
    },
};

export default relatoriosService;
