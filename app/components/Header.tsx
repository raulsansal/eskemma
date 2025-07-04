// components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Bars3Icon } from "@heroicons/react/24/solid";
import SignInModal from "./componentsHome/SignInModal";
import LoginModal from "./componentsHome/LoginModal";
import OnboardingModal from "./componentsHome/OnboardingModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false); // Estado para el menú desplegable del avatar
  const router = useRouter(); // Hook para manejar la navegación

  const {
    isSignInModalOpen,
    setIsSignInModalOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isOnboardingModalOpen,
    setIsOnboardingModalOpen,
    closeOnboardingModal,
    user,
    logout, // Función para cerrar sesión
  } = useAuth();

  // Cerrar el menú de hamburguesa al hacer clic fuera
  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      const menuButton = document.querySelector(".menu-button");
      const menuDropdown = document.querySelector(".menu-dropdown");

      if (
        !menuButton?.contains(event.target as Node) &&
        !menuDropdown?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  // Cerrar el menú del avatar al hacer clic fuera
  useEffect(() => {
    const handleClickOutsideAvatarMenu = (event: MouseEvent) => {
      const avatarButton = document.querySelector(".avatar-button");
      const avatarDropdown = document.querySelector(".avatar-dropdown");

      if (
        isAvatarMenuOpen &&
        !avatarButton?.contains(event.target as Node) &&
        !avatarDropdown?.contains(event.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideAvatarMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideAvatarMenu);
    };
  }, [isAvatarMenuOpen]);

  // Función para generar las iniciales del usuario
  const getUserInitials = (name?: string, lastName?: string): string => {
    if (!name && !lastName) return "JD"; // Valor predeterminado si no hay datos
    const firstNameInitial = name ? name.charAt(0).toUpperCase() : "";
    const lastNameInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${firstNameInitial}${lastNameInitial}`;
  };

  // Función para manejar la redirección al perfil
  const handleProfileClick = () => {
    setIsAvatarMenuOpen(false); // Cierra el menú desplegable
    router.push("/profile"); // Redirige al usuario a la página de perfil
  };

  const handleAvatarClick = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lastVisitedPage", window.location.pathname);
    }
    setIsAvatarMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Modal de Registro */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />

      {/* Modal de Inicio de Sesión */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onOpenRegisterModal={() => setIsSignInModalOpen(true)}
      />

      {/* OnboardingModal de Bienvenida */}
      {user?.profileCompleted && (
        <OnboardingModal
          isOpen={isOnboardingModalOpen}
          onClose={closeOnboardingModal}
          userName={user.name || "Usuario"}
        />
      )}

      {/* Encabezado */}
      <header className="bg-white-eske text-black-eske py-5 px-6 sm:px-10 md:px-14 sticky top-0 z-50">
        <div className="w-full flex justify-between items-center">
          {/* Contenedor Izquierdo (Logo) */}
          <div>
            <a href="/" aria-label="Ir al inicio">
              <img
                src="/images/esk_log_csm.svg"
                alt="Logo"
                className="h-4 w-auto sm:h-8 md:h-10"
              />
            </a>
          </div>

          {/* Contenedor Derecho (Links, Ícono de Hamburguesa y Avatar) */}
          <div className="flex items-center space-x-4 max-sm:space-x-2">
            {/* Links de Registro e Inicio (Solo visible antes de iniciar sesión) */}
            {!user && (
              <div className="flex items-center space-x-4 max-sm:space-x-2">
                <span
                  className="text-10px max-sm:text-xs font-semibold hover:text-blue-eske-80 cursor-pointer"
                  onClick={() => setIsSignInModalOpen(true)}
                >
                  REGISTRO
                </span>
                <span
                  className="text-10px max-sm:text-xs font-semibold hover:text-blue-eske-80 cursor-pointer"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  INICIO
                </span>
              </div>
            )}

            {/* Ícono de Hamburguesa */}
            <button
              className="cursor-pointer p-2 text-black-eske hover:text-blue-eske-80 focus:outline-none menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6 max-sm:h-6 max-sm:w-6 text-black-eske hover:text-blue-eske-80" />
            </button>

            {/* Avatar (Visible después de iniciar sesión) */}
            {user && (
              <div className="relative">
                <div
                  className="w-10 h-10 max-sm:w-8 max-sm:h-8 bg-orange-400 rounded-full flex items-center justify-center cursor-pointer avatar-button"
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs max-sm:text-[10px] font-bold text-gray-600">
                      {getUserInitials(user.name, user.lastName)}
                    </span>
                  )}
                </div>

                {/* Menú Desplegable del Avatar */}
                {isAvatarMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-md rounded-lg overflow-hidden z-10 avatar-dropdown">
                    <ul className="text-sm">
                      <li
                        className="px-4 py-2 hover:bg-gray-eske-10 cursor-pointer hover:text-bluegreen-eske hover:font-semibold"
                        onClick={handleProfileClick} // Manejador para redirigir al perfil
                      >
                        Perfil
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-eske-10 cursor-pointer hover:text-bluegreen-eske hover:font-semibold"
                        onClick={() => alert("Modo Oscuro")}
                      >
                        Modo Oscuro
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-eske-10 cursor-pointer hover:text-bluegreen-eske hover:font-semibold"
                        onClick={logout}
                      >
                        Cerrar Sesión
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menú Desplegable (Hamburguesa) */}
          <div
            className={`absolute top-full right-0 bg-white-eske shadow-md mt-2 py-4 z-10 text-base max-sm:text-sm transition-all duration-300 menu-dropdown ${
              isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <nav>
              <ul className="flex flex-col space-y-2 px-4 max-sm:px-3">
                <li>
                  <a
                    href="/"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    INICIO
                  </a>
                </li>
                <li>
                  <a
                    href="/sefix"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    SEFIX
                  </a>
                </li>
                <li>
                  <a
                    href="/moddulo"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    MODDULO
                  </a>
                </li>
                <li>
                  <a
                    href="/monitor"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    MONITOR
                  </a>
                </li>
                <li>
                  <a
                    href="/cursos"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CURSOS
                  </a>
                </li>
                <li>
                  <a
                    href="/servicios"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    SERVICIOS
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    EL BAÚL DE FOUCHÉ
                  </a>
                </li>
                <li>
                  <a
                    href="/recursos"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    RECURSOS
                  </a>
                </li>
                <li>
                  <a
                    href="/contacto"
                    className="block px-4 max-sm:px-3 py-2 rounded hover:bg-blue-eske hover:text-white hover:font-bold transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    CONTACTO
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
