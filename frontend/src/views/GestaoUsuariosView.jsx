import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importar useNavigate
import Header from "../components/Header";
import useGestaoUsuariosViewModel from "../viewmodels/useGestaoUsuariosViewModel";

// Botão de Filtro para reuso
const FiltroStatusButton = ({ texto, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`flex h-10 items-center justify-center gap-x-2 rounded-xl px-4 text-sm font-medium leading-normal ${
      isActive
        ? "bg-action-primary text-text-light"
        : "bg-input-background-light text-text-light dark:bg-input-background-dark dark:text-text-dark"
    }`}
  >
    {texto}
  </button>
);

const GestaoUsuariosView = () => {
  const { users, loading, error } = useGestaoUsuariosViewModel();
  const navigate = useNavigate(); // Inicializar useNavigate

  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos"); // Novo estado para filtro por tipo
  const [termoBusca, setTermoBusca] = useState("");
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = useState(false); // Estado para expandir/colapsar filtro de status
  const [isTipoFilterExpanded, setIsTipoFilterExpanded] = useState(false); // Estado para expandir/colapsar filtro de tipo
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false); // Estado para controlar o modal de escolha de cadastro

  const usuariosFiltrados = useMemo(() => {
    const buscaNormalizada = termoBusca
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.\-\s]/g, "");

    let filtrados = users;

    // Filtro por busca
    if (buscaNormalizada) {
      filtrados = filtrados.filter((user) => {
        const nomeNormalizado = (user.nome_completo || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[.\-\s]/g, "");

        const cpfNormalizado = (user.cpf || "").replace(/[.-]/g, "");

        return (
          nomeNormalizado.includes(buscaNormalizada) ||
          cpfNormalizado.includes(buscaNormalizada)
        );
      });
    }

    // Filtro por status
    if (filtroStatus === "ativos") {
      filtrados = filtrados.filter((user) => user.is_active);
    } else if (filtroStatus === "inativos") {
      filtrados = filtrados.filter((user) => !user.is_active);
    }

    // Novo filtro por tipo de usuário
    if (filtroTipo !== "todos") {
      filtrados = filtrados.filter((user) => user.tipo_usuario === filtroTipo);
    }

    return filtrados;
  }, [users, filtroStatus, filtroTipo, termoBusca]); // Adicionado filtroTipo às dependências

  const getDetalhesLink = (user) => {
    return `/usuarios/detalhes/${user.cpf}`;
  };

  const openCadastroModal = () => setIsCadastroModalOpen(true);
  const closeCadastroModal = () => setIsCadastroModalOpen(false);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display overflow-x-hidden">
      <Header showBackButton={true} backButtonPath="/admin-master/dashboard" />
      <main className="flex flex-col flex-1 p-4">
        <div className="bg-card-light dark:bg-card-dark shadow-md rounded-xl w-full max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
                Gestão de Usuários
              </h1>
              <button
                onClick={openCadastroModal} // Abre o modal de escolha
                className="flex items-center justify-center rounded-lg bg-action-primary h-10 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
              >
                <span className="material-symbols-outlined mr-2">person_add</span>
                Cadastrar Usuário
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-grow">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div className="text-text-subtle-light dark:text-text-subtle-dark flex border-none bg-input-background-light dark:bg-input-background-dark items-center justify-center pl-4 rounded-l-xl border-r-0">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-input-background-light dark:bg-input-background-dark focus:border-none h-full placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                      placeholder="Buscar por nome ou CPF..."
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Filtros de Status */}
            <div className="bg-input-background-light dark:bg-input-background-dark rounded-xl p-4"> {/* Always card style */}
              <div className="flex justify-between items-center mb-2"> {/* Always visible title, toggle button only on mobile */}
                <h3 className="text-text-light dark:text-text-dark font-bold">Filtrar por Status</h3>
                <button
                  onClick={() => setIsStatusFilterExpanded(!isStatusFilterExpanded)}
                  className="lg:hidden" // Toggle button only on mobile
                >
                  <span className="material-symbols-outlined text-text-light dark:text-text-dark">
                    {isStatusFilterExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>
              <div className={`${isStatusFilterExpanded ? 'block' : 'hidden'} lg:block flex gap-3 flex-wrap mt-2`}> {/* Conditional on mobile, always block on desktop */}
                <FiltroStatusButton
                  texto="Todos Status"
                  onClick={() => setFiltroStatus("todos")}
                  isActive={filtroStatus === "todos"}
                />
                <FiltroStatusButton
                  texto="Ativos"
                  onClick={() => setFiltroStatus("ativos")}
                  isActive={filtroStatus === "ativos"}
                />
                <FiltroStatusButton
                  texto="Inativos"
                  onClick={() => setFiltroStatus("inativos")}
                  isActive={filtroStatus === "inativos"}
                />
              </div>
            </div>

            {/* Filtros por Tipo de Usuário */}
            <div className="bg-input-background-light dark:bg-input-background-dark rounded-xl p-4"> {/* Always card style */}
              <div className="flex justify-between items-center mb-2"> {/* Always visible title, toggle button only on mobile */}
                <h3 className="text-text-light dark:text-text-dark font-bold">Filtrar por Tipo</h3>
                <button
                  onClick={() => setIsTipoFilterExpanded(!isTipoFilterExpanded)}
                  className="lg:hidden" // Toggle button only on mobile
                >
                  <span className="material-symbols-outlined text-text-light dark:text-text-dark">
                    {isTipoFilterExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
              </div>
              <div className={`${isTipoFilterExpanded ? 'block' : 'hidden'} lg:block flex gap-3 flex-wrap mt-2`}> {/* Conditional on mobile, always block on desktop */}
                <FiltroStatusButton
                  texto="Todos Tipos"
                  onClick={() => setFiltroTipo("todos")}
                  isActive={filtroTipo === "todos"}
                />
                <FiltroStatusButton
                  texto="Aluno"
                  onClick={() => setFiltroTipo("Aluno")}
                  isActive={filtroTipo === "Aluno"}
                />
                <FiltroStatusButton
                  texto="Colaborador"
                  onClick={() => setFiltroTipo("Colaborador")}
                  isActive={filtroTipo === "Colaborador"}
                />
              </div>
            </div>
          </div>

          {loading && (
            <p className="text-text-light dark:text-text-dark">
              Carregando usuários...
            </p>
          )}
          {error && <p className="text-red-500">Erro ao carregar usuários.</p>}

          {/* --- Tabela Desktop --- */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left text-text-subtle-light dark:text-text-subtle-dark">
              <thead className="text-xs text-text-light dark:text-text-dark uppercase bg-action-secondary/60">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg" scope="col">
                    Usuário
                  </th>
                  <th className="px-6 py-3" scope="col">
                    CPF
                  </th>
                  <th className="px-6 py-3" scope="col">
                    Tipo
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
                {usuariosFiltrados.map((user) => {
                  const detalhesLink = getDetalhesLink(user);
                  return (
                    <tr
                      key={user.id}
                      className="bg-card-light dark:bg-card-dark border-b dark:border-gray-700"
                    >
                      <th
                        className="px-6 py-4 font-medium text-text-light dark:text-text-dark whitespace-nowrap"
                        scope="row"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span>{user.nome_completo}</span>
                            <span className="text-xs text-text-subtle-light dark:text-text-subtle-dark">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </th>
                      <td className="px-6 py-4 text-text-light dark:text-text-dark">{user.cpf}</td>
                      <td className="px-6 py-4 text-text-light dark:text-text-dark">{user.tipo_usuario}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold inline-flex px-2.5 py-0.5 rounded-full ${
                            user.is_active
                              ? "bg-action-primary/20 text-text-light dark:text-text-dark"
                              : "bg-action-secondary text-text-light dark:text-text-dark"
                          }`}
                        >
                          {user.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {detalhesLink ? (
                          <Link
                            to={detalhesLink}
                            className="text-text-light dark:text-text-dark hover:bg-action-secondary rounded-full p-1.5"
                            title="Ver detalhes"
                          >
                            <span className="material-symbols-outlined">
                              more_vert
                            </span>
                          </Link>
                        ) : (
                          <span className="p-1.5 text-text-subtle-light dark:text-text-subtle-dark">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="lg:hidden space-y-4">
            {usuariosFiltrados.map((user) => {
              const detalhesLink = getDetalhesLink(user);

              return (
                <div
                  key={user.id}
                  className="bg-card-light dark:bg-card-dark rounded-lg p-4 shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <p className="text-text-light dark:text-text-dark text-base font-bold leading-normal">
                          {user.nome_completo}
                        </p>
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            user.is_active
                              ? "bg-action-primary/20 text-text-light dark:text-text-dark"
                              : "bg-action-secondary text-text-light dark:text-text-dark"
                          } mt-1 w-fit`}
                        >
                          {user.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                    {detalhesLink && (
                      <Link
                        to={detalhesLink}
                        className="text-text-light dark:text-text-dark hover:bg-action-secondary rounded-full p-1.5"
                      >
                        <span className="material-symbols-outlined">
                          more_vert
                        </span>
                      </Link>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                        CPF
                      </p>
                      <p className="text-text-light dark:text-text-dark text-sm font-medium">
                        {user.cpf}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                        Tipo
                      </p>
                      <p className="text-text-light dark:text-text-dark text-sm font-medium">
                        {user.tipo_usuario}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal de Escolha de Tipo de Usuário */}
      {isCadastroModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg w-full max-w-md transform transition-all">
            <div className="p-6 text-center">
              <h3 className="mt-5 text-xl font-bold text-text-light dark:text-text-dark">
                Escolha o Tipo de Usuário
              </h3>
              <p className="mt-2 text-base text-text-subtle-light dark:text-text-subtle-dark">
                Selecione o tipo de usuário que deseja cadastrar.
              </p>
            </div>
            <div className="flex flex-col gap-3 bg-background-light dark:bg-background-dark p-4 rounded-b-xl">
              <Link
                to="/alunos/cadastrar?type=aluno"
                onClick={closeCadastroModal}
                className="w-full inline-flex justify-center rounded-lg bg-action-primary px-4 py-2.5 text-base font-medium text-white shadow-sm hover:bg-action-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
              >
                Cadastrar Aluno
              </Link>
              <Link
                to="/colaboradores/cadastrar"
                onClick={closeCadastroModal}
                className="w-full inline-flex justify-center rounded-lg bg-action-secondary px-4 py-2.5 text-base font-medium text-text-light dark:text-text-dark shadow-sm hover:bg-action-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
              >
                Cadastrar Colaborador
              </Link>
              <button
                onClick={closeCadastroModal}
                type="button"
                className="w-full inline-flex justify-center rounded-lg px-4 py-2.5 text-base font-medium bg-input-background-light dark:bg-input-background-dark text-text-light dark:text-text-dark hover:bg-input-background-light/80 dark:hover:bg-input-background-dark/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-background-dark"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoUsuariosView;
