import { useState, useEffect } from 'react';
import api from '../services/api';

const useGerenciarColaboradoresViewModel = () => {
    const [colaboradores, setColaboradores] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [colaboradoresResponse, usersResponse] = await Promise.all([
                    api.get('/colaboradores/'),
                    api.get('/usuarios/')
                ]);
                setColaboradores(colaboradoresResponse.data);
                setUsers(usersResponse.data);
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
        loading,
        error,
    };
};

export default useGerenciarColaboradoresViewModel;
