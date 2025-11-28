import React from "react";
import useRedefinirSenhaViewModel from "../viewmodels/useRedefinirSenhaViewModel";
import logoImg from '../images/image.png';
import studioBgImg from '../images/studioImg.jpg';

const RedefinirSenhaView = () => {
  const {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
    success
  } = useRedefinirSenhaViewModel();

  return (
    <div className="bg-background-login-light dark:bg-background-login-dark font-poppins flex items-center justify-center min-h-screen p-4 transition-colors duration-300">
      <div className="flex flex-col items-center w-full max-w-4xl">
        
        {/* Logo */}
        <div className="mb-6">
          <img alt="Define Pilates logo" className="w-32 h-auto drop-shadow-md" src={logoImg} />
        </div>

        {/* Card Principal */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl w-full flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
          
          {/* Coluna da Esquerda: Formulário */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center order-2 md:order-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center md:text-left">
              Nova Senha
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 text-center md:text-left">
              Crie uma senha forte e segura.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Nova Senha
                </label>
                <input 
                  id="newPassword" 
                  name="newPassword"
                  type="password" 
                  className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-0 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={loading || success}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Confirmar Nova Senha
                </label>
                <input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-0 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || success}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-800">
                  Senha alterada com sucesso! Redirecionando...
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || success}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full hover:opacity-90 hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "SALVANDO..." : "REDEFINIR SENHA"}
              </button>
            </form>
          </div>

          {/* Coluna da Direita: Imagem Decorativa */}
          <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-auto order-1 md:order-2">
            <img alt="Estúdio Pilates" className="absolute inset-0 w-full h-full object-cover" src={studioBgImg} />
            <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center p-12 text-white backdrop-blur-[1px]">
              <h2 className="text-2xl font-bold mb-2">Quase lá!</h2>
              <p className="text-gray-100">Defina sua nova senha para voltar a acessar sua conta.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RedefinirSenhaView;