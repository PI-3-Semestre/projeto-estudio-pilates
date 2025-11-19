import React from "react";

const Avatar = ({ imageUrl, alt, className }) => {
  // Helper function to format photo URL for display
  const formatImageUrl = (url) => {
    if (!url) return "";
    // If it's already a full URL or data URL, return as is
    if (url.startsWith("http") || url.startsWith("data:")) {
      return url;
    }
    // If it's base64, format as data URL
    return `data:image/jpeg;base64,${url}`;
  };
  if (imageUrl) {
    return (
      <div
        className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full ${className}`}
        style={{ backgroundImage: `url(${formatImageUrl(imageUrl)})` }}
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
