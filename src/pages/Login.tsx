import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";
import type { LoginRequestDTO } from "../types/auth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading, error, isAuthenticated } = useAuth();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data: LoginRequestDTO) => {
    try {
      console.log("🚀 Starting login...");
      await login(data);
      console.log("✅ Login completed successfully");

      // El useEffect se encargará de la redirección
    } catch (error) {
      console.error("❌ Login error:", error);
      // Error is handled by useAuth hook
    }
  };

  const handleSwitchToRegister = () => {
    navigate("/registro");
  };

  const handleGoogleLogin = () => {
    console.log("🚀 Starting Google login...");
    loginWithGoogle();
  };

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
            Inicia sesión y disfruta de nuestras deliciosas comidas
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
              onSubmit={handleLogin}
              onSwitchToRegister={handleSwitchToRegister}
              onGoogleLogin={handleGoogleLogin}
              loading={loading}
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
