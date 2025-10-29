import React, { useState, useContext } from 'react';
import HamburgerMenu from './HamburgerMenu';
import { ThemeContext } from '../context/ThemeContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <header className="flex items-center bg-card-light dark:bg-card-dark p-4 pb-2 justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex size-12 shrink-0 items-center justify-start">
                    <button onClick={toggleMenu} className="text-text-dark dark:text-text-light">
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>menu</span>
                    </button>
                </div>
                <h1 className="text-text-dark dark:text-text-light text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Painel de Controle</h1>
                <div className="flex w-24 items-center justify-end">
                    <button onClick={toggleTheme} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-text-dark dark:text-text-light gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
                    </button>
                    <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-text-dark dark:text-text-light gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                        <span className="material-symbols-outlined text-text-dark dark:text-text-light" style={{ fontSize: '28px' }}>account_circle</span>
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
