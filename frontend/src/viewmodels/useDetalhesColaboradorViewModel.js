import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getColaboradorPorCpf, getUsuario } from '../services/api';

const useDetalhesColaboradorViewModel = () => {
    const { cpf } = useParams();
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

    return {
        colaborador,
        loading,
        error,
    };
};

export default useDetalhesColaboradorViewModel;
