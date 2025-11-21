import api from './api';

const planosService = {
    getAllPlanos: () => {
        return api.get('planos/');
    },

    getPlanoById: (id) => {
        return api.get(`planos/${id}/`);
    },

    createPlano: (planoData) => {
        return api.post('planos/', planoData);
    },

    updatePlano: (id, planoData) => {
        return api.put(`planos/${id}/`, planoData);
    },

    deletePlano: (id) => {
        return api.delete(`planos/${id}/`);
    },
};

export default planosService;
