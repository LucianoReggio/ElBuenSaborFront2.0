import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RegistroForm } from "../components/auth/RegistroForm";
import type { ClienteRegisterDTO } from "../types/clientes/Index";

const AuthComplete: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoading,
    error,
    auth0User,
    needsAdditionalData,
    registerCliente,
  } = useAuth();

  const [step, setStep] = useState<
    "checking" | "complete-profile" | "redirect"
  >("checking");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Lógica inteligente: Detectar qué hacer después de Auth0
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Esperar un momento para que se complete la sincronización
      const timeoutId = setTimeout(() => {
        if (needsAdditionalData()) {
          setStep("complete-profile");
        } else {
          setStep("redirect");
          navigate("/", { replace: true });
        }
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isLoading, needsAdditionalData, navigate]);

  // Manejar redirección si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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
      setSuccessMessage("¡Perfil completado exitosamente! Redirigiendo...");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Profile completion error:", error);
    }
  };

  // Mostrar loading mientras se determina el flujo
  if (isLoading || step === "checking") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {step === "checking"
              ? "Verificando tu perfil..."
              : "Procesando autenticación..."}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-red-800 font-semibold mb-2">
              Error de autenticación
            </h2>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-[#CD6C50] text-white rounded hover:bg-[#E29C44] transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de completar perfil
  if (step === "complete-profile") {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Lado izquierdo - Imagen */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#CD6C50] to-[#b85a42] items-center justify-center p-12">
          <div className="max-w-md text-center text-white">
            <img
              src="/src/assets/img/Registro-Login.png"
              alt="Completar perfil"
              className="w-full h-auto mb-8 rounded-lg shadow-lg"
            />
            <h2 className="text-3xl font-bold mb-4">¡Ya casi terminamos!</h2>
            <p className="text-lg opacity-90">
              Solo necesitamos algunos datos adicionales para personalizar tu
              experiencia
            </p>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            {/* Logo para móvil */}
            <div className="lg:hidden text-center mb-8">
              <img
                src="/src/assets/logos/Logo-Completo.png"
                alt="El Buen Sabor"
                className="h-16 mx-auto mb-4"
              />
            </div>

            {/* Mensaje de éxito */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl text-center">
                {successMessage}
              </div>
            )}

            {/* Card de Completar Perfil */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <RegistroForm
                onSubmit={handleCompleteProfile}
                onSwitchToLogin={() => navigate("/")}
                onAuth0Register={() => {}}
                onGoogleRegister={() => {}}
                loading={isLoading}
                error={error || undefined}
                userEmail={auth0User?.email}
                showAdditionalData={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthComplete;
