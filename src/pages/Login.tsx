import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading, error, isAuthenticated } =
    useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ User already authenticated, redirecting to home");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleAuth0Login = async () => {
    try {
      console.log("🚀 Starting Auth0 login...");
      await login();
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log("🚀 Starting Google login...");
      await loginWithGoogle();
    } catch (error) {
      console.error("❌ Google login error:", error);
    }
  };

  const handleSwitchToRegister = () => {
    navigate("/registro");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
          <p className="mt-4 text-gray-600">Procesando autenticación...</p>
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
            alt="Login"
            className="w-full h-auto mb-8 rounded-lg shadow-lg"
          />
          <h2 className="text-3xl font-bold mb-4">¡Bienvenido de vuelta!</h2>
          <p className="text-lg opacity-90">
            Inicia sesión de forma segura con Auth0
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

          {/* Card de Login */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <LoginForm
              onSwitchToRegister={handleSwitchToRegister}
              onAuth0Login={handleAuth0Login}
              onGoogleLogin={handleGoogleLogin}
              loading={isLoading}
              error={error || undefined}
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

export default Login;