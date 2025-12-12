import { useState, useEffect } from 'react';
import api from '../services/api';

const useGerenciarAlunosViewModel = () => {
    const [alunos, setAlunos] = useState([]);
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [alunosResponse, studiosResponse] = await Promise.all([
                    api.get('/alunos/'),
                    api.get('/studios/')
                ]);
                setAlunos(alunosResponse.data);
                setStudios(studiosResponse.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to format photo URL
    const formatPhotoUrl = (foto) => {
        if (!foto) return '';
        if (foto.startsWith('http') || foto.startsWith('data:')) {
            return foto;
        }
        return `data:image/jpeg;base64,${foto}`;
    };

    return {
        alunos,
        studios,
        loading,
        error,
        formatPhotoUrl,
    };
};

export default useGerenciarAlunosViewModel;
