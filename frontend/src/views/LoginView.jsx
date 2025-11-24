import React from "react";
import useLoginViewModel from "../viewmodels/useLoginViewModel";
import { Link } from 'react-router-dom';
import logoImg from '../images/logo_define_pilates_2.jpg';
import studioImg from '../images/studioImg.jpg'

const LoginView = () => {
  const {
    emailCpf,
    setEmailCpf,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLoginViewModel();

  return (
    // Fundo usando as cores configuradas no tailwind.config.js
      <div className="bg-background-login-light dark:bg-background-login-dark font-poppins flex items-center justify-center min-h-screen p-4 pb-24 md:pb-40 transition-colors duration-300">
        <div className="flex flex-col items-center w-full max-w-4xl">
        
        {/* Logo Section */}
        <div className="mb-8">
          <img 
            alt="Define Pilates logo" 
            className="w-40 h-auto"
            src={logoImg}
          />
        </div>

        {/* Card Principal */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl w-full flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
          
          {/* Coluna da Esquerda: Formulário */}
          <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center order-2 md:order-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center md:text-left">
              Login
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-center md:text-left">
              Bem-vindo de volta!
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
                >
                  Email ou CPF
                </label>
                <input 
                  id="email" 
                  name="email" 
                  type="text" 
                  className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-0 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all outline-none"
                  placeholder="seuemail@exemplo.com"
                  value={emailCpf}
                  onChange={(e) => setEmailCpf(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label 
                  htmlFor="password" 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1"
                >
                  Senha
                </label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-0 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full hover:opacity-90 hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? "ENTRANDO..." : "LOGIN"}
              </button>

              <div className="text-center mt-4">
                <a href="#" className="text-sm text-primary hover:underline">
                  Esqueci minha senha
                </a>
              </div>
            </form>
          </div>

          {/* Coluna da Direita: Imagem e Frase Inspiradora */}
          <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-auto order-1 md:order-2">
            {/* Nova imagem de fundo colorida */}
            <img 
              alt="Estúdio de Pilates moderno e equipado" 
              className="absolute inset-0 w-full h-full object-cover"
              src={studioImg} 
            />
            
            {/* Overlay um pouco mais escuro (bg-black/60) para garantir leitura sobre o fundo colorido */}
            <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center p-12 text-white backdrop-blur-[1px]">
              
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
                Pilates é para você.
              </h2>
              <p className="text-base sm:text-lg text-gray-100 font-medium leading-relaxed">
                Construa força, aumente sua flexibilidade e domine sua energia.
              </p>
              
              {/* Botão de "Cadastre-se" removido */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginView;