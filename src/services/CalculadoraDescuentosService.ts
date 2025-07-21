// 📁 CREAR: src/services/CalculadoraDescuentosService.ts

import type { PromocionResponseDTO } from "../types/promociones";
import type { ItemCarrito } from "../types/auxiliares/ItemCarrito";

// ==================== INTERFACES PARA TU PROYECTO ====================

export interface PromocionAplicada {
  idPromocion: number;
  idArticulo: number;
  promocion: PromocionResponseDTO;
  descuentoCalculado: number;
  precioOriginal: number;
  precioFinal: number;
  cantidad: number;
}

export interface PromocionAgrupada {
  idPromocion: number;
  denominacion: string;
  tipoDescuento: "PORCENTUAL" | "MONTO_FIJO";
  valorDescuento: number;
  descripcion: string;
  descuentoAplicado: number;
  articulos: Array<{
    idArticulo: number;
    denominacion: string;
    precioVenta: number;
  }>;
}

export interface ConfiguracionDescuentos {
  aplicarDescuentoTakeAway: boolean;
  porcentajeDescuentoTakeAway: number;
  gastosEnvioDelivery: number;
  tipoEnvio: "DELIVERY" | "TAKE_AWAY";
}

export interface TotalesCalculados {
  // Subtotales
  subtotalOriginal: number;
  subtotalConPromociones: number;
  subtotalConDescuentoTakeAway: number;

  // Descuentos detallados
  descuentoPromociones: number;
  descuentoTakeAway: number;
  descuentoPromocionAgrupada: number;
  descuentoTotal: number;

  // Gastos adicionales
  gastosEnvio: number;

  // Total final
  totalFinal: number;

  // Metadata
  tieneDescuentos: boolean;
  resumenDescuentos: string;
  promocionesAplicadas: PromocionAplicada[];

  // Configuración usada
  configuracion: ConfiguracionDescuentos;
}

export interface DescuentoCalculado {
  montoDescuento: number;
  precioOriginal: number;
  precioFinal: number;
  porcentajeDescuento: number;
  esValido: boolean;
  razonInvalido?: string;
}

// ==================== CALCULADORA PRINCIPAL ====================

export class CalculadoraDescuentosService {
  // Configuración por defecto
  private static readonly CONFIG_DEFAULT: ConfiguracionDescuentos = {
    aplicarDescuentoTakeAway: true,
    porcentajeDescuentoTakeAway: 10,
    gastosEnvioDelivery: 200,
    tipoEnvio: "TAKE_AWAY",
  };

  // ==================== PROMOCIONES INDIVIDUALES ====================

  /**
   * ✅ PRIMER MÉTODO A IMPLEMENTAR: Calcula el descuento de una promoción individual
   * Este reemplaza toda la lógica duplicada en tus componentes
   */
  static calcularDescuentoPromocion(
    promocion: PromocionResponseDTO,
    precioUnitario: number,
    cantidad: number
  ): DescuentoCalculado {
    console.log("🧮 Calculando descuento promoción:", {
      promocion: promocion.denominacion,
      tipo: promocion.tipoDescuento,
      valor: promocion.valorDescuento,
      precio: precioUnitario,
      cantidad,
    });

    // Validaciones básicas
    if (!promocion.estaVigente) {
      return {
        montoDescuento: 0,
        precioOriginal: precioUnitario,
        precioFinal: precioUnitario,
        porcentajeDescuento: 0,
        esValido: false,
        razonInvalido: "Promoción no vigente",
      };
    }

    if (cantidad < promocion.cantidadMinima) {
      return {
        montoDescuento: 0,
        precioOriginal: precioUnitario,
        precioFinal: precioUnitario,
        porcentajeDescuento: 0,
        esValido: false,
        razonInvalido: `Cantidad mínima requerida: ${promocion.cantidadMinima}`,
      };
    }

    // Calcular descuento según tipo
    const totalSinDescuento = precioUnitario * cantidad;
    let montoDescuento = 0;

    if (promocion.tipoDescuento === "PORCENTUAL") {
      montoDescuento = totalSinDescuento * (promocion.valorDescuento / 100);
    } else {
      // MONTO_FIJO
      montoDescuento = Math.min(
        promocion.valorDescuento * cantidad,
        totalSinDescuento
      );
    }

    const descuentoPorUnidad = montoDescuento / cantidad;
    const precioFinal = precioUnitario - descuentoPorUnidad;
    const porcentajeDescuento = (montoDescuento / totalSinDescuento) * 100;

    console.log("✅ Descuento calculado:", {
      montoDescuento,
      precioFinal,
      porcentajeDescuento: `${porcentajeDescuento.toFixed(1)}%`,
    });

    return {
      montoDescuento,
      precioOriginal: precioUnitario,
      precioFinal,
      porcentajeDescuento,
      esValido: true,
    };
  }

