import React, { useState } from 'react';
import LoginView from './views/LoginView';
import HomeView from './views/HomeView';
import CadastroView from './views/CadastroView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'register'

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = () => {
    // After successful registration, switch to the login view
    setCurrentView('login');
  };

  const handleGoToRegister = () => {
    setCurrentView('register');
  };

  const handleGoToLogin = () => {
    setCurrentView('login');
  };

  const renderUnauthenticatedView = () => {
    if (currentView === 'login') {
      return <LoginView onLoginSuccess={handleLoginSuccess} onGoToRegister={handleGoToRegister} />;
    }
    return <CadastroView onRegisterSuccess={handleRegisterSuccess} onGoToLogin={handleGoToLogin} />;
  };

  return (
    <>
      {isAuthenticated ? (
        <HomeView />
      ) : (
        renderUnauthenticatedView()
      )}
    </>
  );
}

export default App;