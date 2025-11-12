import api from './api';

export const getPerfis = async () => {
    try {
        const response = await api.get('/api/perfis/');
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar perfis:', error);
        throw error;
    }
};