  // ==================== PROMOCIÓN AGRUPADA ====================

  /**
   * ✅ SEGUNDO MÉTODO: Calcula el descuento de una promoción agrupada
   */
  static calcularDescuentoPromocionAgrupada(
    promocionAgrupada: PromocionAgrupada,
    subtotalOriginal: number
  ): DescuentoCalculado {
    console.log("🎁 Calculando descuento promoción agrupada:", {
      promocion: promocionAgrupada.denominacion,
      tipo: promocionAgrupada.tipoDescuento,
      valor: promocionAgrupada.valorDescuento,
      subtotal: subtotalOriginal,
    });

    if (subtotalOriginal <= 0) {
      return {
        montoDescuento: 0,
        precioOriginal: subtotalOriginal,
        precioFinal: subtotalOriginal,
        porcentajeDescuento: 0,
        esValido: false,
        razonInvalido: "Subtotal inválido",
      };
    }

    let montoDescuento = 0;

    if (promocionAgrupada.tipoDescuento === "PORCENTUAL") {
      montoDescuento =
        subtotalOriginal * (promocionAgrupada.valorDescuento / 100);
    } else {
      montoDescuento = Math.min(
        promocionAgrupada.valorDescuento,
        subtotalOriginal
      );
    }

    const precioFinal = subtotalOriginal - montoDescuento;
    const porcentajeDescuento = (montoDescuento / subtotalOriginal) * 100;

    return {
      montoDescuento,
      precioOriginal: subtotalOriginal,
      precioFinal,
      porcentajeDescuento,
      esValido: true,
    };
  }

  // ==================== DESCUENTO TAKE_AWAY ====================

  /**
   * ✅ TERCER MÉTODO: Calcula el descuento automático para TAKE_AWAY
   */
  static calcularDescuentoTakeAway(
    subtotal: number,
    configuracion: Partial<ConfiguracionDescuentos> = {}
  ): DescuentoCalculado {
    const config = { ...this.CONFIG_DEFAULT, ...configuracion };

    console.log("🏪 Calculando descuento TAKE_AWAY:", {
      subtotal,
      aplicar: config.aplicarDescuentoTakeAway,
      porcentaje: config.porcentajeDescuentoTakeAway,
      tipoEnvio: config.tipoEnvio,
    });

    if (
      !config.aplicarDescuentoTakeAway ||
      config.tipoEnvio !== "TAKE_AWAY" ||
      subtotal <= 0
    ) {
      return {
        montoDescuento: 0,
        precioOriginal: subtotal,
        precioFinal: subtotal,
        porcentajeDescuento: 0,
        esValido: false,
        razonInvalido: "No aplica descuento TAKE_AWAY",
      };
    }

    const montoDescuento =
      subtotal * (config.porcentajeDescuentoTakeAway / 100);
    const precioFinal = subtotal - montoDescuento;

    return {
      montoDescuento,
      precioOriginal: subtotal,
      precioFinal,
      porcentajeDescuento: config.porcentajeDescuentoTakeAway,
      esValido: true,
    };
  }

  // ==================== CÁLCULO COMPLETO DE CARRITO ====================

