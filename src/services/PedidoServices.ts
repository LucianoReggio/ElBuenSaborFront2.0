import { apiClienteService } from "./ApiClienteService";
import type { PedidoRequestDTO, PedidoResponseDTO } from "../types/pedidos";

/**
 * Servicio para operaciones de pedidos
 * Usa apiClienteService que maneja automáticamente los tokens de Auth0
 */
export class PedidoService {
  // ==================== CREAR PEDIDO ====================
  async crearPedido(
    pedidoRequest: PedidoRequestDTO
  ): Promise<PedidoResponseDTO> {
    try {
      console.log("🚀 Creando pedido:", pedidoRequest);
      const response = await apiClienteService.post<PedidoResponseDTO>(
        "/pedidos",
        pedidoRequest
      );
      console.log("✅ Pedido creado:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al crear pedido:", error);
      throw this.handleError(error);
    }
  }

  // ==================== OBTENER PEDIDOS ====================
  async getAllPedidos(): Promise<PedidoResponseDTO[]> {
    try {
      const response = await apiClienteService.get<PedidoResponseDTO[]>(
        "/pedidos"
      );
      console.log("📋 Pedidos obtenidos:", response.length);
      return response;
    } catch (error: any) {
      console.error("❌ Error al obtener pedidos:", error);
      throw this.handleError(error);
    }
  }

  async getPedidoById(id: number): Promise<PedidoResponseDTO> {
    try {
      const response = await apiClienteService.get<PedidoResponseDTO>(
        `/pedidos/${id}`
      );
      console.log("📋 Pedido obtenido:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al obtener pedido:", error);
      throw this.handleError(error);
    }
  }

  async getPedidosByCliente(idCliente: number): Promise<PedidoResponseDTO[]> {
    try {
      const response = await apiClienteService.get<PedidoResponseDTO[]>(
        `/pedidos/cliente/${idCliente}`
      );
      console.log(`📋 Pedidos del cliente ${idCliente}:`, response.length);
      return response;
    } catch (error: any) {
      console.error("❌ Error al obtener pedidos del cliente:", error);
      throw this.handleError(error);
    }
  }

  // ==================== CAMBIOS DE ESTADO ====================
  async confirmarPedido(id: number): Promise<PedidoResponseDTO> {
    try {
      const response = await apiClienteService.put<PedidoResponseDTO>(
        `/pedidos/${id}/confirmar`
      );
      console.log("✅ Pedido confirmado:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al confirmar pedido:", error);
      throw this.handleError(error);
    }
  }

  async marcarEnPreparacion(id: number): Promise<PedidoResponseDTO> {
    try {
      const response = await apiClienteService.put<PedidoResponseDTO>(
        `/pedidos/${id}/preparacion`
      );
      console.log("👨‍🍳 Pedido en preparación:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al marcar en preparación:", error);
      throw this.handleError(error);
    }
  }

  async marcarListo(id: number): Promise<PedidoResponseDTO> {
    try {
      const response = await apiClienteService.put<PedidoResponseDTO>(
        `/pedidos/${id}/listo`
      );
      console.log("🍽️ Pedido listo:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al marcar listo:", error);
      throw this.handleError(error);
    }
  }

  async marcarEntregado(id: number): Promise<PedidoResponseDTO> {
    try {
      const response = await apiClienteService.put<PedidoResponseDTO>(
        `/pedidos/${id}/entregado`
      );
      console.log("🚚 Pedido entregado:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al marcar entregado:", error);
      throw this.handleError(error);
    }
  }

  async cancelarPedido(id: number): Promise<PedidoResponseDTO> {
    try {
      const response = await apiClienteService.put<PedidoResponseDTO>(
        `/pedidos/${id}/cancelar`
      );
      console.log("❌ Pedido cancelado:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al cancelar pedido:", error);
      throw this.handleError(error);
    }
  }

  // ==================== VALIDACIONES Y CÁLCULOS ====================
  async validarStockDisponible(
    pedidoRequest: PedidoRequestDTO
  ): Promise<boolean> {
    try {
      const response = await apiClienteService.post<boolean>(
        "/pedidos/validar",
        pedidoRequest
      );
      console.log("🔍 Stock validado:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al validar stock:", error);
      throw this.handleError(error);
    }
  }

