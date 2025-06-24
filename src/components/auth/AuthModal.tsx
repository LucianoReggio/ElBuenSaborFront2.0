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
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    login,
    loginWithGoogle,
    registerCliente,
    needsAdditionalData,
    isLoading,
    error,
    isAuthenticated,
    auth0User,
  } = useAuth();

  // Reset del estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSuccessMessage("");
    }
  }, [isOpen, initialMode]);

  // Determinar si debe mostrar el formulario de datos adicionales
  const showAdditionalDataForm = isAuthenticated && needsAdditionalData();

  // Cerrar modal automáticamente si el usuario se autentica completamente
  useEffect(() => {
    if (isAuthenticated && isOpen && !showAdditionalDataForm) {
      setSuccessMessage("¡Autenticación exitosa!");

      const timer = setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isOpen, showAdditionalDataForm, onClose, onSuccess]);

  const handleAuth0Login = async () => {
    try {
      await login();
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("❌ Google login error:", error);
    }
  };

  const handleCompleteProfile = async (
    data: Omit<ClienteRegisterDTO, "email" | "password" | "confirmPassword">
  ) => {
    try {
      const completeData: ClienteRegisterDTO = {
        ...data,
        email: auth0User?.email || "",
        password: "",
        confirmPassword: "",
      };

      await registerCliente(completeData);
      setSuccessMessage("¡Registro completado exitosamente!");

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error("❌ Registration completion error:", error);
    }
  };

  const handleClose = () => {
    setSuccessMessage("");
    onClose();
  };

  const getModalTitle = () => {
    if (showAdditionalDataForm) return "Completa tu registro";
    return mode === "register" ? "Únete a nuestra familia" : "Iniciar Sesión";
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()}>
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center">
            {successMessage}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CD6C50] mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Procesando...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {showAdditionalDataForm ? (
              <RegistroForm
                onSubmit={handleCompleteProfile}
                onSwitchToLogin={() => setMode("login")}
                onAuth0Register={handleAuth0Login}
                onGoogleRegister={handleGoogleLogin}
                loading={isLoading}
                error={error || undefined}
                userEmail={auth0User?.email}
                showAdditionalData={true}
              />
            ) : mode === "register" ? (
              <RegistroForm
                onSubmit={handleCompleteProfile}
                onSwitchToLogin={() => setMode("login")}
                onAuth0Register={handleAuth0Login}
                onGoogleRegister={handleGoogleLogin}
                loading={isLoading}
                error={error || undefined}
                showAdditionalData={false}
              />
            ) : (
              <LoginForm
                onSwitchToRegister={() => setMode("register")}
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