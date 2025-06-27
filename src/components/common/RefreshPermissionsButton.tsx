import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface RefreshPermissionsButtonProps {
  className?: string;
  variant?: "dropdown" | "standalone";
  showIcon?: boolean;
  showText?: boolean;
  onLogout?: () => void;
}

export const RefreshPermissionsButton: React.FC<
  RefreshPermissionsButtonProps
> = ({
  className = "",
  variant = "dropdown",
  showIcon = true,
  showText = true,
  onLogout,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshRoles } = useAuth();

  const handleRefreshRoles = async () => {
    try {
      setIsRefreshing(true);
      console.log("🔄 Actualizando permisos...");

      const result = await refreshRoles();

      if (result.success) {
        if (result.roleChanged) {
          const message =
            result.oldRole && result.newRole
              ? `✅ ¡Rol actualizado!\n\n${result.oldRole} → ${result.newRole}\n\nLa página se recargará para aplicar los cambios.`
              : `✅ Permisos actualizados.\n\nLa página se recargará para aplicar los cambios.`;

          alert(message);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          alert("ℹ️ Tus permisos ya están actualizados.");
        }
      } else if (result.requiresRelogin) {
        // ← CORREGIDO: era requiresReload
        const shouldRelogin = window.confirm(
          `🔄 Para aplicar cambios de rol, Auth0 requiere que hagas login nuevamente.\n\nEsto es normal por seguridad cuando se modifican permisos.\n\n¿Proceder con el login?`
        );

        if (shouldRelogin) {
          alert("🔄 Redirigiendo a login para aplicar nuevos permisos...");
          setTimeout(() => {
            if (onLogout) {
              onLogout();
            } else {
              // Fallback si no se proporciona onLogout
              window.location.reload();
            }
          }, 500);
        }
      } else {
        const shouldRetry = window.confirm(
          `❌ ${
            result.message || "Error actualizando permisos"
          }\n\n¿Quieres intentar nuevamente?`
        );

        if (shouldRetry) {
          setTimeout(() => handleRefreshRoles(), 1000);
        }
      }
    } catch (error: any) {
      console.error("❌ Error refreshing roles:", error);

      const shouldRelogin = window.confirm(
        `❌ Error inesperado: ${
          error.message || "Error desconocido"
        }\n\n¿Quieres hacer login nuevamente para aplicar posibles cambios?`
      );

      if (shouldRelogin && onLogout) {
        onLogout();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const baseClasses =
    variant === "dropdown"
      ? "flex items-center w-full px-4 py-2 text-sm transition-colors duration-200"
      : "flex items-center px-3 py-2 text-sm transition-colors duration-200 rounded-md";

  const stateClasses = isRefreshing
    ? "text-gray-400 cursor-not-allowed"
    : variant === "dropdown"
    ? "text-blue-600 hover:bg-blue-50"
    : "text-blue-600 hover:bg-blue-100";

  return (
    <button
      onClick={handleRefreshRoles}
      disabled={isRefreshing}
      className={`${baseClasses} ${stateClasses} ${className}`}
    >
      {showIcon && (
        <RefreshCw
          className={`${showText ? "mr-3" : ""} h-4 w-4 ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
      )}
      {showText && (
        <span>
          {isRefreshing ? "Actualizando..." : "🔄 Actualizar Permisos"}
        </span>
      )}
    </button>
  );
};