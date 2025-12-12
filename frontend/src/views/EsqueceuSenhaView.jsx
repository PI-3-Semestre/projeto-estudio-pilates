import React from "react";
import { Link } from 'react-router-dom';
import useEsqueceuSenhaViewModel from "../viewmodels/useEsqueceuSenhaViewModel";
import logoImg from '../images/image.png'; 
import studioBgImg from '../images/studioImg.jpg'; 

const EsqueceuSenhaView = () => {
  const {
    email,
    setEmail,
    loading,
    error,
    success,
    handleSubmit,
  } = useEsqueceuSenhaViewModel();

  return (
    <div className="bg-background-login-light dark:bg-background-login-dark font-poppins flex items-center justify-center min-h-screen p-4 transition-colors duration-300">
      <div className="flex flex-col items-center w-full max-w-4xl">
        
        {/* Logo */}
        <div className="mb-6">
          <img alt="Define Pilates logo" className="w-32 h-auto drop-shadow-md" src={logoImg} />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl w-full flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
          
          {/* Formulário */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center order-2 md:order-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center md:text-left">
              Recuperar Senha
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 text-center md:text-left">
              Digite seu e-mail para receber o link de redefinição.
            </p>
            
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    E-mail Cadastrado
                  </label>
                  <input 
                    id="email" 
                    type="email" 
                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600 focus:ring-0 rounded-lg py-3 px-4 text-gray-700 dark:text-gray-200 placeholder-gray-400 transition-all outline-none"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-800">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full hover:opacity-90 hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? "ENVIANDO..." : "ENVIAR LINK"}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">mail</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">E-mail Enviado!</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                  Verifique sua caixa de entrada (e spam) para redefinir sua senha.
                </p>
              </div>
            )}

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-primary hover:underline font-medium">
                Voltar para o Login
              </Link>
            </div>
          </div>

          {/* Imagem Decorativa (Igual ao Login) */}
          <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-auto order-1 md:order-2">
            <img alt="Estúdio Pilates" className="absolute inset-0 w-full h-full object-cover" src={studioBgImg} />
            <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center p-12 text-white backdrop-blur-[1px]">
              <h2 className="text-2xl font-bold mb-2">Esqueceu a senha?</h2>
              <p className="text-gray-100">Não se preocupe, acontece com os melhores.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EsqueceuSenhaView;