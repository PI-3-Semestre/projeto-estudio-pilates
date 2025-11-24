import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Avatar from "../components/Avatar";
import useGerenciarAlunosViewModel from "../viewmodels/useGerenciarAlunosViewModel";

const GerenciarAlunosView = () => {
  const { alunos, studios, loading, error, formatPhotoUrl } =
    useGerenciarAlunosViewModel();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unidadeFilter, setUnidadeFilter] = useState("all");

  // Filter logic using useMemo for performance
  const filteredAlunos = useMemo(() => {
    let filtered = alunos;

    // Text search filter (name or CPF)
    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (aluno) =>
          aluno.nome.toLowerCase().includes(query) || aluno.cpf.includes(query)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((aluno) => aluno.is_active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((aluno) => !aluno.is_active);
    }

    // Unidade filter
    if (unidadeFilter !== "all") {
      const unidadeId = parseInt(unidadeFilter);
      filtered = filtered.filter(
        (aluno) => aluno.unidades && aluno.unidades.includes(unidadeId)
      );
    }

    return filtered;
  }, [alunos, searchText, statusFilter, unidadeFilter]);

  // Check if any filters are active
  const hasActiveFilters =
    searchText.trim() || statusFilter !== "all" || unidadeFilter !== "all";

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setUnidadeFilter("all");
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleUnidadeChange = (e) => {
    setUnidadeFilter(e.target.value);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-page dark:bg-background-dark group/design-root overflow-x-hidden">
      <Header />
      <main className="flex flex-col flex-1 p-4">
        <div className="bg-card-light dark:bg-card-dark shadow-md rounded-xl w-full max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-grow">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div className="text-text-subtle-light dark:text-text-subtle-dark flex border-none bg-input-background-light dark:bg-input-background-dark items-center justify-center pl-4 rounded-l-xl border-r-0">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      value={searchText}
                      onChange={handleSearchChange}
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-input-background-light dark:bg-input-background-dark focus:border-none h-full placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      placeholder="Buscar por nome ou CPF..."
                    />
                  </div>
                </label>
              </div>
              <div className="flex gap-3 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                >
                  <option value="all">Status: Todos</option>
                  <option value="active">Status: Ativo</option>
                  <option value="inactive">Status: Inativo</option>
                </select>
                <select
                  value={unidadeFilter}
                  onChange={handleUnidadeChange}
                  className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                >
                  <option value="all">Unidade: Todas</option>
                  {studios.map((studio) => (
                    <option key={studio.id} value={studio.id}>
                      Unidade: {studio.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count and clear filters */}
            <div className="flex items-center justify-between">
              <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm">
                {hasActiveFilters
                  ? `${filteredAlunos.length} de ${alunos.length} alunos ${
                      filteredAlunos.length === 1 ? "encontrado" : "encontrados"
                    }`
                  : `${alunos.length} alunos ${
                      alunos.length === 1 ? "cadastrado" : "cadastrados"
                    }`}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-action-primary hover:text-action-primary/80 text-sm font-medium underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="flex">
              <Link
                to="/alunos/cadastrar-usuario"
                state={{ userType: "aluno" }}
                className="flex min-w-[84px] max-w-[480px] w-full lg:w-auto cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-action-primary text-text-light gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
              >
                <div className="text-text-light">
                  <span className="material-symbols-outlined">add</span>
                </div>
                <span className="truncate">Cadastrar Novo Aluno</span>
              </Link>
            </div>
          </div>

          {loading && (
            <p className="text-text-light dark:text-text-dark">
              Carregando alunos...
            </p>
          )}
          {error && <p className="text-red-500">Erro ao carregar alunos.</p>}

          {/* Desktop view */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left text-text-subtle-light dark:text-text-subtle-dark">
              <thead className="text-xs text-text-light dark:text-text-dark uppercase bg-action-secondary/60">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg" scope="col">
                    Aluno
                  </th>
                  <th className="px-6 py-3" scope="col">
                    Contato
                  </th>
                  <th className="px-6 py-3" scope="col">
                    Status
                  </th>
                  <th
                    className="px-6 py-3 rounded-r-lg text-center"
                    scope="col"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAlunos.map((aluno) => (
                  <tr
                    key={aluno.cpf}
                    className="bg-card-light dark:bg-card-dark border-b dark:border-gray-700"
                  >
                    <th
                      className="px-6 py-4 font-medium text-text-light dark:text-text-dark whitespace-nowrap"
                      scope="row"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          imageUrl={formatPhotoUrl(aluno.foto)}
                          alt={`Foto de ${aluno.nome}`}
                          className="h-10 w-10 shrink-0"
                        />
                        <span>{aluno.nome}</span>
                      </div>
                    </th>
                    <td className="px-6 py-4 text-text-subtle-light dark:text-text-subtle-dark">
                      {aluno.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold inline-flex px-2.5 py-0.5 rounded-full ${
                          aluno.is_active
                            ? "bg-action-primary/20 text-text-light dark:text-text-dark"
                            : "bg-action-secondary text-text-light dark:text-text-dark"
                        }`}
                      >
                        {aluno.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/alunos/${aluno.cpf}`}
                        state={{ aluno }}
                        className="text-text-light dark:text-text-dark hover:bg-action-secondary rounded-full p-1.5"
                      >
                        <span className="material-symbols-outlined">
                          more_vert
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="lg:hidden space-y-4">
            {filteredAlunos.map((aluno) => (
              <div
                key={aluno.cpf}
                className="bg-background-page dark:bg-background-dark rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      imageUrl={formatPhotoUrl(aluno.foto)}
                      alt={`Foto de ${aluno.nome}`}
                      className="h-14 w-14"
                    />
                    <div className="flex flex-col">
                      <p className="text-text-light dark:text-text-dark text-base font-bold leading-normal">
                        {aluno.nome}
                      </p>
                      <span
                        className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          aluno.is_active
                            ? "bg-action-primary/20 text-text-light dark:text-text-dark"
                            : "bg-action-secondary text-text-light dark:text-text-dark"
                        } mt-1 w-fit`}
                      >
                        {aluno.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/alunos/${aluno.cpf}`}
                    className="text-text-light dark:text-text-dark"
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </Link>
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                      Contato
                    </p>
                    <p className="text-text-light dark:text-text-dark text-sm font-medium">
                      {aluno.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GerenciarAlunosView;
