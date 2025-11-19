import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useDetalhesAulaViewModel from "../viewmodels/useDetalhesAulaViewModel";

const DetalhesAulaView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inscritos");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [cpf, setCpf] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const {
    aula,
    alunos,
    listaDeEspera,
    loading,
    error,
    foundStudent,
    handleStatusChange,
    handleDeleteAgendamento,
    handleRemoveFromWaitlist,
    handleSearchStudent,
    handleConfirmAdd,
  } = useDetalhesAulaViewModel(id);

  useEffect(() => {
    if (foundStudent) {
      setIsConfirmModalOpen(true);
    }
  }, [foundStudent]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Aula não encontrada.</p>
      </div>
    );
  }

  const statusOptions = [
    { value: "AGENDADO", label: "Agendado" },
    { value: "PRESENTE", label: "Presente" },
    { value: "AUSENTE_COM_REPO", label: "Ausente c/ Repo" },
    { value: "AUSENTE_SEM_REPO", label: "Ausente s/ Repo" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <header className="sticky top-0 z-10 flex flex-col bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-800 dark:text-gray-200"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {aula.nome} - {aula.horario}
          </h1>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-bold text-primary dark:text-primary">
              Editar
            </button>
            <button className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-800 dark:text-gray-200">
              <span className="material-symbols-outlined text-2xl">
                more_vert
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col flex-1">
        <section className="p-4 pt-2">
          <div className="flex flex-col items-stretch justify-start rounded-xl bg-white dark:bg-gray-800/50 shadow-sm @xl:flex-row @xl:items-start">
            <div
              className="w-full shrink-0 @xl:w-40 bg-center bg-no-repeat aspect-video @xl:aspect-square bg-cover rounded-t-xl @xl:rounded-l-xl @xl:rounded-tr-none"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBYAuo4zFvx_-UAHGzkmxe7DriE4_nj4gwDbwm76bAS-cRXyQfNggWChTXATU8ztvQwmQNbHbxDPYcQuiLsj1QTHEvZ126S-ljc0ENo-BXgtmmpjVHpAcfNJEwmQPcf_ct5U1ZM7_dCQtN0lSZj3ZWm13n3q4TXcH_Lb-i6LCES_LwgofzDCJGyXzMS9v3RbHmU9ErnVfA1sqk9ur4kT376aPROP76ui-lCJuRo2NOGuwGzmKeFEGp4rgNrVC1TfY7AcqctRPqVYdvG")`,
              }}
            ></div>
            <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-2 p-4">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Instrutor: {aula.instrutor_principal}
              </p>
              <div className="flex flex-col gap-1">
                <p className="text-base font-normal text-gray-600 dark:text-gray-400">
                  Vagas: {aula.vagasOcupadas}/{aula.capacidade_maxima}
                </p>
                <p className="text-base font-normal text-gray-600 dark:text-gray-400">
                  Data: {aula.data}
                </p>
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky top-[72px] z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4">
            <div className="flex justify-between">
              <button
                onClick={() => setActiveTab("inscritos")}
                className={`flex flex-1 flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                  activeTab === "inscritos"
                    ? "border-b-primary text-gray-900 dark:text-gray-100"
                    : "border-b-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                <p className="text-sm font-bold tracking-[0.015em]">
                  Inscritos
                </p>
              </button>
              <button
                onClick={() => setActiveTab("espera")}
                className={`flex flex-1 flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                  activeTab === "espera"
                    ? "border-b-primary text-gray-900 dark:text-gray-100"
                    : "border-b-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                <p className="text-sm font-bold tracking-[0.015em]">Espera</p>
              </button>
              <button
                onClick={() => setActiveTab("adicionar")}
                className={`flex flex-1 flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                  activeTab === "adicionar"
                    ? "border-b-primary text-gray-900 dark:text-gray-100"
                    : "border-b-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                <p className="text-sm font-bold tracking-[0.015em]">
                  Adicionar
                </p>
              </button>
            </div>
          </div>
        </nav>

        <div className="flex-grow pl-4 pr-0 pb-4">
          {activeTab === "inscritos" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 py-4">
                Alunos Inscritos ({alunos.length})
              </h3>
              <div className="flex flex-col gap-2">
                {alunos.map((aluno) => (
                  <div
                    key={aluno.id}
                    className="flex gap-2 sm:gap-4 bg-white dark:bg-gray-800/50 p-3 rounded-lg min-h-14"
                  >
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 shrink-0"
                      style={{
                        backgroundImage: `url(${
                          aluno.foto || "https://via.placeholder.com/150"
                        })`,
                      }}
                    ></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1">
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">
                        {aluno.nome}
                      </p>
                      <div className="relative shrink-0 sm:self-center">
                        <select
                          value={aluno.status}
                          onChange={(e) =>
                            handleStatusChange(aluno.id, e.target.value)
                          }
                          className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1.5 pl-2 pr-6 rounded-md leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary text-xs font-medium w-full sm:w-auto"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                          <span className="material-symbols-outlined text-base">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDeleteId(aluno.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="flex items-center justify-center p-2 bg-red-100 dark:bg-red-900/20 rounded-full hover:bg-red-200 dark:hover:bg-red-900/40"
                    >
                      <span className="material-symbols-outlined text-sm text-red-500">
                        delete
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "espera" && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 py-4">
                Lista de Espera ({listaDeEspera.length})
              </h3>
              {listaDeEspera.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-white dark:bg-gray-800 p-3 shadow-sm"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300">
                      {index + 1}º
                    </span>
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
                      style={{
                        backgroundImage: `url(${
                          item.aluno.foto || "https://via.placeholder.com/150"
                        })`,
                      }}
                    ></div>
                    <p className="truncate text-base font-normal text-gray-900 dark:text-gray-100">
                      {item.aluno.nome}
                    </p>
                  </div>
                  <div className="flex w-full shrink-0 justify-end gap-2 sm:w-auto">
                    <button
                      onClick={() => handleRemoveFromWaitlist(item.id)}
                      className="flex-1 rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 sm:flex-initial"
                    >
                      Remover
                    </button>
                    <button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white sm:flex-initial">
                      Mover para Aula
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "adicionar" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 py-4">
                Adicionar Aluno
              </h3>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Digite o CPF do aluno"
                    type="text"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!cpf.trim()) return;
                    setAddingStudent(true);
                    try {
                      await handleSearchStudent(cpf.trim());
                      setCpf("");
                    } finally {
                      setAddingStudent(false);
                    }
                  }}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg disabled:bg-primary/50"
                  disabled={addingStudent || !cpf.trim()}
                >
                  {addingStudent ? "Buscando..." : "Buscar e Adicionar à Aula"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isConfirmModalOpen && foundStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => {
            setIsConfirmModalOpen(false);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Confirmar adição do aluno
            </h2>
            <div className="mb-6">
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                Nome: {foundStudent.nome}
              </p>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                Email: {foundStudent.email}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleConfirmAdd(foundStudent.usuario_id);
                  setIsConfirmModalOpen(false);
                }}
                className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Confirmar exclusão
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Tem certeza de que deseja remover este aluno da aula?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleDeleteAgendamento(deleteId);
                  setIsDeleteModalOpen(false);
                }}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalhesAulaView;
