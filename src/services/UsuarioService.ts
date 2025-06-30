// src/services/UsuarioService.ts
import { apiClienteService } from "./ApiClienteService";
import type { UsuarioGridDTO } from "../types/usuario/UsuarioGridDTO";

interface UpdateRoleRequest {
  idUsuario: number;
  nuevoRol: string;
}

interface UpdateRoleResponse {
  success: boolean;
  message: string;
  data?: UsuarioGridDTO;
}

interface ToggleUserRequest {
  idUsuario: number;
  activo: boolean;
}

interface ToggleUserResponse {
  success: boolean;
  message: string;
  data?: UsuarioGridDTO;
}

class UsuarioService {
  async getGrillaUsuarios(): Promise<UsuarioGridDTO[]> {
    console.log("🔍 UsuarioService - usando apiClienteService global");
    return apiClienteService.get<UsuarioGridDTO[]>("/usuarios/grilla");
  }

  async updateUserRole(
    idUsuario: number,
    nuevoRol: string,
    rolAnterior?: string
  ): Promise<UpdateRoleResponse> {
    console.log(`🔄 Actualizando rol de usuario ${idUsuario} a ${nuevoRol}`);
    return apiClienteService.put<UpdateRoleResponse>("/usuarios/rol", {
      idUsuario,
      nuevoRol,
      rolAnterior: rolAnterior || "", // Enviar string vacío si no se proporciona
    });
  }

  async toggleUserStatus(
    idUsuario: number,
    activo: boolean
  ): Promise<ToggleUserResponse> {
    console.log(
      `🔄 ${activo ? "Activando" : "Desactivando"} usuario ${idUsuario}`
    );
    return apiClienteService.put<ToggleUserResponse>("/usuarios/estado", {
      idUsuario,
      activo,
    });
  }

  async getUserDetails(idUsuario: number): Promise<UsuarioGridDTO> {
    console.log(`🔍 Obteniendo detalles de usuario ${idUsuario}`);
    return apiClienteService.get<UsuarioGridDTO>(`/usuarios/${idUsuario}`);
  }
}

export const usuarioService = new UsuarioService();
