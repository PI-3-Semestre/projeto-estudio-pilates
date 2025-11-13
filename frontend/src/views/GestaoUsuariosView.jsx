import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import useGestaoUsuariosViewModel from "../viewmodels/useGestaoUsuariosViewModel";

const GestaoUsuariosView = () => {
  const { users, loading, error } = useGestaoUsuariosViewModel();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-page dark:bg-background-dark group/design-root overflow-x-hidden">
      <Header />
      <main className="flex flex-col flex-1 p-4">
        <div className="bg-card-light dark:bg-card-dark shadow-md rounded-xl w-full max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-xl font-bold text-text-light dark:text-text-dark">Gestão de Usuários</h1>
              <Link
                to="/alunos/cadastrar-usuario"
                className="flex items-center justify-center rounded-xl h-12 px-5 bg-action-primary text-text-light gap-2 text-base font-bold"
              >
                <span className="material-symbols-outlined">add</span>
                <span className="truncate">Cadastrar Usuário</span>
              </Link>
            </div>
          </div>

          {loading && <p className="text-text-light dark:text-text-dark">Carregando usuários...</p>}
          {error && (
            <p className="text-red-500">Erro ao carregar usuários.</p>
          )}

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left text-text-subtle-light dark:text-text-subtle-dark">
              <thead className="text-xs text-text-light dark:text-text-dark uppercase bg-action-secondary/60">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Nome Completo</th>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">CPF</th>
                  <th className="px-6 py-3 rounded-r-lg text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-card-light dark:bg-card-dark border-b dark:border-gray-700"
                  >
                    <td className="px-6 py-4 font-medium text-text-light dark:text-text-dark whitespace-nowrap">
                      {user.nome_completo}
                    </td>
                    <td className="px-6 py-4 text-text-subtle-light dark:text-text-subtle-dark">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 text-text-subtle-light dark:text-text-subtle-dark">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-text-subtle-light dark:text-text-subtle-dark">
                      {user.cpf}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/usuarios/${user.id}`}
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
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-background-page dark:bg-background-dark rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <p className="text-text-light dark:text-text-dark text-base font-bold leading-normal">
                        {user.nome_completo}
                      </p>
                      <p className="text-text-subtle-light dark:text-text-subtle-dark text-sm">
                        {user.username}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/usuarios/${user.id}`}
                    className="text-text-light dark:text-text-dark"
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </Link>
                </div>
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-text-light dark:text-text-dark text-sm font-medium">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-subtle-light dark:text-text-subtle-dark text-xs font-semibold uppercase tracking-wider">
                      CPF
                    </p>
                    <p className="text-text-light dark:text-text-dark text-sm font-medium">
                      {user.cpf}
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

export default GestaoUsuariosView;