  /**
   * ✅ MÉTODO PRINCIPAL: Calcula todos los totales del carrito con promociones
   * Este es el método que reemplazará toda la lógica dispersa en tus hooks
   */
  static calcularTotalesCarrito(
    items: ItemCarrito[],
    promocionesSeleccionadas: Map<number, number> = new Map(),
    promocionesDisponibles: Map<number, PromocionResponseDTO[]> = new Map(),
    promocionAgrupada: PromocionAgrupada | null = null,
    configuracion: Partial<ConfiguracionDescuentos> = {}
  ): TotalesCalculados {
    const config = { ...this.CONFIG_DEFAULT, ...configuracion };

    console.log("💰 === CALCULANDO TOTALES COMPLETOS ===");
    console.log("Items:", items.length);
    console.log("Promociones seleccionadas:", promocionesSeleccionadas.size);
    console.log(
      "Promoción agrupada:",
      promocionAgrupada?.denominacion || "Ninguna"
    );

    // 1. Subtotal original
    const subtotalOriginal = items.reduce(
      (sum, item) => sum + item.precio * item.cantidad,
      0
    );
    console.log("💰 Subtotal original:", subtotalOriginal);

    // 2. Aplicar promociones individuales
    const promocionesAplicadas: PromocionAplicada[] = [];
    let descuentoPromociones = 0;

    for (const item of items) {
      const idPromocionSeleccionada = promocionesSeleccionadas.get(item.id);

      if (idPromocionSeleccionada) {
        const promocionesItem = promocionesDisponibles.get(item.id) || [];
        const promocion = promocionesItem.find(
          (p) => p.idPromocion === idPromocionSeleccionada
        );

        if (promocion) {
          const descuentoCalculado = this.calcularDescuentoPromocion(
            promocion,
            item.precio,
            item.cantidad
          );

          if (descuentoCalculado.esValido) {
            promocionesAplicadas.push({
              idPromocion: promocion.idPromocion,
              idArticulo: item.id,
              promocion,
              descuentoCalculado: descuentoCalculado.montoDescuento,
              precioOriginal: item.precio,
              precioFinal: descuentoCalculado.precioFinal,
              cantidad: item.cantidad,
            });

            descuentoPromociones += descuentoCalculado.montoDescuento;
          }
        }
      }
    }

    console.log("🎯 Descuento promociones individuales:", descuentoPromociones);

    // 3. Aplicar promoción agrupada
    let descuentoPromocionAgrupada = 0;
    if (promocionAgrupada) {
      const descuentoAgrupada = this.calcularDescuentoPromocionAgrupada(
        promocionAgrupada,
        subtotalOriginal
      );

      if (descuentoAgrupada.esValido) {
        descuentoPromocionAgrupada = descuentoAgrupada.montoDescuento;
      }
    }

    console.log("🎁 Descuento promoción agrupada:", descuentoPromocionAgrupada);

    // 4. Subtotal con promociones
    const subtotalConPromociones =
      subtotalOriginal - descuentoPromociones - descuentoPromocionAgrupada;

    // 5. Aplicar descuento TAKE_AWAY
    let descuentoTakeAway = 0;
    let subtotalConDescuentoTakeAway = subtotalConPromociones;

    if (config.aplicarDescuentoTakeAway && config.tipoEnvio === "TAKE_AWAY") {
      const descuentoCalculado = this.calcularDescuentoTakeAway(
        subtotalOriginal,
        config
      );

      if (descuentoCalculado.esValido) {
        descuentoTakeAway = descuentoCalculado.montoDescuento;
        subtotalConDescuentoTakeAway =
          subtotalConPromociones - descuentoTakeAway;
      }
    }

    console.log("🏪 Descuento TAKE_AWAY:", descuentoTakeAway);

    // 6. Gastos de envío
    const gastosEnvio =
      config.tipoEnvio === "DELIVERY" ? config.gastosEnvioDelivery : 0;
    console.log("🚚 Gastos envío:", gastosEnvio);

    // 7. Totales finales
    const descuentoTotal =
      descuentoPromociones + descuentoPromocionAgrupada + descuentoTakeAway;
    const totalFinal = Math.max(0, subtotalConDescuentoTakeAway + gastosEnvio);

    // 8. Generar resumen
    const resumenDescuentos = this.generarResumenDescuentos(
      descuentoPromociones,
      descuentoPromocionAgrupada,
      descuentoTakeAway,
      promocionesAplicadas,
      promocionAgrupada
    );

    const resultado: TotalesCalculados = {
      subtotalOriginal,
      subtotalConPromociones,
      subtotalConDescuentoTakeAway,
      descuentoPromociones,
      descuentoTakeAway,
      descuentoPromocionAgrupada,
      descuentoTotal,
      gastosEnvio,
      totalFinal,
      tieneDescuentos: descuentoTotal > 0,
      resumenDescuentos,
      promocionesAplicadas,
      configuracion: config,
    };

    console.log("💰 === TOTALES FINALES ===");
    console.log("Subtotal original:", subtotalOriginal);
    console.log("Descuento total:", descuentoTotal);
    console.log("Total final:", totalFinal);

    return resultado;
  }

