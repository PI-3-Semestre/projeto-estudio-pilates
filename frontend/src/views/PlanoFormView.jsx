import React from 'react';
import { Link } from 'react-router-dom';
import usePlanoFormViewModel from '../viewmodels/usePlanoFormViewModel';
import Header from '../components/Header';
import FormInput from '../components/FormInput';

const PlanoFormView = () => {
    const {
        isEditMode,
        nome, setNome,
        duracaoDias, setDuracaoDias,
        creditosSemanais, setCreditosSemanais,
        preco, setPreco,
        errors,
        loading,
        saving,
        handleSubmit,
    } = usePlanoFormViewModel();

    if (loading) {
        return <p>Carregando dados do plano...</p>;
    }

    return (
        <div className="flex h-screen flex-col">
            <Header title={isEditMode ? 'Editar Plano' : 'Criar Novo Plano'} showBackButton={true} />
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
                <form onSubmit={handleSubmit} className="mx-auto max-w-lg rounded-lg bg-white p-8 shadow-md dark:bg-card-dark">
                    <FormInput
                        label="Nome do Plano"
                        type="text"
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Plano Mensal - 2x/semana"
                        error={errors.nome}
                        required
                    />
                    <FormInput
                        label="Duração do Plano (em dias)"
                        type="number"
                        id="duracaoDias"
                        value={duracaoDias}
                        onChange={(e) => setDuracaoDias(e.target.value)}
                        placeholder="Ex: 30"
                        error={errors.duracaoDias}
                        required
                    />
                    <FormInput
                        label="Créditos por Semana"
                        type="number"
                        id="creditosSemanais"
                        value={creditosSemanais}
                        onChange={(e) => setCreditosSemanais(e.target.value)}
                        placeholder="Ex: 2"
                        error={errors.creditosSemanais}
                        required
                    />
                    <FormInput
                        label="Preço"
                        type="number"
                        id="preco"
                        prefix="R$"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                        placeholder="350.00"
                        step="0.01"
                        error={errors.preco}
                        required
                    />

                    <div className="mt-6 flex items-center justify-end gap-4">
                        <Link to="/planos" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-md bg-action-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-action-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Plano')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default PlanoFormView;
