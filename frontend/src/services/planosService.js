import api from './api';

const planosService = {
    getAllPlanos: () => {
        return api.get('/financeiro/planos/');
    },

    getPlanoById: (id) => {
        return api.get(`/financeiro/planos/${id}/`);
    },

    createPlano: (planoData) => {
        return api.post('/financeiro/planos/', planoData);
    },

    updatePlano: (id, planoData) => {
        return api.put(`/financeiro/planos/${id}/`, planoData);
    },

    deletePlano: (id) => {
        return api.delete(`/financeiro/planos/${id}/`);
    },
};

export default planosService;
