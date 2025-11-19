import React from "react";
import { Link, useParams } from "react-router-dom";
import useEditarColaboradorViewModel from "../viewmodels/useEditarColaboradorViewModel";
import Header from "../components/Header";
import FormInput from "../components/FormInput";
import PhoneInput from "../components/PhoneInput";

const EditarColaboradorView = () => {
  const { cpf } = useParams();
  const { formData, loading, error, handleChange, handleSubmit } =
    useEditarColaboradorViewModel();

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8">
              <h2 className="text-gray-900 dark:text-white text-2xl font-bold">
                Editar Colaborador
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Atualize os dados do colaborador.
              </p>

              {loading && <p className="mt-4">Carregando...</p>}
              {error && (
                <p className="mt-4 text-red-500">
                  Ocorreu um erro ao salvar as alterações: {error.message}
                </p>
              )}

              <div className="mt-8 space-y-8">
                {/* Dados de Acesso */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Dados de Acesso
                  </h3>
                  <div className="mt-4 space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <FormInput
                      label="Username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="nome.de.usuario"
                    />
                    <FormInput
                      label="E-mail"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                    />
                    <FormInput
                      label="CPF"
                      name="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="123.456.789-00"
                    />
                  </div>
                </div>

                {/* Dados Pessoais */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Dados Pessoais e Profissionais
                  </h3>
                  <div className="mt-4 space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <FormInput
                      label="Nome Completo"
                      name="nome_completo"
                      type="text"
                      value={formData.nome_completo}
                      onChange={handleChange}
                      placeholder="Nome completo do colaborador"
                    />
                    <FormInput
                      label="Registro Profissional"
                      name="registro_profissional"
                      type="text"
                      value={formData.registro_profissional}
                      onChange={handleChange}
                      placeholder="CREF 12345-G/SP"
                    />
                    <FormInput
                      label="Data de Nascimento"
                      name="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={handleChange}
                    />
                    <PhoneInput
                      id="telefone"
                      name="telefone"
                      label="Telefone"
                      placeholder="(11) 98765-4321"
                      value={formData.telefone}
                      onChange={handleChange}
                    />
                    <FormInput
                      label="Data de Admissão"
                      name="data_admissao"
                      type="date"
                      value={formData.data_admissao}
                      onChange={handleChange}
                    />
                    <FormInput
                      label="Data de Demissão"
                      name="data_demissao"
                      type="date"
                      value={formData.data_demissao}
                      onChange={handleChange}
                    />
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="status"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Status
                      </label>
                      <select
                        name="status"
                        id="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-primary focus:border-primary"
                      >
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Vínculos com Studios */}
                {formData.vinculos_studio &&
                  formData.vinculos_studio.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Vínculos com Studios
                      </h3>
                      <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                        {formData.vinculos_studio.map((vinculo) => (
                          <div
                            key={vinculo.studio_id}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                          >
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {vinculo.studio_nome}
                            </h4>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                              Permissões
                            </p>
                            <ul className="mt-2 space-y-2">
                              {vinculo.permissoes.map((permissao) => (
                                <li
                                  key={permissao}
                                  className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                                >
                                  <span className="material-symbols-outlined text-primary text-base">
                                    check_box
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Endereço
                  </h3>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <FormInput
                      label="CEP"
                      name="endereco.cep"
                      type="text"
                      value={formData.endereco.cep}
                      onChange={handleChange}
                      placeholder="01234-567"
                      className="sm:col-span-1"
                    />
                    <FormInput
                      label="Logradouro"
                      name="endereco.logradouro"
                      type="text"
                      value={formData.endereco.logradouro}
                      onChange={handleChange}
                      placeholder="Rua dos Bobos"
                      className="sm:col-span-2"
                    />
                    <FormInput
                      label="Número"
                      name="endereco.numero"
                      type="text"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      placeholder="Nº 0"
                    />
                    <FormInput
                      label="Complemento"
                      name="endereco.complemento"
                      type="text"
                      value={formData.endereco.complemento}
                      onChange={handleChange}
                      placeholder="Apto 101"
                    />
                    <FormInput
                      label="Bairro"
                      name="endereco.bairro"
                      type="text"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      placeholder="Centro"
                    />
                    <FormInput
                      label="Cidade"
                      name="endereco.cidade"
                      type="text"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      placeholder="São Paulo"
                    />
                    <FormInput
                      label="Estado"
                      name="endereco.estado"
                      type="text"
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      placeholder="SP"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-4">
              <Link
                to={`/colaboradores/${cpf}`}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:underline"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">save</span>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditarColaboradorView;
