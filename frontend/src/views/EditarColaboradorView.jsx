import React, { useRef, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useEditarColaboradorViewModel from "../viewmodels/useEditarColaboradorViewModel";
import Header from "../components/Header";
import PageHeader from "../components/PageHeader";
import FormInput from "../components/FormInput";
import PhoneInput from "../components/PhoneInput";

const EditarColaboradorView = () => {
  const navigate = useNavigate();
  const { cpf } = useParams();
  const { formData, loading, error, handleChange, handleSubmit } =
    useEditarColaboradorViewModel();

  // Detectar mudanças no form para prevenir perda ao navegar
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Salva dados originais quando carregados
  useEffect(() => {
    if (formData && !originalData) {
      setOriginalData(formData);
    }
  }, [formData, originalData]);

  // Verifica se houve mudanças
  useEffect(() => {
    if (originalData) {
      const hasAnyChanges =
        JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(hasAnyChanges);
    }
  }, [formData, originalData]);

  // Previne navegação se houver mudanças não salvas
  useEffect(() => {
    if (hasChanges) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "Tem alterações não salvas. Deseja sair mesmo assim?";
        return "Tem alterações não salvas. Deseja sair mesmo assim?";
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [hasChanges]);

  // Handler personalizado para voltar com confirmação
  const handleBack = () => {
    if (hasChanges) {
      const proceed = window.confirm(
        "Você tem alterações não salvas no formulário. Deseja abandonar as alterações?"
      );
      if (proceed) {
        navigate(`/colaboradores/${cpf}`);
      }
    } else {
      navigate(`/colaboradores/${cpf}`);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      {/* PageHeader com botão de voltar personalizado */}
      <PageHeader
        title="Editar Colaborador"
        subtitle="Atualizar informações do colaborador"
        backTo={`/colaboradores/${cpf}`}
        backLabel="Voltar para Detalhes do Colaborador"
        showBreadcrumb={false}
        onBack={handleBack}
      />

      <main className="flex flex-col items-center p-4 pb-8">
        <div className="bg-card-light dark:bg-card-dark shadow-md rounded-lg w-full max-w-4xl">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Carregando dados do colaborador...
                  </p>
                </div>
              </div>
            )}

            {!loading && (
              <>
                {/* Feedback de erro */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      Erro ao carregar dados:{" "}
                      {error.message || "Ocorreu um erro inesperado"}
                    </p>
                  </div>
                )}

                <div className="space-y-8">
                  {/* Dados de Acesso */}
                  <div>
                    <h3 className="text-text-light dark:text-text-dark text-xl font-bold mb-4">
                      Dados de Acesso
                    </h3>
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-6 border border-action-secondary dark:border-action-primary/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          label="Username"
                          name="username"
                          type="text"
                          value={formData.username || ""}
                          onChange={handleChange}
                          placeholder="nome.de.usuario"
                          disabled={loading}
                        />
                        <FormInput
                          label="CPF"
                          name="cpf"
                          type="text"
                          value={formData.cpf || ""}
                          onChange={handleChange}
                          placeholder="123.456.789-00"
                          disabled={loading}
                        />
                        <FormInput
                          label="E-mail"
                          name="email"
                          type="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          placeholder="email@exemplo.com"
                          disabled={loading}
                          className="md:col-span-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados Pessoais e Profissionais */}
                  <div>
                    <h3 className="text-text-light dark:text-text-dark text-xl font-bold mb-4">
                      Dados Pessoais e Profissionais
                    </h3>
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-6 border border-action-secondary dark:border-action-primary/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          label="Nome Completo"
                          name="nome_completo"
                          type="text"
                          value={formData.nome_completo || ""}
                          onChange={handleChange}
                          placeholder="Nome completo do colaborador"
                          disabled={loading}
                          className="md:col-span-2"
                        />
                        <FormInput
                          label="Registro Profissional"
                          name="registro_profissional"
                          type="text"
                          value={formData.registro_profissional || ""}
                          onChange={handleChange}
                          placeholder="CREF 12345-G/SP"
                          disabled={loading}
                        />
                        <FormInput
                          label="Data de Nascimento"
                          name="data_nascimento"
                          type="date"
                          value={formData.data_nascimento || ""}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <PhoneInput
                          id="telefone"
                          name="telefone"
                          label="Telefone"
                          placeholder="(11) 98765-4321"
                          value={formData.telefone || ""}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <FormInput
                          label="Data de Admissão"
                          name="data_admissao"
                          type="date"
                          value={formData.data_admissao || ""}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <FormInput
                          label="Data de Demissão"
                          name="data_demissao"
                          type="date"
                          value={formData.data_demissao || ""}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label
                            htmlFor="status"
                            className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2"
                          >
                            Status
                          </label>
                          <select
                            name="status"
                            id="status"
                            value={formData.status || "ATIVO"}
                            onChange={handleChange}
                            disabled={loading}
                            className="form-select appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-action-primary/50 border border-action-secondary dark:border-action-primary/20 bg-input-background-light dark:bg-input-background-dark focus:border-action-primary h-14 p-[15px] text-base font-normal leading-normal"
                          >
                            <option value="ATIVO">Ativo</option>
                            <option value="INATIVO">Inativo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vínculos com Studios */}
                  {formData.vinculos_studio &&
                    formData.vinculos_studio.length > 0 && (
                      <div>
                        <h3 className="text-text-light dark:text-text-dark text-xl font-bold mb-4">
                          Vínculos com Studios
                        </h3>
                        <div className="space-y-4">
                          {formData.vinculos_studio.map((vinculo) => (
                            <div
                              key={vinculo.studio_id}
                              className="bg-background-light dark:bg-background-dark rounded-lg p-6 border border-action-secondary dark:border-action-primary/20"
                            >
                              <h4 className="text-text-light dark:text-text-dark font-bold text-lg mb-3">
                                {vinculo.studio_nome}
                              </h4>
                              <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm font-medium mb-3">
                                Permissões nesta Unidade
                              </p>
                              <ul className="space-y-2">
                                {vinculo.permissoes.map((permissao) => (
                                  <li
                                    key={permissao}
                                    className="flex items-center gap-3 text-text-light dark:text-text-dark text-sm"
                                  >
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                                      check_circle
                                    </span>
                                    <span>{permissao}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Endereço */}
                  <div>
                    <h3 className="text-text-light dark:text-text-dark text-xl font-bold mb-4">
                      Endereço
                    </h3>
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-6 border border-action-secondary dark:border-action-primary/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                          label="CEP"
                          name="endereco.cep"
                          type="text"
                          value={formData.endereco?.cep || ""}
                          onChange={handleChange}
                          placeholder="01234-567"
                          disabled={loading}
                        />
                        <FormInput
                          label="Logradouro"
                          name="endereco.logradouro"
                          type="text"
                          value={formData.endereco?.logradouro || ""}
                          onChange={handleChange}
                          placeholder="Rua dos Bobos"
                          disabled={loading}
                          className="md:col-span-2"
                        />
                        <FormInput
                          label="Número"
                          name="endereco.numero"
                          type="text"
                          value={formData.endereco?.numero || ""}
                          onChange={handleChange}
                          placeholder="Nº 0"
                          disabled={loading}
                        />
                        <FormInput
                          label="Complemento"
                          name="endereco.complemento"
                          type="text"
                          value={formData.endereco?.complemento || ""}
                          onChange={handleChange}
                          placeholder="Apto 101"
                          disabled={loading}
                        />
                        <FormInput
                          label="Bairro"
                          name="endereco.bairro"
                          type="text"
                          value={formData.endereco?.bairro || ""}
                          onChange={handleChange}
                          placeholder="Centro"
                          disabled={loading}
                        />
                        <FormInput
                          label="Cidade"
                          name="endereco.cidade"
                          type="text"
                          value={formData.endereco?.cidade || ""}
                          onChange={handleChange}
                          placeholder="São Paulo"
                          disabled={loading}
                        />
                        <FormInput
                          label="Estado"
                          name="endereco.estado"
                          type="text"
                          value={formData.endereco?.estado || ""}
                          onChange={handleChange}
                          placeholder="SP"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center justify-between pt-6 border-t border-action-secondary dark:border-action-primary/20">
                  <Link
                    to={`/colaboradores/${cpf}`}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark text-base font-medium leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-action-primary text-text-light text-base font-bold leading-normal tracking-[0.015em] hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-primary/50 dark:focus:ring-offset-background-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="truncate">
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditarColaboradorView;
