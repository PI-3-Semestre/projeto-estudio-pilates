import React, { useState } from 'react';

export const Tabs = ({ children }) => {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = React.Children.toArray(children);

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.props.label}
                            onClick={() => setActiveTab(index)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === index 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`
                            }
                        >
                            {tab.props.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-4">
                {tabs[activeTab]}
            </div>
        </div>
    );
};

export const Tab = ({ children }) => {
    // This component is just a wrapper and doesn't render anything itself.
    // Its props and children are accessed by the parent Tabs component.
    return <>{children}</>;
};
