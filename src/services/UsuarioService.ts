// src/services/UsuarioService.ts
import { ApiClienteService } from "./ApiClienteService";
import type { UsuarioGridDTO } from "../types/usuario/UsuarioGridDTO";

class UsuarioService extends ApiClienteService {
  constructor() {
    super(); // usa la URL base "http://localhost:8080/api"
  }

  async getGrillaUsuarios(): Promise<UsuarioGridDTO[]> {
    return this.get<UsuarioGridDTO[]>("/usuarios/grilla");
  }
}

export const usuarioService = new UsuarioService();