  // ==================== UTILIDADES ====================

  /**
   * Genera resumen textual de descuentos aplicados
   */
  private static generarResumenDescuentos(
    descuentoPromociones: number,
    descuentoPromocionAgrupada: number,
    descuentoTakeAway: number,
    promocionesAplicadas: PromocionAplicada[],
    promocionAgrupada: PromocionAgrupada | null
  ): string {
    const descuentos: string[] = [];

    // Promociones individuales
    if (descuentoPromociones > 0) {
      const cantidadPromociones = promocionesAplicadas.length;
      descuentos.push(
        `${cantidadPromociones} promoción${
          cantidadPromociones > 1 ? "es" : ""
        } (-$${descuentoPromociones.toFixed(0)})`
      );
    }

    // Promoción agrupada
    if (descuentoPromocionAgrupada > 0 && promocionAgrupada) {
      descuentos.push(
        `${
          promocionAgrupada.denominacion
        } (-$${descuentoPromocionAgrupada.toFixed(0)})`
      );
    }

    // Descuento TAKE_AWAY
    if (descuentoTakeAway > 0) {
      descuentos.push(
        `10% retiro en local (-$${descuentoTakeAway.toFixed(0)})`
      );
    }

    if (descuentos.length === 0) {
      return "Sin descuentos aplicados";
    }

    const totalDescuento =
      descuentoPromociones + descuentoPromocionAgrupada + descuentoTakeAway;
    return `${descuentos.join(", ")} • Total ahorro: $${totalDescuento.toFixed(
      0
    )}`;
  }

  /**
   * ✅ UTILIDAD: Valida si una promoción es aplicable a un artículo
   */
  static validarPromocionAplicable(
    promocion: PromocionResponseDTO,
    idArticulo: number,
    cantidad: number
  ): { esAplicable: boolean; razon?: string } {
    if (!promocion.estaVigente) {
      return { esAplicable: false, razon: "Promoción no vigente" };
    }

    if (cantidad < promocion.cantidadMinima) {
      return {
        esAplicable: false,
        razon: `Cantidad mínima requerida: ${promocion.cantidadMinima}`,
      };
    }

    const articulo = promocion.articulos.find(
      (art) => art.idArticulo === idArticulo
    );
    if (!articulo) {
      return {
        esAplicable: false,
        razon: "Promoción no aplica a este artículo",
      };
    }

    return { esAplicable: true };
  }

  /**
   * ✅ UTILIDAD: Formatea un monto para mostrar
   */
  static formatearMonto(monto: number): string {
    return `$${monto.toFixed(0)}`;
  }

  /**
   * ✅ UTILIDAD: Formatea un porcentaje para mostrar
   */
  static formatearPorcentaje(porcentaje: number): string {
    return `${porcentaje.toFixed(1)}%`;
  }
}
