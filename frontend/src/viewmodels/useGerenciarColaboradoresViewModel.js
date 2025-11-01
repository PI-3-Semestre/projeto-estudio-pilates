import { useState, useEffect } from 'react';
import api from '../services/api';

const useGerenciarColaboradoresViewModel = () => {
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchColaboradores = async () => {
            try {
                const response = await api.get('/colaboradores/');
                setColaboradores(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchColaboradores();
    }, []);

    return {
        colaboradores,
        loading,
        error,
    };
};

export default useGerenciarColaboradoresViewModel;
