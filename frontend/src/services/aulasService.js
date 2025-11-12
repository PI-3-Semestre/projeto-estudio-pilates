import api from './api';

const BASE_URL = '/agendamentos/aulas/';

export const getAulas = (studioId = null) => {
    let url = BASE_URL;
    if (studioId) {
        url += `?studio=${studioId}`;
    }
    return api.get(url);
};

export const createAula = (aulaData) => {
    return api.post(BASE_URL, aulaData);
};