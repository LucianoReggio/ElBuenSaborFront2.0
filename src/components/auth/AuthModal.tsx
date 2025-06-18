import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Modal } from "../common/Modal";
import { RegistroForm } from "./RegistroForm";
import { LoginForm } from "./LoginForm";
import { useAuth } from "../../hooks/useAuth";
import type { ClienteRegisterDTO } from "../../types/clientes/Index";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onSuccess?: () => void; // Callback opcional cuando la autenticación es exitosa
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "register" | "additional-data">(
    initialMode
  );
  const {
    login,
    loginWithGoogle,
    registerCliente,
    isLoading,
    error,
    isAuthenticated,
    auth0User,
  } = useAuth();

  const [successMessage, setSuccessMessage] = useState<string>("");

  // Reset del estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSuccessMessage("");
    }
  }, [isOpen, initialMode]);

  // Cerrar modal automáticamente si el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && isOpen && mode !== "additional-data") {
      setSuccessMessage("¡Autenticación exitosa!");

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1000);
    }
  }, [isAuthenticated, isOpen, mode, onClose, onSuccess]);

  const handleAuth0Login = async () => {
    try {
      await login(); // Esto redirige a Auth0, el modal se cerrará automáticamente
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(); // Esto redirige a Auth0 con Google
    } catch (error) {
      console.error("❌ Google login error:", error);
    }
  };

  const handleAuth0Register = async () => {
    try {
      await login(); // Auth0 maneja tanto login como registro
    } catch (error) {
      console.error("❌ Register error:", error);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle(); // Registro con Google
    } catch (error) {
      console.error("❌ Google register error:", error);
    }
  };

  const handleCompleteRegistration = async (
    data: Omit<ClienteRegisterDTO, "email" | "password" | "confirmPassword">
  ) => {
    try {
      const completeData: ClienteRegisterDTO = {
        ...data,
        email: auth0User?.email || "",
        password: "", // No se usa con Auth0
        confirmPassword: "", // No se usa con Auth0
      };

      await registerCliente(completeData);

      setSuccessMessage("¡Registro completado exitosamente!");

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1000);
    } catch (error) {
      console.error("❌ Registration completion error:", error);
    }
  };

  const handleClose = () => {
    setSuccessMessage("");
    onClose();
  };

  // Si el usuario está autenticado pero no ha completado su registro
  const showAdditionalData =
    isAuthenticated && auth0User && mode === "register";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        showAdditionalData
          ? "Completa tu registro"
          : mode === "register"
          ? "Únete a nuestra familia"
          : "Iniciar Sesión"
      }
    >
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center">
            {successMessage}
          </div>
        )}

        {/* Mostrar loading durante autenticación */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CD6C50] mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Procesando...</p>
          </div>
        )}

        {/* Mostrar formularios solo si no está cargando */}
        {!isLoading && (
          <>
            {mode === "register" ? (
              <RegistroForm
                onSubmit={handleCompleteRegistration}
                onSwitchToLogin={() => {
                  setMode("login");
                  setSuccessMessage("");
                }}
                onAuth0Register={handleAuth0Register}
                onGoogleRegister={handleGoogleRegister}
                loading={isLoading}
                error={error || undefined}
                userEmail={auth0User?.email}
                showAdditionalData={showAdditionalData}
              />
            ) : (
              <LoginForm
                onSwitchToRegister={() => {
                  setMode("register");
                  setSuccessMessage("");
                }}
                onAuth0Login={handleAuth0Login}
                onGoogleLogin={handleGoogleLogin}
                loading={isLoading}
                error={error || undefined}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
