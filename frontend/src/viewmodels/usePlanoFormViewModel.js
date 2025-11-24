import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import planosService from '../services/planosService';
import { useToast } from '../context/ToastContext';

const usePlanoFormViewModel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [nome, setNome] = useState('');
    const [duracaoDias, setDuracaoDias] = useState('');
    const [creditosSemanais, setCreditosSemanais] = useState('');
    const [preco, setPreco] = useState('');
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(!!id); // Only load if it's an edit form
    const [saving, setSaving] = useState(false);

    const isEditMode = !!id;

    const validate = useCallback(() => {
        const newErrors = {};
        if (!nome) newErrors.nome = 'O nome do plano é obrigatório.';
        if (!duracaoDias || isNaN(duracaoDias) || duracaoDias <= 0) newErrors.duracaoDias = 'A duração deve ser um número positivo.';
        if (!creditosSemanais || isNaN(creditosSemanais) || creditosSemanais <= 0) newErrors.creditosSemanais = 'Os créditos devem ser um número positivo.';
        if (!preco || isNaN(preco) || preco <= 0) newErrors.preco = 'O preço deve ser um número positivo.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [nome, duracaoDias, creditosSemanais, preco]);

    useEffect(() => {
        if (isEditMode) {
            const fetchPlano = async () => {
                try {
                    const response = await planosService.getPlanoById(id);
                    const { nome, duracao_dias, creditos_semanais, preco } = response.data;
                    setNome(nome);
                    setDuracaoDias(duracao_dias);
                    setCreditosSemanais(creditos_semanais);
                    setPreco(preco);
                } catch (err) {
                    showToast('Erro ao buscar dados do plano.', { type: 'error' });
                } finally {
                    setLoading(false);
                }
            };
            fetchPlano();
        }
    }, [id, isEditMode, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            showToast('Por favor, corrija os erros no formulário.', { type: 'warning' });
            return;
        }

        setSaving(true);
        const planoData = {
            nome,
            duracao_dias: duracaoDias,
            creditos_semanais: creditosSemanais,
            preco,
        };

        try {
            if (isEditMode) {
                await planosService.updatePlano(id, planoData);
                showToast('Plano salvo com sucesso!', { type: 'success' });
            } else {
                await planosService.createPlano(planoData);
                showToast('Plano criado com sucesso!', { type: 'success' });
            }
            navigate('/planos');
        } catch (err) {
            const apiErrors = err.response?.data;
            if (apiErrors) {
                setErrors(apiErrors);
                showToast('Erro de validação da API. Verifique os campos.', { type: 'error' });
            } else {
                showToast('Ocorreu um erro inesperado. Tente novamente.', { type: 'error' });
            }
        } finally {
            setSaving(false);
        }
    };

    return {
        isEditMode,
        nome, setNome,
        duracaoDias, setDuracaoDias,
        creditosSemanais, setCreditosSemanais,
        preco, setPreco,
        errors,
        loading,
        saving,
        handleSubmit,
    };
};

export default usePlanoFormViewModel;
