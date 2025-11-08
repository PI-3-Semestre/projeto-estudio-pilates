import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getColaboradorPorCpf } from '../services/api';

const useDetalhesColaboradorViewModel = () => {
    const { cpf } = useParams();
    const [colaborador, setColaborador] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchColaborador = async () => {
            try {
                const response = await getColaboradorPorCpf(cpf);
                console.log(response.data);
                setColaborador(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (cpf) {
            fetchColaborador();
        }
    }, [cpf]);

    return {
        colaborador,
        loading,
        error,
    };
};

export default useDetalhesColaboradorViewModel;
