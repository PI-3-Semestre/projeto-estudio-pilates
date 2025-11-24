import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useEditarAlunoViewModel from "../viewmodels/useEditarAlunoViewModel";
import PhoneInput from "../components/PhoneInput";
import PageHeader from "../components/PageHeader";

const EditarAlunoView = () => {
  const navigate = useNavigate();
  const { cpf } = useParams();
  const {
    formData,
    loading,
    saving,
    error,
    studios,
    handleChange,
    handleFileChange,
    handleSubmit,
  } = useEditarAlunoViewModel();

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

  const handleBack = () => {
    if (hasChanges) {
      const proceed = window.confirm(
        "Você tem alterações não salvas no formulário. Deseja abandonar as alterações?"
      );
      if (proceed) {
        navigate(`/alunos/${cpf}`);
      }
    } else {
      navigate(`/alunos/${cpf}`);
    }
  };

  // Helper function to format photo URL for display
  const formatImageUrl = (url) => {
    if (!url) return "";
    // If it's already a data URL, return as is
    if (url.startsWith("data:")) {
      return url;
    }
    // If it's base64 (from file input), format as data URL
    return `data:image/jpeg;base64,${url}`;
  };

  const fileInputRef = useRef(null);

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Carregando dados do aluno...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      <PageHeader
        title="Editar Perfil do Aluno"
        subtitle="Modificar informações do aluno"
        backTo={`/alunos/${cpf}`}
        backLabel="Voltar para Detalhes do Aluno"
        showBreadcrumb={false}
        onBack={handleBack}
      />
      <main className="flex flex-col items-center p-4 pb-8">
        <div className="bg-card-light dark:bg-card-dark shadow-md rounded-lg w-full max-w-2xl">
          <div className="p-6 md:p-8">
            <div className="flex w-full flex-col gap-4 items-center mb-6">
              <div className="relative">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-card-light dark:border-card-dark shadow-sm"
                  style={{
                    backgroundImage: `url(${
                      formatImageUrl(formData.foto) || ""
                    })`,
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
                  {formData.nome || "Nome do Aluno"}
                </p>
                <p className="text-text-subtle-light dark:text-text-subtle-dark text-base font-normal leading-normal text-center">
                  {formData.email || "email@exemplo.com"}
                </p>
              </div>
            </div>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col w-full">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                  Nome Completo
                </p>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-action-primary/50 border border-action-secondary dark:border-action-primary/20 bg-input-background-light dark:bg-input-background-dark focus:border-action-primary h-14 placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark p-[15px] text-base font-normal leading-normal"
                  placeholder="Digite o nome completo"
                  type="text"
                  disabled={saving}
                />
              </label>
              <label className="flex flex-col w-full">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                  Email
                </p>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-action-primary/50 border border-action-secondary dark:border-action-primary/20 bg-input-background-light dark:bg-input-background-dark focus:border-action-primary h-14 placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark p-[15px] text-base font-normal leading-normal"
                  placeholder="email@exemplo.com"
                  type="email"
                  disabled={saving}
                />
              </label>
              <label className="flex flex-col w-full">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                  Data de Nascimento
                </p>
                <div className="relative flex w-full items-stretch rounded-xl">
                  <input
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-action-primary/50 border border-action-secondary dark:border-action-primary/20 bg-input-background-light dark:bg-input-background-dark focus:border-action-primary h-14 placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark p-[15px] text-base font-normal leading-normal"
                    placeholder="DD/MM/AAAA"
                    type="text"
                    disabled={saving}
                  />
                  <div className="absolute inset-y-0 right-0 text-text-subtle-light dark:text-text-subtle-dark flex items-center justify-center pr-4 pointer-events-none">
                    <span className="material-symbols-outlined">
                      calendar_today
                    </span>
                  </div>
                </div>
              </label>
              <PhoneInput
                id="contato"
                name="contato"
                label="Telefone (WhatsApp)"
                placeholder="(11) 98765-4321"
                value={formData.contato}
                onChange={handleChange}
                disabled={saving}
              />
              <label className="flex flex-col w-full">
                <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
                  Profissão
                </p>
                <input
                  name="profissao"
                  value={formData.profissao}
                  onChange={handleChange}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-action-primary/50 border border-action-secondary dark:border-action-primary/20 bg-input-background-light dark:bg-input-background-dark focus:border-action-primary h-14 placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark p-[15px] text-base font-normal leading-normal"
                  placeholder="Digite a profissão"
                  type="text"
                  disabled={saving}
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
                  className="form-select appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-action-primary/50 border border-action-secondary dark:border-action-primary/20 bg-input-background-light dark:bg-input-background-dark focus:border-action-primary h-14 p-[15px] text-base font-normal leading-normal"
                  disabled={saving}
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
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-action-secondary dark:bg-action-primary/20 rounded-full peer peer-focus:ring-2 peer-focus:ring-action-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-primary"></div>
                </label>
              </div>
              {error &&
                (typeof error === "object" ? (
                  <div className="text-red-500 text-sm space-y-1">
                    {Object.entries(error).map(([field, message]) => (
                      <p key={field} className="capitalize">
                        {field}: {message}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-500 text-sm">
                    {typeof error === "string" ? error : JSON.stringify(error)}
                  </p>
                ))}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-action-primary text-text-light text-base font-bold leading-normal tracking-[0.015em] hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-action-primary/50 dark:focus:ring-offset-background-dark transition-colors"
                >
                  <span className="truncate">
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditarAlunoView;
