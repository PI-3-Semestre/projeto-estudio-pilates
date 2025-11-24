import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import Breadcrumb from "./Breadcrumb";
import { ThemeContext } from "../context/ThemeContext";
import Icon from "./Icon";
import useNotificationsViewModel from "../viewmodels/useNotificationsViewModel";
import NotificationsPanel from "./NotificationsPanel";

const Header = ({ title = "Painel de Controle", showBackButton = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotificationsViewModel();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleNotifications = () =>
    setIsNotificationsOpen(!isNotificationsOpen);
  const handleBack = () => navigate(-1);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="flex items-center bg-card-light dark:bg-card-dark p-4 pb-2 justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex w-12 shrink-0 items-center justify-start">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="p-2 text-text-light dark:text-text-dark"
            >
              <Icon name="arrow_back" style={{ fontSize: "28px" }} />
            </button>
          ) : (
            <button
              onClick={toggleMenu}
              className="p-2 text-text-light dark:text-text-dark"
            >
              <Icon name="menu" style={{ fontSize: "28px" }} />
            </button>
          )}
        </div>

        <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-text-light dark:text-text-dark">
          {title}
        </h1>

        <div className="flex w-auto items-center justify-end gap-1">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-text-light dark:text-text-dark"
          >
            <Icon
              name={theme === "light" ? "dark_mode" : "light_mode"}
              style={{ fontSize: "24px" }}
            />
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={toggleNotifications}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-text-light dark:text-text-dark"
            >
              <Icon name="notifications" style={{ fontSize: "24px" }} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <NotificationsPanel
                notifications={notifications}
                loading={loading}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClose={() => setIsNotificationsOpen(false)}
              />
            )}
          </div>

          <button className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-text-light dark:text-text-dark">
            <Icon name="account_circle" style={{ fontSize: "28px" }} />
          </button>
        </div>
      </header>
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={toggleMenu}
          ></div>
          <HamburgerMenu toggleMenu={toggleMenu} />
        </>
      )}
    </>
  );
};

export default Header;
