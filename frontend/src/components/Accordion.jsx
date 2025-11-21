import React, { useState } from 'react';

const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 text-left"
            >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                <span 
                    className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                    expand_more
                </span>
            </button>
            {isOpen && (
                <div className="p-4 pt-0">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Accordion;
