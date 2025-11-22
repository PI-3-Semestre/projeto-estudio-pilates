import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsByStudio } from '../services/productsService';
import alunosService from '../services/alunosService';
import vendasService from '../services/vendasService';
import financeiroService from '../services/financeiroService';
import studiosService from '../services/studiosService';
import { useToast } from '../context/ToastContext';

const useCadastrarVendaViewModel = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [allStudios, setAllStudios] = useState([]);
    const [selectedStudio, setSelectedStudio] = useState('');

    const [produtos, setProdutos] = useState([]);
    const [allAlunos, setAllAlunos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [carrinho, setCarrinho] = useState([]);
    
    const [metodoPagamento, setMetodoPagamento] = useState('PIX');
    const [statusPagamento, setStatusPagamento] = useState('PAGO');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Estado para controlar a animação
    const [animationState, setAnimationState] = useState({
        key: 0,
        productImage: null,
        startPosition: null,
    });

    // Carregar dados iniciais
    useEffect(() => {
        setLoading(true);
        Promise.all([
            studiosService.getAllStudios(),
            alunosService.searchAlunos('')
        ]).then(([studiosResponse, alunosResponse]) => {
            setAllStudios(studiosResponse.data);
            setAllAlunos(alunosResponse.data);
        }).catch(() => {
            showToast('Erro ao carregar dados iniciais.', { type: 'error' });
        }).finally(() => {
            setLoading(false);
        });
    }, [showToast]);

    const filteredAlunos = useMemo(() => {
        if (searchQuery.length < 3) return [];
        return allAlunos.filter(aluno =>
            aluno.nome && aluno.nome.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allAlunos]);

    const fetchProdutos = useCallback(async (studioId) => {
        if (!studioId) {
            setProdutos([]);
            return;
        }
        setLoading(true);
        try {
            const data = await getProductsByStudio(studioId);
            setProdutos(data);
        } catch (error) {
            showToast('Erro ao carregar os produtos deste estúdio.', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProdutos(selectedStudio);
    }, [selectedStudio, fetchProdutos]);

    const addToCarrinho = (produto, startPosition) => {
        const itemInCarrinho = carrinho.find(item => item.produto_id === produto.id);
        let addedSuccessfully = false;

        if (itemInCarrinho) {
            if (itemInCarrinho.quantidade < produto.quantidade_em_estoque) {
                setCarrinho(carrinho.map(item =>
                    item.produto_id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                ));
                addedSuccessfully = true;
            } else {
                showToast(`Estoque máximo para ${produto.nome} atingido.`, { type: 'warning' });
            }
        } else {
            if (produto.quantidade_em_estoque > 0) {
                setCarrinho([...carrinho, { 
                    produto_id: produto.id,
                    produto_nome: produto.nome,
                    quantidade: 1, 
                    preco_unitario: produto.preco 
                }]);
                addedSuccessfully = true;
            } else {
                showToast(`${produto.nome} está fora de estoque.`, { type: 'error' });
            }
        }

        if (addedSuccessfully) {
            setAnimationState({
                key: Date.now(),
                productImage: produto.imagem || 'https://via.placeholder.com/50',
                startPosition,
            });
            showToast(`"${produto.nome}" adicionado ao carrinho!`, { type: 'success' });
        }
        return addedSuccessfully;
    };

    const removeFromCarrinho = (produtoId) => {
        setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
        showToast('Item removido do carrinho.', { type: 'info' });
    };

    const incrementQuantity = (produtoId) => {
        setCarrinho(prevCarrinho => {
            return prevCarrinho.map(item => {
                if (item.produto_id === produtoId) {
                    const produtoInfo = produtos.find(p => p.id === produtoId);
                    if (item.quantidade < produtoInfo.quantidade_em_estoque) {
                        return { ...item, quantidade: item.quantidade + 1 };
                    } else {
                        showToast(`Estoque máximo para ${item.produto_nome} atingido.`, { type: 'warning' });
                    }
                }
                return item;
            });
        });
    };

    const decrementQuantity = (produtoId) => {
        setCarrinho(prevCarrinho => {
            const updatedCarrinho = prevCarrinho.map(item => {
                if (item.produto_id === produtoId) {
                    return { ...item, quantidade: item.quantidade - 1 };
                }
                return item;
            }).filter(item => item.quantidade > 0);

            if (updatedCarrinho.length < prevCarrinho.length) {
                showToast('Item removido do carrinho.', { type: 'info' });
            }
            return updatedCarrinho;
        });
    };

    const updateQuantidade = (produtoId, quantidade) => {
        const produtoInfo = produtos.find(p => p.id === produtoId);
        if (quantidade > produtoInfo.quantidade_em_estoque) {
            showToast(`Estoque máximo para o produto é ${produtoInfo.quantidade_em_estoque}.`, { type: 'warning' });
            return;
        }
        if (quantidade <= 0) {
            setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
        } else {
            setCarrinho(carrinho.map(item =>
                item.produto_id === produtoId ? { ...item, quantidade } : item
            ));
        }
    };

    const totalCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade * parseFloat(item.preco_unitario), 0);

    const handleSubmit = async () => {
        if (!selectedStudio) {
            showToast('Por favor, selecione um estúdio.', { type: 'warning' });
            return;
        }
        if (carrinho.length === 0) {
            showToast('Adicione pelo menos um produto ao carrinho.', { type: 'warning' });
            return;
        }
        setSubmitting(true);

        const produtosVendidosParaAPI = carrinho.map(item => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
        }));

        const vendaData = {
            studio_id: selectedStudio,
            aluno_id: selectedAluno ? selectedAluno.usuario_id : null,
            produtos_vendidos: produtosVendidosParaAPI,
        };

        console.log("[DEBUG] Conteúdo do carrinho antes de mapear:", carrinho); // LOG 1
        console.log("[DEBUG] produtos_vendidos enviados para a API:", produtosVendidosParaAPI); // LOG 2
        console.log("[DEBUG] vendaData completa enviada para a API:", vendaData); // LOG 3

        try {
            const vendaResponse = await vendasService.createVenda(vendaData);
            const novaVenda = vendaResponse.data;
            
            console.log("[DEBUG] Venda criada com ID:", novaVenda.id);

            const pagamentoData = {
                venda_id: novaVenda.id,
                valor_total: totalCarrinho.toFixed(2),
                status: statusPagamento,
                data_vencimento: new Date().toISOString().split('T')[0],
                data_pagamento: statusPagamento === 'PAGO' ? new Date().toISOString().split('T')[0] : null,
                metodo_pagamento: metodoPagamento,
            };

            console.log("[DEBUG] Dados do Pagamento enviados:", pagamentoData);

            await financeiroService.createPagamento(pagamentoData);
            
            showToast('Venda e pagamento registrados com sucesso!', { type: 'success' });
            navigate('/vendas');

        } catch (error) {
            console.error("[ERRO NA VENDA] Detalhes do erro:", error.response?.data);
            let errorMessage = 'Erro ao registrar a venda.';
            if (error.response?.data?.non_field_errors) {
                errorMessage = error.response.data.non_field_errors.join(' ');
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            
            if (error.response?.data?.non_field_errors && error.response.data.non_field_errors.includes('Um pagamento deve estar associado a uma matrícula ou a uma venda.')) {
                errorMessage = 'Venda registrada, mas houve um erro ao registrar o pagamento. Por favor, verifique na gestão financeira.';
            }

            showToast(errorMessage, { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        loading,
        submitting,
        allStudios,
        selectedStudio,
        setSelectedStudio,
        produtos,
        alunos: filteredAlunos,
        carrinho,
        totalCarrinho,
        selectedAluno,
        metodoPagamento,
        statusPagamento,
        animationState,
        setMetodoPagamento,
        setStatusPagamento,
        setSelectedAluno,
        setSearchQuery,
        addToCarrinho,
        removeFromCarrinho,
        incrementQuantity,
        decrementQuantity,
        updateQuantidade,
        handleSubmit,
    };
};

export default useCadastrarVendaViewModel;
