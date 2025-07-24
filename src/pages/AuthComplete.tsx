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
    backendSynced,
    backendUser,
  } = useAuth();

  const [step, setStep] = useState<
    "checking" | "complete-profile" | "redirect"
  >("checking");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ NUEVO: Estado local para envío

  // ✅ NUEVO: Debug temporal para ver el estado
  useEffect(() => {
    console.log("🔍 AuthComplete Debug:", {
      isAuthenticated,
      isLoading,
      backendSynced,
      needsAdditionalData: needsAdditionalData(),
      backendUser: backendUser
        ? {
            idCliente: backendUser.idCliente,
            nombre: backendUser.nombre,
            telefono: backendUser.telefono,
            domicilios: backendUser.domicilios?.length,
          }
        : null,
      step,
      isSubmitting,
    });
  }, [
    isAuthenticated,
    isLoading,
    backendSynced,
    needsAdditionalData,
    backendUser,
    step,
    isSubmitting,
  ]);

  // ✅ MEJORADA: Lógica más precisa para detectar qué hacer
  useEffect(() => {
    if (!isLoading && isAuthenticated && backendSynced && !isSubmitting) {
      console.log("🔍 AuthComplete: Evaluando redirección...");

      // ✅ Timeout más corto para evitar el flash
      const timeoutId = setTimeout(() => {
        const needsData = needsAdditionalData();
        console.log("🔍 AuthComplete: ¿Necesita datos adicionales?", needsData);

        if (needsData) {
          console.log(
            "➡️ AuthComplete: Mostrando formulario de datos adicionales"
          );
          setStep("complete-profile");
        } else {
          console.log("➡️ AuthComplete: Perfil completo, redirigiendo a home");
          setStep("redirect");
          navigate("/", { replace: true });
        }
      }, 300); // ✅ Reducido de 800ms a 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [
    isAuthenticated,
    isLoading,
    backendSynced,
    needsAdditionalData,
    navigate,
    isSubmitting,
  ]);

  // Manejar redirección si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log(
        "❌ AuthComplete: Usuario no autenticado, redirigiendo a home"
      );
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCompleteProfile = async (
    data: Omit<ClienteRegisterDTO, "email" | "password" | "confirmPassword">
  ) => {
    if (isSubmitting) return; // ✅ NUEVO: Prevenir doble envío

    try {
      setIsSubmitting(true); // ✅ NUEVO: Marcar como enviando
      console.log("📝 AuthComplete: Completando perfil...", data);

      const completeData: ClienteRegisterDTO = {
        ...data,
        email: auth0User?.email || "",
        password: "",
        confirmPassword: "",
      };

      const response = await registerCliente(completeData);
      console.log("✅ AuthComplete: Respuesta del servidor:", response);

      setSuccessMessage("¡Perfil completado exitosamente! Redirigiendo...");

      console.log("✅ AuthComplete: Perfil completado, redirigiendo en 1.5s");

      // ✅ NUEVO: Timeout más corto y limpieza de estado
      setTimeout(() => {
        setIsSubmitting(false); // ✅ Limpiar estado
        navigate("/", { replace: true });
      }, 1500); // Reducido de 2000ms a 1500ms
    } catch (error) {
      console.error("❌ AuthComplete: Error completando perfil:", error);
      setIsSubmitting(false); // ✅ NUEVO: Limpiar estado en error
      // El error se mostrará automáticamente en el formulario
    }
  };

  // ✅ MEJORADA: Condición más clara para mostrar loading
  const shouldShowLoading =
    isLoading ||
    step === "checking" ||
    (!backendSynced && isAuthenticated) ||
    isSubmitting; // ✅ NUEVO: También mostrar loading durante envío

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isSubmitting
              ? "Guardando tu perfil..."
              : step === "checking"
              ? "Verificando tu perfil..."
              : !backendSynced
              ? "Sincronizando con el servidor..."
              : "Procesando autenticación..."}
          </p>
          {/* ✅ Debug temporal */}
          <p className="mt-2 text-xs text-gray-400">
            Auth: {isAuthenticated ? "✓" : "✗"} | Loading:{" "}
            {isLoading ? "✓" : "✗"} | Synced: {backendSynced ? "✓" : "✗"} |
            Submitting: {isSubmitting ? "✓" : "✗"}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay algún problema
  if (error && !isSubmitting) {
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
    console.log("📋 AuthComplete: Renderizando formulario de completar perfil");

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
                loading={isSubmitting} // ✅ NUEVO: Usar estado local de envío
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
