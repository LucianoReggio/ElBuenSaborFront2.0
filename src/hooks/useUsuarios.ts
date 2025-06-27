// src/hooks/useUsuarios.ts
import { useEffect, useState } from "react";
import { usuarioService } from "../services/UsuarioService";
import type { UsuarioGridDTO } from "../types/usuario/UsuarioGridDTO";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioGridDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usuarioService
      .getGrillaUsuarios()
      .then(setUsuarios)
      .finally(() => setLoading(false));
  }, []);

  return { usuarios, loading };
};
