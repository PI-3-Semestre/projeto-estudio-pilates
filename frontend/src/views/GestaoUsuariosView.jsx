import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

  const [filtroStatus, setFiltroStatus] = useState("todos"); 
  const [termoBusca, setTermoBusca] = useState(""); 
  const usuariosFiltrados = useMemo(() => {
    
    const buscaNormalizada = termoBusca
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/[.\-\s]/g, ""); 

    const filtradosPorBusca = users.filter((user) => {
      if (buscaNormalizada === "") {
        return true; 
      }

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

    if (filtroStatus === "ativos") {
      return filtradosPorBusca.filter((user) => user.is_active);
    }
    if (filtroStatus === "inativos") {
      return filtradosPorBusca.filter((user) => !user.is_active);
    }
    
    return filtradosPorBusca;

  }, [users, filtroStatus, termoBusca]); 

  const getDetalhesLink = (user) => {
    if (user.tipo_usuario === "Aluno") {
      return `/alunos/${user.cpf}`
    }
    if (user.tipo_usuario === "Colaborador") {
      return `/colaboradores/${user.cpf}`
    }

    return null;
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-page dark:bg-background-dark group/design-root overflow-x-hidden">
      <Header />
      <main className="flex flex-col flex-1 p-4">
        <div className="bg-card-light dark:bg-card-dark shadow-md rounded-xl w-full max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">
              Gestão de Usuários
            </h1>

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
            {/* Adiciona os botões de filtro */}
            <div className="flex gap-3 flex-wrap">
              <FiltroStatusButton
                texto="Todos"
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
                          {/* O Avatar não está no /usuarios/, então usamos um padrão */}
                          {/* <Avatar imageUrl={user.foto} alt={`Foto de ${user.nome_completo}`} className="h-10 w-10 shrink-0" /> */}
                          <div className="flex flex-col">
                            <span>{user.nome_completo}</span>
                            <span className="text-xs text-text-subtle-light dark:text-text-subtle-dark">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </th>
                      <td className="px-6 py-4">{user.cpf}</td>
                      <td className="px-6 py-4">{user.tipo_usuario}</td>
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
                  className="bg-background-page dark:bg-background-dark rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* <Avatar className="h-14 w-14" /> */}
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
                        className="text-text-light dark:text-text-dark"
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
    </div>
  );
};

export default GestaoUsuariosView;