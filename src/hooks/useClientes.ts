import { useState } from "react";
import { ClienteService } from "../services/ClienteService";
import type { ClienteRegisterDTO } from "../types/clientes/Index";

export const useClientes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerCliente = async (data: ClienteRegisterDTO): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await ClienteService.registerCliente(data);
    } catch (err: any) {
      const errorMessage = err.message || "Error al registrar cliente";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerCliente,
    loading,
    error,
  };
};
