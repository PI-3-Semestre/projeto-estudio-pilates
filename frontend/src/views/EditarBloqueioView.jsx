import React from 'react';
import { Link } from 'react-router-dom';
import { useEditarBloqueioViewModel } from '../viewmodels/useEditarBloqueioViewModel';
import Header from '../components/Header';
import FormInput from '../components/FormInput';

const EditarBloqueioView = () => {
    const {
        data,
        setData,
        descricao,
        setDescricao,
        selectedStudio,
        setSelectedStudio,
        studios,
        loading,
        saving,
        error,
        handleSubmit,
    } = useEditarBloqueioViewModel();

    if (loading) {
        return <p>Carregando...</p>;
    }

    return (
        <div className="flex h-screen flex-col">
            <Header title="Editar Bloqueio de Agenda" showBackButton={true} />
            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
                <form onSubmit={handleSubmit} className="mx-auto max-w-lg rounded-lg bg-white p-8 shadow-md dark:bg-card-dark">
                    <div className="mb-4">
                        <label htmlFor="studio" className="block text-sm font-medium text-text-light dark:text-text-dark">Studio</label>
                        <select
                            id="studio"
                            value={selectedStudio}
                            onChange={(e) => setSelectedStudio(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-background-dark dark:border-gray-600 dark:text-white sm:text-sm"
                            required
                        >
                            <option value="">Selecione um estúdio</option>
                            {studios.map(studio => (
                                <option key={studio.id} value={studio.id}>{studio.nome}</option>
                            ))}
                        </select>
                    </div>

                    <FormInput
                        label="Data"
                        type="date"
                        id="data"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        required
                    />

                    <FormInput
                        label="Descrição"
                        type="text"
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Ex: Feriado de Ano Novo"
                        required
                    />

                    {error && <p className="text-sm text-red-500">{JSON.stringify(error)}</p>}

                    <div className="mt-6 flex items-center justify-end gap-4">
                        <Link to="/bloqueios" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || !selectedStudio}
                            className="rounded-md bg-action-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-action-primary-dark focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditarBloqueioView;
