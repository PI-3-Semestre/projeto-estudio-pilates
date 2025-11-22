import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useCadastrarVendaViewModel from '../viewmodels/useCadastrarVendaViewModel';

const CadastrarVendaView = () => {
    const navigate = useNavigate();
    const {
        loading,
        submitting,
        allStudios,
        selectedStudio,
        setSelectedStudio,
        produtos,
        alunos,
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
        incrementQuantity, // Importa a nova função
        decrementQuantity, // Importa a nova função
        handleSubmit,
    } = useCadastrarVendaViewModel();

    const formatPrice = (price) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

    const cartRef = useRef(null);
    const [flyingImageStyle, setFlyingImageStyle] = useState({});
    const [isFlying, setIsFlying] = useState(false);
    const [buttonClickedStates, setButtonClickedStates] = useState({});

    // Efeito para controlar a animação da imagem
    useEffect(() => {
        if (animationState.productImage && animationState.startPosition && cartRef.current) {
            const cartRect = cartRef.current.getBoundingClientRect();
            const startRect = animationState.startPosition;

            setFlyingImageStyle({
                top: startRect.top + window.scrollY,
                left: startRect.left + window.scrollX,
                width: startRect.width,
                height: startRect.height,
                transition: 'none',
            });
            setIsFlying(true);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setFlyingImageStyle(prev => ({
                        ...prev,
                        top: cartRect.top + window.scrollY + (cartRect.height / 2) - 15,
                        left: cartRect.left + window.scrollX + (cartRect.width / 2) - 15,
                        width: '30px',
                        height: '30px',
                        transition: 'all 0.8s cubic-bezier(0.55, 0.055, 0.675, 0.19)',
                    }));
                });
            });

            const timer = setTimeout(() => {
                setIsFlying(false);
                setFlyingImageStyle({});
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [animationState]);

    const handleAddToCartClick = (e, produto) => {
        const buttonRect = e.currentTarget.getBoundingClientRect();
        const addedSuccessfully = addToCarrinho(produto, buttonRect);

        if (addedSuccessfully) {
            setButtonClickedStates(prev => ({ ...prev, [produto.id]: true }));
            setTimeout(() => {
                setButtonClickedStates(prev => ({ ...prev, [produto.id]: false }));
            }, 500);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            <Header title="Registrar Nova Venda" showBackButton={true} />

            <main className="flex-grow p-4 space-y-4">
                <div className="mx-auto max-w-7xl">
                    {/* Seletor de Estúdio */}
                    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">1. Selecione o Estúdio</h3>
                        <select
                            value={selectedStudio}
                            onChange={(e) => setSelectedStudio(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={loading}
                        >
                            <option value="">-- Escolha um estúdio --</option>
                            {allStudios.map((studio) => (
                                <option key={studio.id} value={studio.id}>
                                    {studio.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Conteúdo da Venda - Mostrado apenas se um estúdio for selecionado */}
                    {selectedStudio && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Coluna da Esquerda: Produtos e Alunos */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Busca de Aluno */}
                                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">2. Associe um Aluno (Opcional)</h3>
                                    {selectedAluno ? (
                                        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                            <p className="text-gray-800 dark:text-gray-200">{selectedAluno.nome}</p>
                                            <button onClick={() => setSelectedAluno(null)} className="text-red-500 hover:text-red-700">Remover</button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                placeholder="Digite o nome do aluno..."
                                            />
                                            {alunos.length > 0 && (
                                                <ul className="mt-2 border border-gray-200 dark:border-gray-600 rounded-md max-h-40 overflow-y-auto">
                                                    {alunos.map(aluno => (
                                                        <li key={aluno.usuario_id} onClick={() => { setSelectedAluno(aluno); setSearchQuery(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                                            {aluno.nome}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Lista de Produtos */}
                                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">3. Adicione Produtos</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {produtos.map(produto => {
                                            const noEstoque = produto.quantidade_em_estoque > 0;
                                            const isButtonClicked = buttonClickedStates[produto.id];
                                            return (
                                                <div key={produto.id} className={`p-3 rounded-lg border ${noEstoque ? 'border-gray-200 dark:border-gray-700' : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'}`}>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200">{produto.nome}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatPrice(produto.preco)}</p>
                                                    <p className={`text-sm font-medium ${noEstoque ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        Estoque: {produto.quantidade_em_estoque}
                                                    </p>
                                                    <button
                                                        onClick={(e) => handleAddToCartClick(e, produto)}
                                                        disabled={!noEstoque}
                                                        className={`mt-2 w-full px-3 py-1 text-white text-sm font-semibold rounded-md transition-colors duration-300 ${
                                                            isButtonClicked ? 'bg-green-500' : 'bg-primary hover:bg-primary-dark'
                                                        } disabled:bg-gray-400`}
                                                    >
                                                        {isButtonClicked ? 'Adicionado!' : 'Adicionar'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Coluna da Direita: Carrinho e Pagamento */}
                            <div className="lg:col-span-1 space-y-6">
                                <div ref={cartRef} className="rounded-xl bg-white p-4 shadow-sm dark:bg-background-dark/50 sticky top-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Resumo da Venda</h3>
                                    {carrinho.length === 0 ? (
                                        <p className="text-center text-gray-500 dark:text-gray-400">O carrinho está vazio.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {carrinho.map(item => {
                                                const produtoOriginal = produtos.find(p => p.id === item.produto_id);
                                                const maxQuantity = produtoOriginal ? produtoOriginal.quantidade_em_estoque : item.quantidade; // Fallback
                                                return (
                                                    <div key={item.produto_id} className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.produto_nome}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(item.preco_unitario)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => decrementQuantity(item.produto_id)}
                                                                className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">remove</span>
                                                            </button>
                                                            <span className="w-8 text-center text-gray-800 dark:text-gray-200">{item.quantidade}</span>
                                                            <button
                                                                onClick={() => incrementQuantity(item.produto_id)}
                                                                disabled={item.quantidade >= maxQuantity}
                                                                className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">add</span>
                                                            </button>
                                                            <button
                                                                onClick={() => removeFromCarrinho(item.produto_id)}
                                                                className="text-red-500 hover:text-red-700 p-1 rounded-full"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <hr className="my-4 dark:border-gray-700" />

                                    {/* Pagamento */}
                                    <div className="space-y-3">
                                        <h4 className="font-bold text-gray-800 dark:text-white">Pagamento</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Método</label>
                                            <select value={metodoPagamento} onChange={e => setMetodoPagamento(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                                <option value="PIX">PIX</option>
                                                <option value="DINHEIRO">Dinheiro</option>
                                                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                                                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
                                            <select value={statusPagamento} onChange={e => setStatusPagamento(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                                <option value="PAGO">Pago</option>
                                                <option value="PENDENTE">Pendente</option>
                                            </select>
                                        </div>
                                    </div>

                                    <hr className="my-4 dark:border-gray-700" />

                                    <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
                                        <span>Total:</span>
                                        <span>{formatPrice(totalCarrinho)}</span>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || carrinho.length === 0}
                                        className="mt-4 w-full py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {submitting ? 'Processando...' : 'Finalizar Venda'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Imagem voadora da animação */}
            {isFlying && animationState.productImage && (
                <img
                    key={animationState.key}
                    src={animationState.productImage}
                    alt="Produto voando para o carrinho"
                    className="fly-to-cart-image"
                    style={flyingImageStyle}
                />
            )}
        </div>
    );
};

export default CadastrarVendaView;
