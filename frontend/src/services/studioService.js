import api from './api';

const studioService = {
    getStudios: () => {
        return api.get('/studios/');
    },
};

export default studioService;
