import React from 'react';
import useLoginViewModel from '../viewmodels/useLoginViewModel';
import FormInput from '../components/FormInput';
import Icon from '../components/Icon';

const LoginView = () => {
  const { formData, error, loading, handleChange, handleSubmit } = useLoginViewModel();

  return (
    <div className="bg-gradient-to-b from-teal-400 via-teal-300 to-teal-50 dark:from-teal-800 dark:via-teal-900 dark:to-gray-900 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm mx-auto p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-teal-400/50 dark:bg-teal-600/50 rounded-full w-24 h-24 flex items-center justify-center mb-4">
            <Icon name="help_outline" className="text-white text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark">Define Pilates</h1>
          <p className="text-secondary-text-light dark:text-secondary-text-dark mt-1">Bem-vindo de volta</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormInput
            id="email"
            name="username" // O backend espera 'username'
            label="E-mail"
            placeholder="Digite seu e-mail"
            type="email"
            value={formData.username}
            onChange={handleChange}
            iconName="mail"
          />
          <FormInput
            id="password"
            name="password"
            label="Senha"
            placeholder="Digite sua senha"
            type="password"
            value={formData.password}
            onChange={handleChange}
            iconName="visibility"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <a className="font-medium text-secondary-text-light dark:text-secondary-text-dark hover:text-primary dark:hover:text-teal-300" href="#">
            Esqueci minha senha
          </a>
          <p className="mt-2 text-sm text-secondary-text-light dark:text-secondary-text-dark">
            Não tem uma conta? <a className="font-bold text-text-light dark:text-text-dark hover:text-primary dark:hover:text-teal-300" href="#">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;