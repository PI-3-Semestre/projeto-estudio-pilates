import api from './api';

const BASE_URL = '/colaboradores/';

export const getColaboradores = () => {
    return api.get(BASE_URL);
};
