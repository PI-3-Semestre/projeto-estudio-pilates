import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCadastrarAlunoViewModel from "../viewmodels/useCadastrarAlunoViewModel";
import PhoneInput from "../components/PhoneInput";

const CadastrarAlunoView = () => {
  const {
    userInfo,
    formData,
    loading,
    error,
    studios,
    handleChange,
    handleFileChange,
    handleSubmit,
  } = useCadastrarAlunoViewModel();

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  if (loading && !userInfo) {
    return <div>Carregando dados iniciais...</div>;
  }
  
  if (!userInfo) {
    return <div>Não foi possível carregar os dados do usuário. <button onClick={() => navigate('/alunos/cadastrar')} className="underline">Voltar</button></div>;
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-text-light dark:text-text-dark flex size-12 shrink-0 items-center justify-center"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Completar Perfil
        </h1>
      </header>
      <main className="flex flex-col items-center p-4">
        <div className="bg-card-light dark:bg-card-dark shadow-md rounded-lg w-full max-w-2xl">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
                Completar Perfil do Aluno
              </h1>
              <p className="text-base text-text-subtle-light dark:text-text-subtle-dark">
                Fase 2 de Cadastro
              </p>
            </div>
            <div className="flex w-full flex-col gap-4 items-center mb-6">
              <div className="relative">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-card-light dark:border-card-dark shadow-sm"
                  style={{
                    backgroundImage: `url(${formData.fotoPreview || 'https://via.placeholder.com/128'})`,
                  }}
                ></div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 flex items-center justify-center size-10 bg-action-primary text-text-light rounded-full shadow-md hover:bg-action-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    photo_camera
                  </span>
                </button>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-text-light dark:text-text-dark text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                  {userInfo.nome_completo}
                </p>
                <p className="text-text-subtle-light dark:text-text-subtle-dark text-base font-normal leading-normal text-center">
                  {userInfo.email}
                </p>
              </div>
            </div>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col w-full">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                  Data de Nascimento
                </p>
                <input
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="form-input h-14"
                  placeholder="DD/MM/AAAA"
                  type="text"
                />
              </label>
              <PhoneInput
                id="contato"
                name="contato"
                label="Telefone (WhatsApp)"
                placeholder="(11) 98765-4321"
                value={formData.contato}
                onChange={handleChange}
              />
              <label className="flex flex-col w-full">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                  Profissão
                </p>
                <input
                  name="profissao"
                  value={formData.profissao}
                  onChange={handleChange}
                  className="form-input h-14"
                  placeholder="Digite a profissão"
                  type="text"
                />
              </label>
              <label className="flex flex-col w-full">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                  Unidade Principal
                </p>
                <select
                  name="unidade"
                  value={formData.unidade}
                  onChange={handleChange}
                  className="form-select h-14"
                >
                  <option value="">Selecione a unidade</option>
                  {studios.map((studio) => (
                    <option key={studio.id} value={studio.id}>
                      {studio.nome}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center justify-between mt-2">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
                  Aluno Ativo
                </p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-primary"></div>
                </label>
              </div>
              {error && <p className="text-red-500 text-center mt-2">{error}</p>}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-action-primary text-white font-bold rounded-xl"
                >
                  {loading ? "Salvando..." : "Salvar Perfil do Aluno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CadastrarAlunoView;
