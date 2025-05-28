// src/interfaces/IUsuario.ts

import type { Rol } from "./enums/Rol";
import type { Cliente } from "./Cliente";

export interface Usuario {
  idUsuario: number;
  auth0Id: string | null;
  email: string;
  password: string;
  rol: Rol;
  cliente?: Cliente; // Puede ser undefined si aún no fue creado
}
