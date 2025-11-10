import api from './api';

const BASE_URL = '/agendamentos/modalidades/';

export const getModalidades = () => {
    return api.get(BASE_URL);
};

export const createModalidade = (nome) => {
    return api.post(BASE_URL, { nome });
};

export const updateModalidade = (id, nome) => {
    return api.put(`${BASE_URL}${id}/`, { nome });
};

export const deleteModalidade = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};
