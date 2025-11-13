import { useState, useEffect } from 'react';
import api from '../services/api';

const useGestaoUsuariosViewModel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/usuarios/');
                setUsers(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
    };
};

export default useGestaoUsuariosViewModel;