import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Mapeamento de rotas para nomes legíveis e ícones
const routeMap = {
  "/dashboard": { name: "Página Inicial", icon: "home" },
  "/agenda": { name: "Agenda", icon: "calendar_today" },
  "/alunos": { name: "Gerenciar Alunos", icon: "school" },
  "/colaboradores": { name: "Gerenciar Colaboradores", icon: "group" },
  "/studios": { name: "Estúdios", icon: "location_on" },
  "/modalidades": { name: "Modalidades", icon: "fitness_center" },
  "/usuarios": { name: "Usuários", icon: "people" },
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Constrói caminho breadcrumb
  const breadcrumbPath = [];
  let currentPath = "";

  pathSegments.forEach((segment, index) => {
    currentPath += "/" + segment;

    // Verifica se é uma rota conhecida
    const mappedRoute = routeMap[currentPath];
    if (mappedRoute) {
      breadcrumbPath.push({
        path: currentPath,
        name: mappedRoute.name,
        icon: mappedRoute.icon,
        isActive: index === pathSegments.length - 1,
      });
    } else {
      // Verifica padrões específicos
      if (pathSegments[index - 1] === "aulas") {
        breadcrumbPath.push({
          path: currentPath,
          name: "Detalhes da Aula",
          icon: "event",
          isActive: index === pathSegments.length - 1,
        });
      } else if (pathSegments[index - 1] === "alunos") {
        breadcrumbPath.push({
          path: currentPath,
          name: "Detalhes do Aluno",
          icon: "person",
          isActive: index === pathSegments.length - 1,
        });
      } else if (pathSegments[index - 1] === "colaboradores") {
        breadcrumbPath.push({
          path: currentPath,
          name: "Detalhes do Colaborador",
          icon: "person",
          isActive: index === pathSegments.length - 1,
        });
      } else if (pathSegments[index - 1] === "studios") {
        breadcrumbPath.push({
          path: currentPath,
          name: "Estúdio",
          icon: "location_on",
          isActive: index === pathSegments.length - 1,
        });
      } else if (
        segment === "editar" &&
        pathSegments[index - 1] &&
        pathSegments[index - 2]
      ) {
        // Determinar o tipo baseado no segmento dois posições anteriores (o tipo de entidade)
        let itemType = "Item";
        if (pathSegments[index - 2] === "alunos") itemType = "Aluno";
        else if (pathSegments[index - 2] === "colaboradores")
          itemType = "Colaborador";
        else if (pathSegments[index - 2] === "studios") itemType = "Estúdio";
        else if (pathSegments[index - 2] === "aulas") itemType = "Aula";

        breadcrumbPath.push({
          path: currentPath,
          name: `Editar ${itemType}`,
          icon: "edit",
          isActive: true,
        });
      }
    }
  });

  // Limita a 3 níveis para não ficar muito longo
  const displayPath = breadcrumbPath.slice(-3);

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 py-2 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
      <Link
        to="/dashboard"
        className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <span className="material-symbols-outlined text-base mr-1">home</span>
        <span>Início</span>
      </Link>

      {displayPath.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <span className="material-symbols-outlined text-xs mx-1">
            chevron_right
          </span>

          {crumb.isActive ? (
            <span className="flex items-center font-medium text-gray-900 dark:text-gray-100">
              <span className="material-symbols-outlined text-sm mr-1">
                {crumb.icon}
              </span>
              {crumb.name}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-sm mr-1">
                {crumb.icon}
              </span>
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
