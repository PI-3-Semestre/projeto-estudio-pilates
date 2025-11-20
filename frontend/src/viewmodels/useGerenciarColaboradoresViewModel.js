import { useState, useEffect } from 'react';
import api from '../services/api';

const useGerenciarColaboradoresViewModel = () => {
    const [colaboradores, setColaboradores] = useState([]);
    const [users, setUsers] = useState([]);
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [colaboradoresResponse, usersResponse, studiosResponse] = await Promise.all([
                    api.get('/colaboradores/'),
                    api.get('/usuarios/'),
                    api.get('/studios/')
                ]);
                setColaboradores(colaboradoresResponse.data);
                setUsers(usersResponse.data);
                setStudios(studiosResponse.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        colaboradores,
        users,
        studios,
        loading,
        error,
    };
};

export default useGerenciarColaboradoresViewModel;
