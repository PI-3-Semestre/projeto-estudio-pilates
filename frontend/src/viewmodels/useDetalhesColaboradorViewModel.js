import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getColaboradorPorCpf, getUsuario, deleteColaborador } from '../services/api';

const useDetalhesColaboradorViewModel = () => {
    const { cpf } = useParams();
    const navigate = useNavigate();
    const [colaborador, setColaborador] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetalhesColaborador = async () => {
            try {
                const colaboradorResponse = await getColaboradorPorCpf(cpf);
                const colaboradorData = colaboradorResponse.data;

                if (colaboradorData && colaboradorData.usuario) {
                    const usuarioResponse = await getUsuario(colaboradorData.usuario);
                    const usuarioData = usuarioResponse.data;
                    
                    // Combina os dados do colaborador com os dados do usuário
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
        if (window.confirm('Tem certeza que deseja deletar este colaborador?')) {
            try {
                await deleteColaborador(cpf);
                alert('Colaborador deletado com sucesso!');
                navigate('/gerenciar-colaboradores');
            } catch (err) {
                alert('Erro ao deletar colaborador.');
                console.error(err);
            }
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
