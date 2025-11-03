import React from 'react';

const Avatar = ({ imageUrl, alt, className }) => {
    if (imageUrl) {
        return (
            <div
                className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full ${className}`}
                style={{ backgroundImage: `url(${imageUrl})` }}
                alt={alt}
            />
        );
    }

    return (
        <div
            className={`flex items-center justify-center bg-action-secondary/60 rounded-full ${className}`}
            alt={alt}
        >
            <span className="material-symbols-outlined text-text-dark opacity-50">
                person
            </span>
        </div>
    );
};

export default Avatar;
