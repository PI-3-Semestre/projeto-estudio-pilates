import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useMarcarAulaViewModel from '../viewmodels/useMarcarAulaViewModel';

const MarcarAulaView = () => {
    const navigate = useNavigate();
    const {
        formData,
        modalidades,
        studios,
        instrutores, // Alterado de colaboradores para instrutores
        loading,
        error,
        success,
        isStaff,
        handleChange,
        handleDateTimeChange,
        handleSubmit,
    } = useMarcarAulaViewModel();

    const [dateInput, setDateInput] = useState('');
    const [timeInput, setTimeInput] = useState('');

    useEffect(() => {
        handleDateTimeChange(dateInput, timeInput);
    }, [dateInput, timeInput, handleDateTimeChange]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <p className="text-text-light dark:text-text-dark">Carregando...</p>
            </div>
        );
    }

    if (error && !isStaff) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col font-display bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4 shadow-sm">
                <button onClick={() => navigate(-1)} className="flex h-10 w-10 shrink-0 items-center justify-center text-text-light dark:text-text-dark">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-text-light dark:text-text-dark">
                    Criar Nova Aula</h1>
                <div className="h-10 w-10 shrink-0"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
                <form id="aula-form" onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
                    {/* Modalidade */}
                    <div className="flex flex-col">
                        <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="modalidade">Modalidade</label>
                        <div className="relative">
                            <select
                                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                                id="modalidade"
                                name="modalidade"
                                value={formData.modalidade || ''}
                                onChange={handleChange}
                                required
                            >
                                <option disabled value="">Selecione a modalidade</option>
                                {modalidades.map(mod => (
                                    <option key={mod.id} value={mod.id}>{mod.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Studio */}
                    <div className="flex flex-col">
                        <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="studio">Estúdio</label>
                        <div className="relative">
                            <select
                                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                                id="studio"
                                name="studio"
                                value={formData.studio || ''}
                                onChange={handleChange}
                                required
                            >
                                <option disabled value="">Selecione o estúdio</option>
                                {studios.map(studio => (
                                    <option key={studio.id} value={studio.id}>{studio.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Instrutor Principal */}
                    <div className="flex flex-col">
                        <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="instrutor_principal">Instrutor Principal</label>
                        <div className="relative">
                            <select
                                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                                id="instrutor_principal"
                                name="instrutor_principal"
                                value={formData.instrutor_principal || ''}
                                onChange={handleChange}
                                required
                            >
                                <option disabled value="">Selecione um instrutor</option>
                                {instrutores.map(colab => (
                                    <option key={colab.usuario} value={colab.usuario}>{colab.nome_completo}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Instrutor Substituto */}
                    <div className="flex flex-col">
                        <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="instrutor_substituto">Instrutor Substituto (Opcional)</label>
                        <div className="relative">
                            <select
                                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                                id="instrutor_substituto"
                                name="instrutor_substituto"
                                value={formData.instrutor_substituto || ''}
                                onChange={handleChange}
                            >
                                <option value="">Nenhum</option>
                                {instrutores.map(colab => (
                                    <option key={colab.usuario} value={colab.usuario}>{colab.nome_completo}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Capacidade */}
                    <div className="flex flex-col">
                        <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="capacidade_maxima">Capacidade Máxima</label>
                        <input
                            className="h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                            id="capacidade_maxima"
                            name="capacidade_maxima"
                            type="number"
                            placeholder="Ex: 15"
                            value={formData.capacidade_maxima}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Duração em Minutos */}
                    <div className="flex flex-col">
                        <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="duracao_minutos">Duração (minutos)</label>
                        <input
                            className="h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                            id="duracao_minutos"
                            name="duracao_minutos"
                            type="number"
                            placeholder="Ex: 60"
                            value={formData.duracao_minutos}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Tipo de Aula */}
                    <div className="flex flex-col">
                        <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="tipo_aula">Tipo de Aula</label>
                        <div className="relative">
                            <select
                                className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark"
                                id="tipo_aula"
                                name="tipo_aula"
                                value={formData.tipo_aula}
                                onChange={handleChange}
                            >
                                <option value="REGULAR">Regular</option>
                                <option value="EXPERIMENTAL">Experimental</option>
                                <option value="REPOSICAO">Reposição</option>
                            </select>
                        </div>
                    </div>

                    {/* Date and Time Picker */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Data */}
                        <div className="flex flex-col">
                            <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="dateInput">Data</label>
                            <div className="relative">
                                <input
                                    className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark dark:[color-scheme:dark]"
                                    id="dateInput"
                                    type="date"
                                    value={dateInput}
                                    onChange={(e) => setDateInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {/* Horário */}
                        <div className="flex flex-col">
                            <label className="pb-2 text-base font-medium leading-normal text-text-light dark:text-text-dark" htmlFor="timeInput">Horário</label>
                            <div className="relative">
                                <input
                                    className="form-input h-14 w-full rounded-lg border border-border-light bg-white p-4 text-base font-normal text-text-light placeholder:text-placeholder-light focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-placeholder-dark dark:[color-scheme:dark]"
                                    id="timeInput"
                                    type="time"
                                    value={timeInput}
                                    onChange={(e) => setTimeInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {success && <p className="text-green-500 text-center">Aula criada com sucesso!</p>}
                </form>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light p-4 dark:bg-background-dark">
                <div className="mx-auto max-w-lg">
                    <button
                        type="submit"
                        form="aula-form" // Link button to form
                        className="w-full rounded-xl bg-primary px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar Aula'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default MarcarAulaView;
