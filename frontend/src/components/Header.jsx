import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';
import { ThemeContext } from '../context/ThemeContext';
import Icon from './Icon'; // Assuming Icon component can render material symbols

const Header = ({ title = "Painel de Controle", showBackButton = false, showNotifications = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <>
            <header className="flex items-center bg-card-light dark:bg-card-dark p-4 pb-2 justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex size-12 shrink-0 items-center justify-start">
                    {showBackButton ? (
                        <button onClick={handleBack} className="text-text-light dark:text-text-dark">
                            <Icon name="arrow_back" style={{ fontSize: '28px' }} />
                        </button>
                    ) : (
                        <button onClick={toggleMenu} className="text-text-light dark:text-text-dark">
                            <Icon name="menu" style={{ fontSize: '28px' }} />
                        </button>
                    )}
                </div>

                <h1 className="text-text-light dark:text-text-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                    {title}
                </h1>

                <div className="flex w-auto items-center justify-end gap-1">
                    <button onClick={toggleTheme} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-text-light dark:text-text-dark">
                        <Icon name={theme === 'light' ? 'dark_mode' : 'light_mode'} style={{ fontSize: '24px' }} />
                    </button>
                    
                    {showNotifications && (
                        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-text-light dark:text-text-dark">
                            <Icon name="notifications" style={{ fontSize: '24px' }} />
                        </button>
                    )}

                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-text-light dark:text-text-dark">
                        <Icon name="account_circle" style={{ fontSize: '28px' }} />
                    </button>
                </div>
            </header>
            {isMenuOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-30" onClick={toggleMenu}></div>
                    <HamburgerMenu toggleMenu={toggleMenu} />
                </>
            )}
        </>
    );
};

export default Header;

