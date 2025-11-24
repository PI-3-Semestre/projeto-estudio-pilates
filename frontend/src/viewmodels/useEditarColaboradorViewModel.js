import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getColaboradorPorCpf, getUsuario } from '../services/api';

const useEditarColaboradorViewModel = () => {
    const { cpf } = useParams();
    const navigate = useNavigate();
    const [colaborador, setColaborador] = useState(null);
    const [formData, setFormData] = useState({
        // User fields
        username: '',
        email: '',
        cpf: '',

        // Colaborador fields
        nome_completo: '',
        registro_profissional: '',
        data_nascimento: '',
        telefone: '',
        data_admissao: '',
        data_demissao: '',
        status: '',
        endereco: {
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
        },
        vinculos_studio: [],
    });
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

                    const fullData = {
                        ...colaboradorData,
                        usuario: usuarioData
                    };
                    setColaborador(fullData);
                    setFormData({
                        username: fullData.usuario.username,
                        email: fullData.usuario.email,
                        cpf: fullData.usuario.cpf,
                        nome_completo: fullData.nome_completo,
                        registro_profissional: fullData.registro_profissional,
                        data_nascimento: fullData.data_nascimento,
                        telefone: fullData.telefone,
                        data_admissao: fullData.data_admissao,
                        data_demissao: fullData.data_demissao,
                        status: fullData.status,
                        endereco: fullData.endereco || formData.endereco,
                        vinculos_studio: fullData.vinculos_studio || [],
                    });
                } else {
                    setColaborador(colaboradorData);
                    setFormData({
                        ...formData,
                        nome_completo: colaboradorData.nome_completo,
                        registro_profissional: colaboradorData.registro_profissional,
                        data_nascimento: colaboradorData.data_nascimento,
                        telefone: colaboradorData.telefone,
                        data_admissao: colaboradorData.data_admissao,
                        data_demissao: colaboradorData.data_demissao,
                        status: colaboradorData.status,
                        endereco: colaboradorData.endereco || formData.endereco,
                        vinculos_studio: colaboradorData.vinculos_studio || [],
                    });
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

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name.startsWith("endereco.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                endereco: {
                    ...prev.endereco,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                cpf: formData.cpf,
            };
            const colaboradorData = {
                nome_completo: formData.nome_completo,
                registro_profissional: formData.registro_profissional,
                data_nascimento: formData.data_nascimento,
                telefone: formData.telefone,
                data_admissao: formData.data_admissao,
                data_demissao: formData.data_demissao,
                status: formData.status,
                endereco: formData.endereco,
                vinculos_studio: formData.vinculos_studio,
            };

            await api.patch(`/usuarios/${colaborador.usuario.id}/`, userData);
            await api.patch(`/colaboradores/${cpf}/`, colaboradorData);

            navigate(`/colaboradores/${formData.cpf}`);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        error,
        handleChange,
        handleSubmit,
    };
};

export default useEditarColaboradorViewModel;
