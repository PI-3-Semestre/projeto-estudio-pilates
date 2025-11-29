import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import useGerenciarAlunosViewModel from "../viewmodels/useGerenciarAlunosViewModel";
import AlunoCard from "../components/AlunoCard";
import FilterBottomSheet from "../components/FilterBottomSheet";

const GerenciarAlunosView = () => {
  const { alunos, studios, loading, error, formatPhotoUrl } =
    useGerenciarAlunosViewModel();

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unidadeFilter, setUnidadeFilter] = useState("all");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const filteredAlunos = useMemo(() => {
    let filtered = alunos;
    if (searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (aluno) =>
          aluno.nome.toLowerCase().includes(query) || aluno.cpf.includes(query)
      );
    }
    if (statusFilter === "active") {
      filtered = filtered.filter((aluno) => aluno.is_active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((aluno) => !aluno.is_active);
    }
    if (unidadeFilter !== "all") {
      const unidadeId = parseInt(unidadeFilter);
      filtered = filtered.filter(
        (aluno) => aluno.unidades && aluno.unidades.includes(unidadeId)
      );
    }
    return filtered;
  }, [alunos, searchText, statusFilter, unidadeFilter]);

  const hasActiveFilters =
    searchText.trim() || statusFilter !== "all" || unidadeFilter !== "all";

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setUnidadeFilter("all");
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-page dark:bg-background-dark">
      <Header 
        title="Gestão de Alunos" 
        showBackButton={true} 
        backButtonPath="/admin-master/dashboard" 
      />
      <main className="flex flex-col flex-1 p-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle-light dark:text-text-subtle-dark">search</span>
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="form-input h-12 w-full rounded-xl bg-input-background-light dark:bg-input-background-dark pl-10 pr-4"
                    placeholder="Buscar por nome ou CPF..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsFilterSheetOpen(true)}
                  className="flex-1 flex items-center justify-center rounded-xl h-12 px-5 bg-input-background-light dark:bg-input-background-dark text-text-light dark:text-text-dark gap-2 text-base font-bold"
                >
                  <span className="material-symbols-outlined">filter_list</span>
                  <span className="truncate">Filtros</span>
                </button>
                <Link
                  to="/alunos/cadastrar"
                  state={{ userType: "aluno" }}
                  className="flex-1 flex items-center justify-center rounded-xl h-12 px-5 bg-action-primary text-white gap-2 text-base font-bold"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span className="truncate">Cadastrar</span>
                </Link>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm">
                  {`${filteredAlunos.length} de ${alunos.length} alunos encontrados`}
                </p>
                <button onClick={clearFilters} className="text-action-primary hover:underline text-sm font-medium">
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {loading && <p className="text-center">Carregando alunos...</p>}
          {error && <p className="text-center text-red-500">Erro ao carregar alunos.</p>}
          
          {!loading && !error && (
            filteredAlunos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAlunos.map((aluno) => (
                  <AlunoCard
                    key={aluno.cpf}
                    aluno={aluno}
                    formatPhotoUrl={formatPhotoUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">Nenhum aluno encontrado.</p>
              </div>
            )
          )}
        </div>
      </main>

      <FilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        onClearFilters={clearFilters}
      >
        <div className="space-y-4 p-4">
            <h3 className="text-lg font-bold">Filtros</h3>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select w-full h-12 rounded-xl">
                <option value="all">Status: Todos</option>
                <option value="active">Status: Ativo</option>
                <option value="inactive">Status: Inativo</option>
            </select>
            <select value={unidadeFilter} onChange={(e) => setUnidadeFilter(e.target.value)} className="form-select w-full h-12 rounded-xl">
                <option value="all">Unidade: Todas</option>
                {studios.map((studio) => (
                    <option key={studio.id} value={studio.id}>Unidade: {studio.nome}</option>
                ))}
            </select>
        </div>
      </FilterBottomSheet>
    </div>
  );
};

export default GerenciarAlunosView;
