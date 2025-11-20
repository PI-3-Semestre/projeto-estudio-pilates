import React from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";

const PageHeader = ({
  title,
  subtitle,
  backTo,
  backLabel = "Voltar",
  actions = [],
  showBreadcrumb = true,
  onBack,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      if (backTo) {
        navigate(backTo);
      } else {
        navigate(-1);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumb */}
      {showBreadcrumb && <Breadcrumb />}

      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={`Voltar para ${backLabel}`}
            title={`Voltar para ${backLabel}`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          {/* Title & Subtitle */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center space-x-2 ml-4">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  action.variant === "primary"
                    ? "bg-primary text-white hover:bg-primary/90 disabled:bg-primary/60"
                    : action.variant === "danger"
                    ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-gray-900"
                }`}
              >
                {action.icon && (
                  <span className="material-symbols-outlined text-base">
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </header>
    </div>
  );
};

export default PageHeader;
