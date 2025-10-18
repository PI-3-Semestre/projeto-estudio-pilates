import React, { useState } from 'react';
import LoginView from './views/LoginView';
import HomeView from './views/HomeView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      {isAuthenticated ? (
        <HomeView />
      ) : (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;