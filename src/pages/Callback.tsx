import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false); // Evitar múltiples ejecuciones

  useEffect(() => {
    const handleCallback = async () => {
      // Evitar múltiples ejecuciones
      if (hasProcessed.current) {
        console.log("⚠️ Callback ya procesado, ignorando...");
        return;
      }

      hasProcessed.current = true;

      try {
        console.log("🔄 Processing Auth0 callback...");

        // Verificar si hay parámetros en el hash (formato de auth0-js)
        const hash = window.location.hash;
        console.log("Hash received:", hash);

        if (hash && hash.includes("access_token=")) {
          // Parsear manualmente el hash
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get("access_token");
          const idToken = params.get("id_token");

          console.log("Tokens found:", {
            accessToken: !!accessToken,
            idToken: !!idToken,
          });

          if (accessToken) {
            try {
              // Guardar el access token para futuras llamadas a la API
              AuthService.setToken(accessToken);

              // Obtener información del usuario desde Auth0
              const userProfile = await getUserProfileFromToken(accessToken);
              console.log("User profile:", userProfile);

              // Sincronizar con el backend enviando los datos del usuario
              const backendResponse = await syncWithBackendDirectly(
                accessToken,
                userProfile
              );
              console.log("Backend sync response:", backendResponse);

              // Crear y guardar UserInfo
              const userInfo = {
                email: userProfile.email || "",
                rol: backendResponse.usuario?.rol || "CLIENTE",
                userId: backendResponse.idCliente || 0,
                nombre:
                  backendResponse.nombre || userProfile.given_name || "Usuario",
                apellido:
                  backendResponse.apellido || userProfile.family_name || "",
              };

              AuthService.setUserInfo(userInfo);

              console.log(
                "✅ Callback processed successfully, redirecting to dashboard..."
              );

              // Limpiar el hash de la URL antes de redirigir
              window.location.hash = "";

              navigate("/dashboard");
            } catch (syncError) {
              console.error("❌ Error syncing with backend:", syncError);
              setError("Error sincronizando con el servidor");
            }
          } else {
            setError("No se recibió token de autenticación");
          }
        } else {
          setError("Respuesta de autenticación inválida");
        }
      } catch (error) {
        console.error("❌ Error processing callback:", error);
        setError("Error procesando la autenticación");
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar el callback solo una vez
    if (!hasProcessed.current) {
      handleCallback();
    }
  }, []); // Array vacío para ejecutar solo una vez

  // Función para obtener el perfil del usuario usando el token
  const getUserProfileFromToken = async (token: string): Promise<any> => {
    const response = await fetch(
      `https://dev-ik2kub20ymu4sfpr.us.auth0.com/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error obteniendo perfil de usuario");
    }

    return await response.json();
  };

  // Función para sincronizar con el backend enviando los datos directamente
  const syncWithBackendDirectly = async (
    token: string,
    userProfile: any
  ): Promise<any> => {
    const response = await fetch(
      "http://localhost:8080/api/auth/callback-direct",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth0Id: userProfile.sub,
          email: userProfile.email,
          name: userProfile.name,
          givenName: userProfile.given_name,
          familyName: userProfile.family_name,
          picture: userProfile.picture,
          emailVerified: userProfile.email_verified,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error sincronizando con backend");
    }

    return await response.json();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error de autenticación
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-colors"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-[#99AAB3]">Procesando inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default CallbackPage;