  async calcularTotal(pedidoRequest: PedidoRequestDTO): Promise<number> {
    try {
      const response = await apiClienteService.post<number>(
        "/pedidos/calcular-total",
        pedidoRequest
      );
      console.log("💰 Total calculado:", response);
      return response;
    } catch (error: any) {
      console.error("❌ Error al calcular total:", error);
      throw this.handleError(error);
    }
  }

  async calcularTiempoEstimado(
    pedidoRequest: PedidoRequestDTO
  ): Promise<number> {
    try {
      const response = await apiClienteService.post<number>(
        "/pedidos/tiempo-estimado",
        pedidoRequest
      );
      console.log("⏱️ Tiempo estimado:", response, "minutos");
      return response;
    } catch (error: any) {
      console.error("❌ Error al calcular tiempo:", error);
      throw this.handleError(error);
    }
  }

  // ==================== FILTROS PARA DIFERENTES ROLES ====================
  async getPedidosPendientes(): Promise<PedidoResponseDTO[]> {
    try {
      const response = await apiClienteService.get<PedidoResponseDTO[]>(
        "/pedidos/pendientes"
      );
      console.log("⏳ Pedidos pendientes:", response.length);
      return response;
    } catch (error: any) {
      console.error("❌ Error al obtener pedidos pendientes:", error);
      throw this.handleError(error);
    }
  }

  async getPedidosEnPreparacion(): Promise<PedidoResponseDTO[]> {
    try {
      const response = await apiClienteService.get<PedidoResponseDTO[]>(
        "/pedidos/en-preparacion"
      );
      console.log("👨‍🍳 Pedidos en preparación:", response.length);
      return response;
    } catch (error: any) {
      console.error("❌ Error al obtener pedidos en preparación:", error);
      throw this.handleError(error);
    }
  }

  async getPedidosListosParaEntrega(): Promise<PedidoResponseDTO[]> {
    try {
      const response = await apiClienteService.get<PedidoResponseDTO[]>(
        "/pedidos/listos-para-entrega"
      );
      console.log("🚚 Pedidos listos para entrega:", response.length);
      return response;
    } catch (error: any) {
      console.error("❌ Error al obtener pedidos listos:", error);
      throw this.handleError(error);
    }
  }

  // ==================== MANEJO DE ERRORES ====================
  private handleError(error: any): Error {
    return error instanceof Error
      ? error
      : new Error("Error en el servicio de pedidos");
  }

  // ==================== UTILIDADES ESTÁTICAS ====================
  /**
   * Convierte un ItemCarrito[] a DetallePedidoRequestDTO[]
   */
  static convertirCarritoADetalles(
    items: Array<{ id: number; cantidad: number }>
  ) {
    return items.map((item) => ({
      idArticulo: item.id,
      cantidad: item.cantidad,
    }));
  }

  /**
   * Formatea el estado del pedido para mostrar
   */
  static formatearEstado(estado: string): {
    texto: string;
    color: string;
    icono: string;
  } {
    const estados = {
      PENDIENTE: { texto: "Pendiente", color: "yellow", icono: "⏳" },
      PREPARACION: { texto: "En Preparación", color: "blue", icono: "👨‍🍳" },
      ENTREGADO: { texto: "Entregado", color: "green", icono: "✅" },
      CANCELADO: { texto: "Cancelado", color: "red", icono: "❌" },
      RECHAZADO: { texto: "Rechazado", color: "red", icono: "🚫" },
    };

    return (
      estados[estado as keyof typeof estados] || {
        texto: estado,
        color: "gray",
        icono: "❓",
      }
    );
  }

  /**
   * Formatea la fecha y hora estimada
   */
  static formatearTiempos(fecha: string, horaEstimada: string) {
    const fechaObj = new Date(fecha);
    const fechaFormateada = fechaObj.toLocaleDateString("es-AR");
    const horaFormateada = fechaObj.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      fecha: fechaFormateada,
      hora: horaFormateada,
      horaEstimada: horaEstimada.slice(0, 5), // "HH:mm:ss" -> "HH:mm"
    };
  }
}
