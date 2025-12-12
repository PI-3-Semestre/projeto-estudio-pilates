import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getColaboradorPorCpf, getUsuario, deleteColaborador } from '../services/api';
import { useToast } from '../context/ToastContext';

const useDetalhesColaboradorViewModel = () => {
    const { cpf } = useParams();
    const navigate = useNavigate();
    const [colaborador, setColaborador] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchDetalhesColaborador = async () => {
            try {
                const colaboradorResponse = await getColaboradorPorCpf(cpf);
                const colaboradorData = colaboradorResponse.data;

                if (colaboradorData && colaboradorData.usuario) {
                    const usuarioResponse = await getUsuario(colaboradorData.usuario);
                    const usuarioData = usuarioResponse.data;
                    
                    setColaborador({
                        ...colaboradorData,
                        usuario: usuarioData
                    });
                } else {
                    setColaborador(colaboradorData);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (cpf) {
            fetchDetalhesColaborador();
        }
    }, [cpf]);

    const handleDelete = async () => {
        try {
            await deleteColaborador(cpf);
            showToast('Colaborador deletado com sucesso!', 'success');
            navigate('/colaboradores');
        } catch (err) {
            showToast('Erro ao deletar colaborador.', 'error');
            console.error(err);
        }
    };

    return {
        colaborador,
        loading,
        error,
        handleDelete,
    };
};

export default useDetalhesColaboradorViewModel;
