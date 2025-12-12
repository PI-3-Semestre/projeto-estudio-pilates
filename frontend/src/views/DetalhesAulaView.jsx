import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useDetalhesAulaViewModel from "../viewmodels/useDetalhesAulaViewModel";
import PageHeader from "../components/PageHeader";

const DetalhesAulaView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inscritos");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [cpf, setCpf] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteAulaModalOpen, setIsDeleteAulaModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
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
    handleDeleteAula,
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

  const pageActions = [
    {
      label: "Editar Aula",
      icon: "edit",
      onClick: () => navigate(`/aulas/${id}/editar`),
      variant: "secondary",
    },
    {
      label: "Deletar Aula",
      icon: "delete",
      onClick: () => setIsDeleteAulaModalOpen(true),
      variant: "danger",
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
      <PageHeader
        title={`${aula.nome} - ${aula.horario}`}
        backTo="/agenda"
        backLabel="Voltar para Agenda"
        actions={pageActions}
      />

      <main className="flex flex-col flex-1">
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                <span className="material-symbols-outlined text-primary text-xl">
                  school
                </span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {aula.modalidade?.nome || aula.nome}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {aula.data} • {aula.horario}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Tipo da Aula */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg">
                    event_note
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Tipo da Aula
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {aula.tipo_aula === "REGULAR"
                      ? "Aula Regular"
                      : aula.tipo_aula === "REPOSICAO"
                      ? "Reposição"
                      : aula.tipo_aula}
                  </p>
                </div>
              </div>

              {/* Instrutor */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">
                    person
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Instrutor
                    {aula.instrutor_substituto &&
                    aula.instrutor_substituto !== aula.instrutor_principal
                      ? "es"
                      : ""}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {aula.instrutor_principal}
                  </p>
                  {aula.instrutor_substituto &&
                    aula.instrutor_substituto !== aula.instrutor_principal && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Substituto: {aula.instrutor_substituto}
                      </p>
                    )}
                  {aula.instrutor?.telefone && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Tel: {aula.instrutor.telefone}
                    </p>
                  )}
                  {aula.instrutor?.email && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Email: {aula.instrutor.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Local */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-lg">
                    location_on
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Local
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {aula.studio?.nome}
                  </p>
                </div>
              </div>

              {/* Capacidade */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-lg">
                    group
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Capacidade
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {aula.capacidade_maxima} vagas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="sticky top-16 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4">
            <div className="flex justify-between">
              <button
                onClick={() => setActiveTab("inscritos")}
                className={`flex flex-1 flex-col items-center justify-center border-b-[.1875rem] pb-[.8125rem] pt-4 ${
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
                className={`flex flex-1 flex-col items-center justify-center border-b-[.1875rem] pb-[.8125rem] pt-4 ${
                  activeTab === "espera"
                    ? "border-b-primary text-gray-900 dark:text-gray-100"
                    : "border-b-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                <p className="text-sm font-bold tracking-[0.015em]">Espera</p>
              </button>
              <button
                onClick={() => setActiveTab("adicionar")}
                className={`flex flex-1 flex-col items-center justify-center border-b-[.1875rem] pb-[.8125rem] pt-4 ${
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
                      <div className="flex gap-1 sm:gap-2 shrink-0 sm:self-center">
                        <button
                          onClick={() => {
                            setSelectedStudent(aluno);
                            setIsStudentModalOpen(true);
                          }}
                          className="flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40"
                        >
                          <span className="material-symbols-outlined text-sm text-blue-500">
                            info
                          </span>
                        </button>
                        <div className="relative">
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

      {isDeleteAulaModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setIsDeleteAulaModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Confirmar exclusão da aula
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Tem certeza de que deseja cancelar/excluir esta aula? Esta ação
              não pode ser desfeita e afetará todos os alunos inscritos.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteAulaModalOpen(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    await handleDeleteAula();
                    navigate("/agenda"); // Navigate back after deletion
                  } catch (error) {
                    // Error is handled in viewmodel
                  } finally {
                    setIsDeleteAulaModalOpen(false);
                  }
                }}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Deletar Aula
              </button>
            </div>
          </div>
        </div>
      )}

      {isStudentModalOpen && selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => {
            setIsStudentModalOpen(false);
            setSelectedStudent(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Detalhes do Aluno
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-16 w-16"
                  style={{
                    backgroundImage: `url(${
                      selectedStudent.foto || "https://via.placeholder.com/150"
                    })`,
                  }}
                ></div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {selectedStudent.nome}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status:{" "}
                    {
                      statusOptions.find(
                        (opt) => opt.value === selectedStudent.status
                      )?.label
                    }
                  </p>
                </div>
              </div>
              {selectedStudent.aluno?.telefone && (
                <p className="text-base text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Telefone:</span>{" "}
                  {selectedStudent.aluno.telefone}
                </p>
              )}
              {selectedStudent.aluno?.email && (
                <p className="text-base text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Email:</span>{" "}
                  {selectedStudent.aluno.email}
                </p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setIsStudentModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalhesAulaView;
