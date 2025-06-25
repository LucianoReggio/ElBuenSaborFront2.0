// src/services/UsuarioService.ts
import { ApiClient } from "./ApiClient";
import type { UsuarioGridDTO } from "../types/usuario/UsuarioGridDTO";

class UsuarioService extends ApiClient {
  constructor() {
    super(); // usa la URL base "http://localhost:8080/api"
  }

  async getGrillaUsuarios(): Promise<UsuarioGridDTO[]> {
    return this.get<UsuarioGridDTO[]>("/usuarios/grilla");
  }
}

export const usuarioService = new UsuarioService();
