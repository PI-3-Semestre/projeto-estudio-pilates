import { useState, useEffect } from 'react';
import api from '../services/api';

const useGerenciarAlunosViewModel = () => {
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAlunos = async () => {
            try {
                const response = await api.get('/alunos/');
                setAlunos(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlunos();
    }, []);

    return {
        alunos,
        loading,
        error,
    };
};

export default useGerenciarAlunosViewModel;
