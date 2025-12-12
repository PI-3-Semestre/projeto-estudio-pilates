import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import financeiroService from '../services/financeiroService';
import { useToast } from '../context/ToastContext';

const useEditarPagamentoViewModel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [pagamento, setPagamento] = useState(null);
    const [valorTotal, setValorTotal] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [status, setStatus] = useState('');
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [dataPagamento, setDataPagamento] = useState('');
    const [comprovanteFile, setComprovanteFile] = useState(null);
    const [comprovanteAtual, setComprovanteAtual] = useState(''); // Para exibir o comprovante existente

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchPagamento = useCallback(async () => {
        setLoading(true);
        try {
            const response = await financeiroService.getPagamentoById(id);
            const data = response.data;
            setPagamento(data);
            setValorTotal(data.valor_total);
            setDataVencimento(data.data_vencimento);
            setStatus(data.status);
            setMetodoPagamento(data.metodo_pagamento || '');
            setDataPagamento(data.data_pagamento || '');
            setComprovanteAtual(data.comprovante_pagamento || '');
        } catch (error) {
            showToast('Erro ao carregar os dados do pagamento.', { type: 'error' });
            navigate('/financeiro/pagamentos');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, showToast]);

    useEffect(() => {
        fetchPagamento();
    }, [fetchPagamento]);

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

        const maxSize = 2.5 * 1024 * 1024; // 2.5 MB
        if (file.size > maxSize) {
            showToast('O arquivo é muito grande. O tamanho máximo é 2.5 MB.', { type: 'error' });
            e.target.value = null;
            return;
        }

        setComprovanteFile(file);
        setComprovanteAtual(''); // Limpa o comprovante atual se um novo for selecionado
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('valor_total', valorTotal);
        formData.append('data_vencimento', dataVencimento);
        formData.append('status', status);
        if (metodoPagamento) formData.append('metodo_pagamento', metodoPagamento);
        if (dataPagamento) formData.append('data_pagamento', dataPagamento);

        // Adiciona os IDs de associação, se existirem, para evitar o erro de validação
        if (pagamento.matricula) {
            formData.append('matricula_id', pagamento.matricula.id);
        } else if (pagamento.venda) {
            formData.append('venda_id', pagamento.venda.id);
        }

        // Se um novo comprovante foi selecionado
        if (comprovanteFile) {
            formData.append('comprovante_pagamento', comprovanteFile);
        } else if (comprovanteAtual === null && pagamento.comprovante_pagamento) {
            // Se o comprovante atual foi removido explicitamente na UI
            // O backend precisa de um mecanismo para "limpar" o arquivo.
            // Uma abordagem comum é enviar um campo específico para isso.
            // Por exemplo, se o backend espera 'clear_comprovante_pagamento': true
            // Ou, se o campo comprovante_pagamento for enviado vazio, ele pode interpretar como remoção.
            // Por enquanto, se comprovanteAtual é null e havia um comprovante antes,
            // não enviamos o campo, o que pode não ser suficiente para remover no backend.
            // Para remoção explícita, o backend precisaria de um campo como 'clear_comprovante_pagamento': true
            // Para este cenário, vamos assumir que não enviar o campo é suficiente para não alterar,
            // e que para remover, o backend precisaria de uma lógica específica.
            // Se o backend não tem essa lógica, a remoção de um comprovante existente
            // sem substituição não funcionará apenas com PATCH.
        }


        try {
            await financeiroService.patchPagamento(id, formData);
            showToast('Pagamento atualizado com sucesso!', { type: 'success' });
            navigate(`/financeiro/pagamentos/${id}`);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.response?.data?.non_field_errors?.join(' ') || error.response?.data?.comprovante_pagamento?.join(' ') || 'Erro ao atualizar o pagamento.';
            showToast(errorMessage, { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        pagamento,
        valorTotal, setValorTotal,
        dataVencimento, setDataVencimento,
        status, setStatus,
        metodoPagamento, setMetodoPagamento,
        dataPagamento, setDataPagamento,
        comprovanteFile, setComprovanteFile,
        comprovanteAtual, setComprovanteAtual,
        handleFileChange,
        loading,
        submitting,
        handleSubmit,
    };
};

export default useEditarPagamentoViewModel;
