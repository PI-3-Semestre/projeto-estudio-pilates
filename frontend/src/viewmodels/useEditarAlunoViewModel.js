import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const useEditarAlunoViewModel = () => {
    const navigate = useNavigate();
    const { cpf } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [studios, setStudios] = useState([]); // New state for studios
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        dataNascimento: '',
        contato: '',
        profissao: '',
        unidade: '',
        is_active: true,
        foto: null, // New field for the photo
    });

    useEffect(() => {
        const fetchDadosIniciais = async () => {
            try {
                // Fetch student data
                const alunoResponse = await api.get(`/alunos/${cpf}`);
                const aluno = alunoResponse.data;

                // Fetch studios
                const studiosResponse = await api.get('/studios/');
                setStudios(studiosResponse.data);

                // Populate form data
                setFormData({
                    nome: aluno.nome || '',
                    email: aluno.email || '',
                    dataNascimento: aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '',
                    contato: aluno.contato || '',
                    profissao: aluno.profissao || '',
                    unidade: Array.isArray(aluno.unidades) && aluno.unidades.length > 0 ? aluno.unidades[0] : '',
                    is_active: aluno.is_active ?? true,
                    foto: aluno.foto || null,
                });
            } catch (err) {
                setError('Falha ao carregar dados do aluno.');
                console.error('Erro ao carregar dados:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDadosIniciais();
    }, [cpf]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Handler for file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Extract only the base64 part (remove 'data:image/...;base64,' prefix)
                const base64String = reader.result.split(',')[1];
                setFormData(prev => ({ ...prev, foto: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        let formattedDate = null;
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

        if (formData.dataNascimento) {
            if (!dateRegex.test(formData.dataNascimento)) {
                setError({ dataNascimento: 'Por favor, insira a data no formato DD/MM/AAAA.' });
                setSaving(false);
                return;
            }
            const [, dia, mes, ano] = formData.dataNascimento.match(dateRegex);
            formattedDate = `${ano}-${mes}-${dia}`;
        }

        try {
            await api.put(`/alunos/${cpf}/`, {
                nome: formData.nome,
                email: formData.email,
                dataNascimento: formattedDate,
                contato: formData.contato,
                profissao: formData.profissao,
                unidades: formData.unidade ? [parseInt(formData.unidade)] : [],
                is_active: formData.is_active,
                foto: formData.foto, // Send the photo as base64
            });

            showToast('Perfil do aluno atualizado com sucesso!', 'success');
            navigate(-1);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Erro ao salvar alterações.';
            setError(errorMessage);
            showToast('Erro ao atualizar perfil do aluno.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return {
        formData,
        loading,
        saving,
        error,
        studios, // Expose studios
        handleChange,
        handleFileChange, // Expose file handler
        handleSubmit,
    };
};

export default useEditarAlunoViewModel;
