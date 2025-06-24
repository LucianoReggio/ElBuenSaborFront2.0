import React from "react";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onAuth0Login: () => void;
  onGoogleLogin: () => void;
  loading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onAuth0Login,
  onGoogleLogin,
  loading = false,
  error,
}) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
        Inicia sesión
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Mensaje explicativo */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm">
            Elige cómo quieres iniciar sesión
          </p>
        </div>

        {/* Botón Login con Email (Auth0) */}
        <button
          onClick={onAuth0Login}
          disabled={loading}
          className="w-full bg-[#CD6C50] hover:bg-[#b85a42] disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#CD6C50] focus:ring-offset-2 flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>
            {loading ? "Iniciando sesión..." : "Iniciar sesión con Email"}
          </span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o</span>
          </div>
        </div>

        {/* Botón Google */}
        <button
          onClick={onGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Iniciar sesión con Google</span>
        </button>

        {/* Link a Registro */}
        <div className="text-center mt-6">
          <span className="text-gray-600 text-sm">¿No tienes cuenta? </span>
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#CD6C50] hover:text-[#b85a42] font-medium transition-colors duration-200 text-sm"
          >
            Registrarse
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            🔒 Tu información está protegida con Auth0, la plataforma de
            autenticación más segura
          </p>
        </div>
      </div>
    </div>
  );
};