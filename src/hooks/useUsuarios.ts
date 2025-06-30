// src/hooks/useUsuarios.ts
import { useEffect, useState, useCallback } from "react";
import { usuarioService } from "../services/UsuarioService";
import { useAuth } from "./useAuth";
import type { UsuarioGridDTO } from "../types/usuario/UsuarioGridDTO";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioGridDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, isLoading: authLoading, backendUser } = useAuth();

  const fetchUsuarios = useCallback(async () => {
    // No intentar cargar si Auth0 aún está cargando
    if (authLoading) {
      return;
    }

    // Solo cargar si el usuario está autenticado
    if (!isAuthenticated) {
      setLoading(false);
      setError("Usuario no autenticado");
      return;
    }

    // Verificar que el usuario tenga rol ADMIN
    const userRole = backendUser?.usuario?.rol || backendUser?.rol;
    if (userRole !== "ADMIN") {
      setLoading(false);
      setError("Acceso denegado: Se requiere rol ADMIN");
      return;
    }

    try {
      console.log("🔍 Cargando usuarios...");
      setError(null);
      setLoading(true);
      const data = await usuarioService.getGrillaUsuarios();
      console.log("✅ Usuarios cargados:", data);
      setUsuarios(data);
    } catch (err: any) {
      console.error("❌ Error cargando usuarios:", err);
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, backendUser]);

  // Cargar usuarios inicialmente
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const updateUserRole = useCallback(
    async (idUsuario: number, nuevoRol: string) => {
      try {
        // Encontrar el usuario para obtener el rol anterior
        const usuario = usuarios.find((u) => u.idUsuario === idUsuario);
        const rolAnterior = usuario?.rol || "";

        console.log(
          `🔄 Actualizando rol de usuario ${idUsuario} a ${nuevoRol}`
        );
        const response = await usuarioService.updateUserRole(
          idUsuario,
          nuevoRol,
          rolAnterior
        );

        if (response.success) {
          // Actualizar el usuario en el estado local
          setUsuarios((prev) =>
            prev.map((user) =>
              user.idUsuario === idUsuario ? { ...user, rol: nuevoRol } : user
            )
          );
          console.log("✅ Rol actualizado correctamente");
        } else {
          throw new Error(response.message || "Error al actualizar rol");
        }
      } catch (error: any) {
        console.error("❌ Error actualizando rol:", error);
        throw error;
      }
    },
    [usuarios]
  );

  const toggleUserStatus = useCallback(
    async (idUsuario: number, activo: boolean) => {
      try {
        console.log(
          `🔄 ${activo ? "Activando" : "Desactivando"} usuario ${idUsuario}`
        );
        const response = await usuarioService.toggleUserStatus(
          idUsuario,
          activo
        );

        if (response.success) {
          // Actualizar el usuario en el estado local
          setUsuarios((prev) =>
            prev.map((user) =>
              user.idUsuario === idUsuario ? { ...user, activo } : user
            )
          );
          console.log(
            `✅ Usuario ${activo ? "activado" : "desactivado"} correctamente`
          );
        } else {
          throw new Error(
            response.message || "Error al cambiar estado del usuario"
          );
        }
      } catch (error: any) {
        console.error("❌ Error cambiando estado:", error);
        throw error;
      }
    },
    []
  );

  const getCurrentUserId = useCallback(() => {
    return backendUser?.userId || backendUser?.idCliente;
  }, [backendUser]);

  return {
    usuarios,
    loading: loading || authLoading,
    error,
    refetch: fetchUsuarios,
    updateUserRole,
    toggleUserStatus,
    currentUserId: getCurrentUserId(),
  };
};
