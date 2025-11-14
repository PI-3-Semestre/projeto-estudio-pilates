import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useDetalhesAulaViewModel from "../viewmodels/useDetalhesAulaViewModel";

const DetalhesAulaView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inscritos");
  const {
    aula,
    alunos,
    listaDeEspera,
    loading,
    error,
    handleStatusChange,
  } = useDetalhesAulaViewModel(id);

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
                <p className="text-sm font-bold tracking-[0.015em]">Inscritos</p>
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
                <p className="text-sm font-bold tracking-[0.015em]">Adicionar</p>
              </button>
            </div>
          </div>
        </nav>

        <div className="flex-grow px-4 pb-4">
          {activeTab === "inscritos" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 py-4">
                Alunos Inscritos ({alunos.length})
              </h3>
              <div className="flex flex-col gap-2">
                {alunos.map((aluno) => (
                  <div
                    key={aluno.id}
                    className="flex items-center gap-4 bg-white dark:bg-gray-800/50 p-3 rounded-lg min-h-14 justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
                        style={{
                          backgroundImage: `url(${
                            aluno.foto || "https://via.placeholder.com/150"
                          })`,
                        }}
                      ></div>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">
                        {aluno.nome}
                      </p>
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={aluno.status}
                        onChange={(e) =>
                          handleStatusChange(aluno.id, e.target.value)
                        }
                        className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary text-sm font-medium"
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
                ))}
              </div>
            </div>
          )}

          {activeTab === "espera" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 py-4">
                Lista de Espera ({listaDeEspera.length})
              </h3>
              <div className="flex flex-col gap-2">
                {listaDeEspera.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white dark:bg-gray-800/50 p-3 rounded-lg min-h-14 justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-gray-500 dark:text-gray-400 w-6 text-center">
                        {index + 1}.
                      </p>
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
                        style={{
                          backgroundImage: `url(${
                            item.aluno.foto || "https://via.placeholder.com/150"
                          })`,
                        }}
                      ></div>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">
                        {item.aluno.nome}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="px-3 py-2 text-xs font-bold text-white bg-primary rounded-lg">
                        Mover
                      </button>
                      <button className="px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Buscar por nome ou CPF"
                    type="text"
                  />
                </div>
                <button
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg disabled:bg-primary/50"
                  disabled
                >
                  Adicionar à Aula
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DetalhesAulaView;