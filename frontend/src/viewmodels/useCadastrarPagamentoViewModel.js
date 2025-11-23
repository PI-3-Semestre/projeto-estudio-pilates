import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import alunosService from '../services/alunosService';
import matriculasService from '../services/matriculasService';
import vendasService from '../services/vendasService';
import financeiroService from '../services/financeiroService';
import { useToast } from '../context/ToastContext';

const useCadastrarPagamentoViewModel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    // Estados do formulário
    const [tipoAssociacao, setTipoAssociacao] = useState('matricula');
    const [alunoSearchQuery, setAlunoSearchQuery] = useState('');
    const [alunoSearchResults, setAlunoSearchResults] = useState([]);
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [associacoesDisponiveis, setAssociacoesDisponiveis] = useState([]);
    const [selectedAssociacaoId, setSelectedAssociacaoId] = useState('');
    const [valorTotal, setValorTotal] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [status, setStatus] = useState('PENDENTE');
    const [metodoPagamento, setMetodoPagamento] = useState('PIX');
    const [dataPagamento, setDataPagamento] = useState('');
    const [comprovanteFile, setComprovanteFile] = useState(null);

    // Estados de controle
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isPreFilled, setIsPreFilled] = useState(false); // Para controlar o modo de pré-preenchimento

    // Pré-preenchimento vindo da renovação ou de outras telas
    useEffect(() => {
        const { matriculaId, valor, aluno } = location.state || {};
        if (matriculaId) {
            setIsPreFilled(true);
            setTipoAssociacao('matricula');
            setSelectedAssociacaoId(matriculaId);
            if (valor) setValorTotal(valor);
            if (aluno) setSelectedAluno(aluno);
        }
    }, [location.state]);

    // Busca de alunos (só executa se não estiver pré-preenchido)
    useEffect(() => {
        if (isPreFilled || alunoSearchQuery.length < 3) {
            setAlunoSearchResults([]);
            return;
        }
        const handler = setTimeout(() => {
            alunosService.searchAlunos(alunoSearchQuery)
                .then(response => setAlunoSearchResults(response.data))
                .catch(() => showToast('Erro ao buscar alunos.', { type: 'error' }));
        }, 300);
        return () => clearTimeout(handler);
    }, [alunoSearchQuery, isPreFilled, showToast]);

    // Busca de matrículas ou vendas quando um aluno é selecionado (só executa se não estiver pré-preenchido)
    useEffect(() => {
        if (isPreFilled || !selectedAluno) {
            setAssociacoesDisponiveis([]);
            return;
        }
        setLoading(true);
        const fetchAssociacoes = async () => {
            try {
                if (tipoAssociacao === 'matricula') {
                    const response = await matriculasService.getMatriculasByAlunoId(selectedAluno.usuario_id);
                    setAssociacoesDisponiveis(response.data);
                } else {
                    const response = await vendasService.getVendasByAlunoId(selectedAluno.usuario_id);
                    setAssociacoesDisponiveis(response.data);
                }
            } catch (error) {
                showToast(`Erro ao buscar ${tipoAssociacao}s do aluno.`, { type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchAssociacoes();
    }, [selectedAluno, tipoAssociacao, isPreFilled, showToast]);

    // Auto-preenchimento do valor total (só executa se não estiver pré-preenchido)
    useEffect(() => {
        if (isPreFilled || !selectedAssociacaoId) return;
        
        const associacao = associacoesDisponiveis.find(a => a.id.toString() === selectedAssociacaoId.toString());
        if (associacao) {
            if (tipoAssociacao === 'matricula') {
                setValorTotal(associacao.plano.preco);
            } else {
                setValorTotal(associacao.valor_total);
            }
        }
    }, [selectedAssociacaoId, associacoesDisponiveis, tipoAssociacao, isPreFilled]);

    // Lógica para auto-preencher status e data de pagamento
    useEffect(() => {
        if (comprovanteFile) {
            setStatus('PAGO');
            setDataPagamento(new Date().toISOString().split('T')[0]);
        }
    }, [comprovanteFile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setComprovanteFile(null);
            return;
        }
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Tipo de arquivo não suportado. Envie PDF, JPG ou PNG.', { type: 'error' });
            e.target.value = null;
            return;
        }
        const maxSize = 2.5 * 1024 * 1024;
        if (file.size > maxSize) {
            showToast('O arquivo é muito grande. O tamanho máximo é 2.5 MB.', { type: 'error' });
            e.target.value = null;
            return;
        }
        setComprovanteFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssociacaoId || !valorTotal || !dataVencimento) {
            showToast('Preencha todos os campos obrigatórios.', { type: 'warning' });
            return;
        }
        setSubmitting(true);

        const formData = new FormData();
        formData.append('valor_total', valorTotal);
        formData.append('data_vencimento', dataVencimento);
        formData.append('status', status);
        if (metodoPagamento) formData.append('metodo_pagamento', metodoPagamento);
        if (dataPagamento) formData.append('data_pagamento', dataPagamento);

        if (tipoAssociacao === 'matricula') {
            formData.append('matricula_id', selectedAssociacaoId);
        } else {
            formData.append('venda_id', selectedAssociacaoId);
        }

        if (comprovanteFile) {
            formData.append('comprovante_pagamento', comprovanteFile);
        }

        try {
            await financeiroService.createPagamento(formData);
            showToast('Pagamento registrado com sucesso!', { type: 'success' });
            navigate('/financeiro/pagamentos');
        } catch (error) {
            const errorMessage = error.response?.data?.non_field_errors?.join(' ') || error.response?.data?.comprovante_pagamento?.join(' ') || 'Erro ao registrar o pagamento.';
            showToast(errorMessage, { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        tipoAssociacao, setTipoAssociacao,
        alunoSearchQuery, setAlunoSearchQuery,
        alunoSearchResults, setAlunoSearchResults,
        selectedAluno, setSelectedAluno,
        associacoesDisponiveis,
        selectedAssociacaoId, setSelectedAssociacaoId,
        valorTotal, setValorTotal,
        dataVencimento, setDataVencimento,
        status, setStatus,
        metodoPagamento, setMetodoPagamento,
        dataPagamento, setDataPagamento,
        comprovanteFile, setComprovanteFile,
        handleFileChange,
        loading,
        submitting,
        isPreFilled,
        handleSubmit,
    };
};

export default useCadastrarPagamentoViewModel;
