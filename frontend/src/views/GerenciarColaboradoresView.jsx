import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import useGerenciarColaboradoresViewModel from "../viewmodels/useGerenciarColaboradoresViewModel";

const GerenciarColaboradoresView = () => {
  const { colaboradores, users, studios, loading, error } =
    useGerenciarColaboradoresViewModel();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unidadeFilter, setUnidadeFilter] = useState("all");
  const [perfilFilter, setPerfilFilter] = useState("all");

  // Get distinct perfis for filter dropdown
  const getDistinctPerfis = useMemo(() => {
    const allPerfis = colaboradores.flatMap((colab) => colab.perfis);
    return [...new Set(allPerfis.map((p) => p.nome))].sort();
  }, [colaboradores]);

  // Filter logic using useMemo for performance
  const filteredColaboradores = useMemo(() => {
    let filtered = colaboradores;

    // Text search filter (name or CPF or email)
    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      filtered = filtered.filter((colab) => {
        const user = users.find((u) => u.id === colab.usuario);
        return (
          colab.nome_completo.toLowerCase().includes(query) ||
          (user && user.cpf && user.cpf.includes(query)) ||
          (user && user.email && user.email.toLowerCase().includes(query))
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((colab) =>
        statusFilter === "active"
          ? colab.status === "ATIVO"
          : colab.status !== "ATIVO"
      );
    }

    // Unidade filter
    if (unidadeFilter !== "all") {
      const studioNome = studios.find(
        (s) => s.id === parseInt(unidadeFilter)
      )?.nome;
      if (studioNome) {
        filtered = filtered.filter((colab) =>
          colab.unidades.some((u) => u.studio_nome === studioNome)
        );
      }
    }

    // Perfil filter
    if (perfilFilter !== "all") {
      filtered = filtered.filter((colab) =>
        colab.perfis.some((p) => p.nome === perfilFilter)
      );
    }

    return filtered;
  }, [
    colaboradores,
    users,
    studios,
    searchText,
    statusFilter,
    unidadeFilter,
    perfilFilter,
  ]);

  // Check if any filters are active
  const hasActiveFilters =
    searchText.trim() ||
    statusFilter !== "all" ||
    unidadeFilter !== "all" ||
    perfilFilter !== "all";

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setUnidadeFilter("all");
    setPerfilFilter("all");
  };

  const handleSearchChange = (e) => setSearchText(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleUnidadeChange = (e) => setUnidadeFilter(e.target.value);
  const handlePerfilChange = (e) => setPerfilFilter(e.target.value);

  const getCPF = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.cpf : null;
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-page dark:bg-background-dark group/design-root overflow-x-hidden">
      <Header />
      <main className="flex flex-col flex-1 p-4">
        <div className="bg-card-light dark:bg-card-dark shadow-md rounded-xl w-full max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-xl font-bold text-text-light dark:text-text-dark">
                Gerenciar Colaboradores
              </h1>
              <Link
                to="/alunos/cadastrar-usuario"
                state={{ userType: "colaborador" }}
                className="flex items-center justify-center rounded-xl h-12 px-5 bg-action-primary text-text-light gap-2 text-base font-bold"
              >
                <span className="material-symbols-outlined">add</span>
                <span className="truncate">Cadastrar Colaborador</span>
              </Link>
            </div>

            {/* Filters */}
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
                      placeholder="Buscar por nome, CPF ou email..."
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
                <select
                  value={perfilFilter}
                  onChange={handlePerfilChange}
                  className="flex h-12 lg:h-auto shrink-0 items-center justify-center gap-x-2 rounded-xl bg-input-background-light dark:bg-input-background-dark px-4 text-text-light dark:text-text-dark text-sm font-medium leading-normal border-none focus:ring-2 focus:ring-action-primary/50 focus:outline-none"
                >
                  <option value="all">Perfil: Todos</option>
                  {getDistinctPerfis.map((perfil) => (
                    <option key={perfil} value={perfil}>
                      Perfil: {perfil}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count and clear filters */}
            <div className="flex items-center justify-between">
              <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm">
                {hasActiveFilters
                  ? `${filteredColaboradores.length} de ${
                      colaboradores.length
                    } colaboradores ${
                      filteredColaboradores.length === 1
                        ? "encontrado"
                        : "encontrados"
                    }`
                  : `${colaboradores.length} colaboradores ${
                      colaboradores.length === 1 ? "cadastrado" : "cadastrados"
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
          </div>

          {loading && (
            <p className="text-text-light dark:text-text-dark">
              Carregando colaboradores...
            </p>
          )}
          {error && (
            <p className="text-red-500">Erro ao carregar colaboradores.</p>
          )}

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left text-text-subtle-light dark:text-text-subtle-dark">
              <thead className="text-xs text-text-light dark:text-text-dark uppercase bg-action-secondary/60">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Nome</th>
                  <th className="px-6 py-3">Perfis</th>
                  <th className="px-6 py-3">Unidades</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 rounded-r-lg text-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredColaboradores.map((colaborador) => (
                  <tr
                    key={colaborador.usuario}
                    className="bg-card-light dark:bg-card-dark border-b dark:border-gray-700"
                  >
                    <td className="px-6 py-4 font-medium text-text-light dark:text-text-dark whitespace-nowrap">
                      {colaborador.nome_completo}
                    </td>
                    <td className="px-6 py-4 text-text-subtle-light dark:text-text-subtle-dark">
                      {colaborador.perfis.map((p) => p.nome).join(", ")}
                    </td>
                    <td className="px-6 py-4 text-text-subtle-light dark:text-text-subtle-dark">
                      {colaborador.unidades
                        .map((u) => u.studio_nome)
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold inline-flex px-2.5 py-0.5 rounded-full ${
                          colaborador.status === "ATIVO"
                            ? "bg-action-primary/20 text-text-light dark:text-text-dark"
                            : "bg-action-secondary text-text-light dark:text-text-dark"
                        }`}
                      >
                        {colaborador.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/colaboradores/${getCPF(colaborador.usuario)}`}
                        className="text-text-light dark:text-text-dark hover:bg-action-secondary rounded-full p-1.5 inline-block"
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
            {filteredColaboradores.map((colaborador) => (
              <div
                key={colaborador.usuario}
                className="bg-background-page dark:bg-background-dark rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* You might want to add a photo to the collaborator model/serializer */}
                    <div className="flex flex-col">
                      <p className="text-text-light dark:text-text-dark text-base font-bold leading-normal">
                        {colaborador.nome_completo}
                      </p>
                      <span
                        className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          colaborador.status === "ATIVO"
                            ? "bg-action-primary/20 text-text-light dark:text-text-dark"
                            : "bg-action-secondary text-text-light dark:text-text-dark"
                        } mt-1 w-fit`}
                      >
                        {colaborador.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/colaboradores/${getCPF(colaborador.usuario)}`}
                    className="text-text-light dark:text-text-dark"
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </Link>
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                      Perfis
                    </p>
                    <p className="text-text-light dark:text-text-dark text-sm font-medium">
                      {colaborador.perfis.map((p) => p.nome).join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                      Unidades
                    </p>
                    <p className="text-text-light dark:text-text-dark text-sm font-medium">
                      {colaborador.unidades
                        .map((u) => u.studio_nome)
                        .join(", ")}
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

export default GerenciarColaboradoresView;
