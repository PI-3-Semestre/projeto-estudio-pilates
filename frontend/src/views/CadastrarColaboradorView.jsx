import React from 'react';
import useCadastrarColaboradorViewModel from '../viewmodels/useCadastrarColaboradorViewModel';

const CadastrarColaboradorView = () => {
    const {
        userInfo,
        formData,
        loading,
        error,
        studios,
        perfis,
        handleChange,
        handleEnderecoChange,
        handlePerfilChange,
        handleVinculoChange,
        handleVinculoPermissaoChange,
        addVinculo,
        removeVinculo,
        handleSubmit,
    } = useCadastrarColaboradorViewModel();

    if (!userInfo) {
        return <div>Carregando...</div>; // Idealmente, um componente de loader
    }

    const inputClasses = "w-full rounded-md border-0 bg-input-light dark:bg-input-dark text-[#0d1b1a] dark:text-white placeholder-placeholder-light dark:placeholder-placeholder-dark focus:ring-2 focus:ring-inset focus:ring-primary";
    const labelClasses = "block text-sm font-medium text-[#0d1b1a] dark:text-gray-200 mb-1";

    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col items-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-2xl rounded-xl bg-card-light dark:bg-card-dark p-6 sm:p-8 shadow-lg">
                    <div className="text-center mb-6">
                        <h1 className="text-[#0d1b1a] dark:text-white text-[28px] font-bold leading-tight tracking-tight">
                            Cadastrar Perfil de Colaborador
                        </h1>
                        <p className="text-primary dark:text-primary/70 font-semibold text-sm mt-1">Etapa 2 de 2</p>
                        <p className="text-[#4c9a92] dark:text-primary/70 text-base mt-4">
                            Configurando perfil para: <span className="font-bold text-[#0d1b1a] dark:text-white">{userInfo.nome_completo}</span>
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Perfis */}
                        <div>
                            <h3 className="text-[#0d1b1a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Perfis*</h3>
                            <div className="space-y-2 rounded-md border border-input-light dark:border-input-dark bg-input-light/50 dark:bg-input-dark/30 p-4">
                                {perfis.map(perfil => (
                                    <div key={perfil.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`perfil-${perfil.id}`}
                                            value={perfil.id}
                                            onChange={handlePerfilChange}
                                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-card-light dark:bg-card-dark text-primary focus:ring-primary"
                                        />
                                        <label htmlFor={`perfil-${perfil.id}`} className="ml-2 block text-sm text-[#0d1b1a] dark:text-gray-200">
                                            {perfil.nome}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dados Principais */}
                        <div>
                            <h3 className="text-[#0d1b1a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Dados Principais</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses} htmlFor="registro_profissional">Registro Profissional</label>
                                    <input id="registro_profissional" name="registro_profissional" value={formData.registro_profissional} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses} htmlFor="data_nascimento">Data de Nascimento*</label>
                                    <input id="data_nascimento" name="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses} htmlFor="telefone">Telefone*</label>
                                    <input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses} htmlFor="data_admissao">Data de Admissão*</label>
                                    <input id="data_admissao" name="data_admissao" type="date" value={formData.data_admissao} onChange={handleChange} className={inputClasses} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClasses} htmlFor="status">Status*</label>
                                    <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
                                        <option value="ATIVO">ATIVO</option>
                                        <option value="INATIVO">INATIVO</option>
                                        <option value="FERIAS">FÉRIAS</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Endereço */}
                        <div>
                            <h3 className="text-[#0d1b1a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Endereço</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className={labelClasses} htmlFor="cep">CEP*</label>
                                    <input id="cep" name="cep" value={formData.endereco.cep} onChange={handleEnderecoChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses} htmlFor="logradouro">Logradouro*</label>
                                    <input id="logradouro" name="logradouro" value={formData.endereco.logradouro} onChange={handleEnderecoChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses} htmlFor="numero">Número*</label>
                                    <input id="numero" name="numero" value={formData.endereco.numero} onChange={handleEnderecoChange} className={inputClasses} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClasses} htmlFor="complemento">Complemento</label>
                                    <input id="complemento" name="complemento" value={formData.endereco.complemento} onChange={handleEnderecoChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses} htmlFor="bairro">Bairro*</label>
                                    <input id="bairro" name="bairro" value={formData.endereco.bairro} onChange={handleEnderecoChange} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses} htmlFor="cidade">Cidade*</label>
                                    <input id="cidade" name="cidade" value={formData.endereco.cidade} onChange={handleEnderecoChange} className={inputClasses} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClasses} htmlFor="estado">Estado*</label>
                                    <input id="estado" name="estado" value={formData.endereco.estado} onChange={handleEnderecoChange} className={inputClasses} />
                                </div>
                            </div>
                        </div>

                        {/* Vínculos com Studios */}
                        <div>
                            <h3 className="text-[#0d1b1a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Vínculos com Studios</h3>
                            <div className="space-y-6">
                                {formData.vinculos_studio.map((vinculo, index) => (
                                    <div key={index} className="rounded-lg border border-primary/20 p-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className={labelClasses} htmlFor={`studio_id_${index}`}>Studio*</label>
                                                <select id={`studio_id_${index}`} value={vinculo.studio_id} onChange={(e) => handleVinculoChange(index, 'studio_id', e.target.value)} className={inputClasses}>
                                                    <option value="">Selecione um studio</option>
                                                    {studios.map(studio => (
                                                        <option key={studio.id} value={studio.id}>{studio.nome}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`${labelClasses} mb-2`}>Permissões para este studio*</label>
                                                <div className="space-y-2 rounded-md border border-input-light dark:border-input-dark bg-input-light/50 dark:bg-input-dark/30 p-4">
                                                    {/* Mock permissions, replace with actual data */}
                                                    {[ {id: 1, nome: 'ADMINISTRADOR'}, {id: 2, nome: 'RECEPCIONISTA'}, {id: 3, nome: 'FISIOTERAPEUTA'}, {id: 4, nome: 'INSTRUTOR'} ].map(p => (
                                                        <div key={p.id} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                id={`permissao_${index}_${p.id}`}
                                                                checked={vinculo.permissao_ids.includes(p.id)}
                                                                onChange={() => handleVinculoPermissaoChange(index, p.id)}
                                                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-card-light dark:bg-card-dark text-primary focus:ring-primary"
                                                            />
                                                            <label htmlFor={`permissao_${index}_${p.id}`} className="ml-2 block text-sm text-[#0d1b1a] dark:text-gray-200">{p.nome}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeVinculo(index)} className="text-red-500 hover:text-red-700 text-sm font-medium mt-3 inline-flex items-center gap-1">
                                            <span className="material-symbols-outlined text-base">delete</span>
                                            Remover Vínculo
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={addVinculo} className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-primary/40 px-4 py-2 text-primary font-semibold transition-colors hover:bg-primary/10">
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Adicionar Outro Studio
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-center">{JSON.stringify(error)}</p>}
                        
                        <div className="pt-4">
                            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-3.5 text-base font-bold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                {loading ? 'Salvando...' : 'Salvar Colaborador'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CadastrarColaboradorView;