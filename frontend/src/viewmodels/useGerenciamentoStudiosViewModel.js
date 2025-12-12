import { useState, useEffect, useCallback } from 'react';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const useGerenciamentoStudiosViewModel = () => {
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchStudios = useCallback(async () => {
        try {
            setLoading(true);
            const response = await studiosService.getAllStudios();
            setStudios(response.data);
        } catch (err) {
            showToast("Erro ao buscar estúdios.", 'error');
            console.error("Erro ao buscar estúdios:", err);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchStudios();
    }, [fetchStudios]);

    const adicionarStudio = async (studioData) => {
        try {
            const response = await studiosService.createStudio(studioData);
            setStudios(prevStudios => [...prevStudios, response.data]);
            showToast("Studio adicionado com sucesso!", 'success');
            return response.data;
        } catch (err) {
            showToast("Erro ao adicionar estúdio.", 'error');
            console.error("Erro ao adicionar estúdio:", err);
            throw err;
        }
    };

    const editarStudio = async (id, studioData) => {
        try {
            const response = await studiosService.updateStudio(id, studioData);
            setStudios(prevStudios => 
                prevStudios.map(studio => (studio.id === id ? response.data : studio))
            );
            showToast("Studio editado com sucesso!", 'success');
            return response.data;
        } catch (err) {
            showToast("Erro ao editar estúdio.", 'error');
            console.error("Erro ao editar estúdio:", err);
            throw err;
        }
    };

    const removerStudio = async (id) => {
        try {
            await studiosService.deleteStudio(id);
            setStudios(prevStudios => prevStudios.filter(studio => studio.id !== id));
            showToast("Studio removido com sucesso!", 'success');
        } catch (err) {
            showToast("Erro ao remover estúdio.", 'error');
            console.error("Erro ao remover estúdio:", err);
            throw err;
        }
    };

    return {
        studios,
        loading,
        fetchStudios,
        adicionarStudio,
        editarStudio,
        removerStudio,
    };
};

export default useGerenciamentoStudiosViewModel;
