import { useState, useEffect, useCallback } from 'react';
import { getModalidades, createModalidade, updateModalidade, deleteModalidade } from '../services/modalidadesService';

const useModalidadesViewModel = () => {
    const [modalidades, setModalidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadModalidades = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getModalidades();
            setModalidades(response.data);
            setError(null);
        } catch (err) {
            setError('Não foi possível carregar as modalidades.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadModalidades();
    }, [loadModalidades]);

    const addModalidade = async (nome) => {
        try {
            const response = await createModalidade(nome);
            setModalidades([...modalidades, response.data]);
            return true;
        } catch (err) {
            setError('Erro ao adicionar a modalidade.');
            console.error(err);
            return false;
        }
    };

    const editModalidade = async (id, nome) => {
        try {
            const response = await updateModalidade(id, nome);
            setModalidades(modalidades.map(m => (m.id === id ? response.data : m)));
            return true;
        } catch (err) {
            setError('Erro ao atualizar a modalidade.');
            console.error(err);
            return false;
        }
    };

    const removeModalidade = async (id) => {
        try {
            await deleteModalidade(id);
            setModalidades(modalidades.filter(m => m.id !== id));
            return true;
        } catch (err) {
            setError('Erro ao remover a modalidade.');
            console.error(err);
            return false;
        }
    };

    return {
        modalidades,
        loading,
        error,
        loadModalidades,
        addModalidade,
        editModalidade,
        removeModalidade,
    };
};

export default useModalidadesViewModel;