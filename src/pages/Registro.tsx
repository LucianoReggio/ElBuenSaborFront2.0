import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { RegistroForm } from "../components/auth/RegistroForm";
import { useAuth } from "../hooks/useAuth";
import type { ClienteRegisterDTO } from "../types/clientes/Index";
import { AuthService } from "../services/AuthService";

const Registro: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithRedirect } = useAuth0();
  const {
    registerCliente,
    isAuthenticated,
    isLoading,
    error,
    auth0User,
    needsAdditionalData,
  } = useAuth();

  const [successMessage, setSuccessMessage] = useState<string>("");
  const [registrationStep, setRegistrationStep] = useState<
    "auth0" | "additional-data"
  >("auth0");

  // Verificar si viene de Auth0 después del registro o si necesita datos adicionales
  useEffect(() => {
    const fromAuth0 = searchParams.get("step") === "complete";

    console.log("🔍 Registration check:", {
      isAuthenticated,
      fromAuth0,
      needsAdditionalData: needsAdditionalData(),
      auth0User: auth0User?.email,
      pathname: window.location.pathname,
    });

    if (isAuthenticated && (fromAuth0 || needsAdditionalData())) {
      // Usuario necesita completar datos adicionales
      console.log("🔄 User needs to complete additional data");
      setRegistrationStep("additional-data");
    } else if (isAuthenticated && !needsAdditionalData()) {
      // Usuario ya registrado completamente, redirigir al home
      console.log("✅ User registration complete, redirecting to home");
      navigate("/");
    }
  }, [isAuthenticated, needsAdditionalData, searchParams, navigate, auth0User]);

  const handleAuth0Register = async () => {
    try {
      console.log("🚀 Starting Auth0 registration...");
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: "signup",
        },
        appState: {
          returnTo: "/registro?step=complete",
          targetUrl: window.location.href,
        },
      });
    } catch (error) {
      console.error("❌ Auth0 registration error:", error);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      console.log("🚀 Starting Google registration...");
      await loginWithRedirect({
        authorizationParams: {
          connection: "google-oauth2",
        },
        appState: {
          returnTo: "/registro?step=complete",
          targetUrl: window.location.href,
        },
      });
    } catch (error) {
      console.error("❌ Google registration error:", error);
    }
  };

  const handleCompleteRegistration = async (
    data: Omit<ClienteRegisterDTO, "email" | "password" | "confirmPassword">
  ) => {
    try {
      console.log("🚀 Completing profile with additional data...");

      // Usar el nuevo endpoint para completar perfil
      const completeData: ClienteRegisterDTO = {
        ...data,
        email: auth0User?.email || "",
        password: "",
        confirmPassword: "",
      };

      // FIXED: Usar registerCliente del hook useAuth en lugar de AuthService directamente
      const response = await registerCliente(completeData);

      setSuccessMessage("¡Perfil completado exitosamente! Redirigiendo...");

      // INMEDIATO: Redirigir inmediatamente para forzar refresh completo
      setTimeout(() => {
        console.log("🔄 Redirecting to home after successful registration");
        navigate("/", { replace: true });
      }, 500); // Reducir tiempo de espera
    } catch (error) {
      console.error("❌ Profile completion error:", error);
      // Error is handled by useAuth hook
    }
  };

  const handleSwitchToLogin = () => {
    navigate("/login");
  };

  // Mostrar loading si Auth0 está procesando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {registrationStep === "additional-data"
              ? "Preparando formulario..."
              : "Procesando registro..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lado izquierdo - Imagen */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#CD6C50] to-[#b85a42] items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <img
            src="/src/assets/img/Registro-Login.png"
            alt="Registro"
            className="w-full h-auto mb-8 rounded-lg shadow-lg"
          />
          <h2 className="text-3xl font-bold mb-4">¡Únete a nosotros!</h2>
          <p className="text-lg opacity-90">
            {registrationStep === "additional-data"
              ? "Completa tu perfil para disfrutar de todas nuestras funciones"
              : "Regístrate de forma segura con Auth0"}
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

          {/* Card de Registro */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <RegistroForm
              onSubmit={handleCompleteRegistration}
              onSwitchToLogin={handleSwitchToLogin}
              onAuth0Register={handleAuth0Register}
              onGoogleRegister={handleGoogleRegister}
              loading={isLoading}
              error={error || undefined}
              userEmail={auth0User?.email}
              showAdditionalData={registrationStep === "additional-data"}
            />
          </div>

          {/* Link al Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="text-[#CD6C50] hover:text-[#b85a42] font-medium transition-colors duration-200"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
