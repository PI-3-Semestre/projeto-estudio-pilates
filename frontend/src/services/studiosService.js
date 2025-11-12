import api from './api';

const BASE_URL = '/studios/';

export const getStudios = () => {
    return api.get(BASE_URL);
};
