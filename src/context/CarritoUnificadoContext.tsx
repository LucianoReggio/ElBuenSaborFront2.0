import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  CalculadoraDescuentosService,
  type TotalesCalculados,
  type PromocionAgrupada,
  type ConfiguracionDescuentos,
} from "../services/CalculadoraDescuentosService";
import type { ItemCarrito } from "../types/auxiliares/ItemCarrito";
import type { DatosEntrega } from "../types/auxiliares/DatosEntrega";
import type { PromocionResponseDTO } from "../types/promociones";

// ==================== INTERFACES ====================

export interface CarritoState {
  // Items del carrito
  items: ItemCarrito[];

  // Promociones
  promocionesSeleccionadas: Map<number, number>; // idArticulo -> idPromocion
  promocionesDisponibles: Map<number, PromocionResponseDTO[]>; // idArticulo -> promociones[]
  promocionAgrupada: PromocionAgrupada | null;

  // Datos de entrega
  datosEntrega: DatosEntrega;

  // Totales calculados
  totales: TotalesCalculados | null;

  // Estados de la UI
  loading: boolean;
  error: string | null;

  // Configuración
  configuracion: ConfiguracionDescuentos;
}

export type CarritoAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "AGREGAR_ITEM"; payload: { producto: any; cantidad: number } }
  | { type: "REMOVER_ITEM"; payload: number }
  | {
      type: "ACTUALIZAR_CANTIDAD";
      payload: { idArticulo: number; cantidad: number };
    }
  | { type: "LIMPIAR_CARRITO" }
  | { type: "SET_DATOS_ENTREGA"; payload: DatosEntrega }
  | {
      type: "SET_PROMOCIONES_DISPONIBLES";
      payload: { idArticulo: number; promociones: PromocionResponseDTO[] };
    }
  | {
      type: "SELECCIONAR_PROMOCION";
      payload: { idArticulo: number; idPromocion: number | undefined };
    }
  | { type: "SET_PROMOCION_AGRUPADA"; payload: PromocionAgrupada | null }
  | { type: "RECALCULAR_TOTALES" }
  | {
      type: "SET_CONFIGURACION";
      payload: Partial<ConfiguracionDescuentos>;
    };

export interface CarritoContextValue {
  // Estado
  state: CarritoState;

  // Getters computados
  estaVacio: boolean;
  cantidadTotal: number;
  cantidadTotalItems: number; // ✅ NUEVO: Contador correcto de items únicos
  subtotal: number;
  total: number;
  tieneDescuentos: boolean;

  // Acciones de items
  agregarItem: (producto: any, cantidad?: number) => void;
  removerItem: (idArticulo: number) => void;
  actualizarCantidad: (idArticulo: number, cantidad: number) => void;
  incrementarCantidad: (idArticulo: number) => void;
  decrementarCantidad: (idArticulo: number) => void;
  limpiarCarrito: () => void;

  // Acciones de promociones
  cargarPromocionesParaItem: (idArticulo: number) => Promise<void>;
  seleccionarPromocion: (
    idArticulo: number,
    idPromocion: number | undefined
  ) => void;
  aplicarPromocionAgrupada: (promocion: PromocionAgrupada) => void;
  quitarPromocionAgrupada: () => void;

  // Acciones de entrega
  setDatosEntrega: (datos: DatosEntrega) => void;

  // Utilidades
  obtenerItem: (idArticulo: number) => ItemCarrito | undefined;
  getPromocionesDisponibles: (idArticulo: number) => PromocionResponseDTO[];
  recalcularTotales: () => void;
}

// ==================== ESTADO INICIAL ====================

const initialState: CarritoState = {
  items: [],
  promocionesSeleccionadas: new Map(),
  promocionesDisponibles: new Map(),
  promocionAgrupada: null,
  datosEntrega: {
    tipoEnvio: "TAKE_AWAY",
    observaciones: "",
  },
  totales: null,
  loading: false,
  error: null,
  configuracion: {
    aplicarDescuentoTakeAway: true,
    porcentajeDescuentoTakeAway: 10,
    gastosEnvioDelivery: 200,
    tipoEnvio: "TAKE_AWAY",
  },
};

// ==================== REDUCER ====================

function carritoReducer(
  state: CarritoState,
  action: CarritoAction
): CarritoState {
  console.log(
    "🔄 CarritoReducer:",
    action.type,
    "payload" in action ? action.payload : "(sin payload)"
  );

  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "AGREGAR_ITEM": {
      const { producto, cantidad } = action.payload;
      const itemExistente = state.items.find(
        (item) => item.id === producto.idArticulo
      );

      if (itemExistente) {
        // Incrementar cantidad del item existente
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === producto.idArticulo
              ? { ...item, cantidad: item.cantidad + cantidad }
              : item
          ),
          error: null,
        };
      } else {
        // Agregar nuevo item
        const nuevoItem: ItemCarrito = {
          id: producto.idArticulo,
          nombre: producto.denominacion,
          cantidad,
          precio: producto.precioVenta,
          imagen: producto.imagenes?.[0]?.url,
          tiempoPreparacion: producto.tiempoEstimadoEnMinutos,
        };

        return {
          ...state,
          items: [...state.items, nuevoItem],
          error: null,
        };
      }
    }

    case "REMOVER_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        promocionesSeleccionadas: new Map(
          Array.from(state.promocionesSeleccionadas.entries()).filter(
            ([idArticulo]) => idArticulo !== action.payload
          )
        ),
      };

    case "ACTUALIZAR_CANTIDAD": {
      const { idArticulo, cantidad } = action.payload;

      if (cantidad <= 0) {
        // Si cantidad es 0 o menor, remover el item
        return carritoReducer(state, {
          type: "REMOVER_ITEM",
          payload: idArticulo,
        });
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === idArticulo ? { ...item, cantidad } : item
        ),
      };
    }

    case "LIMPIAR_CARRITO":
      return {
        ...state,
        items: [],
        promocionesSeleccionadas: new Map(),
        promocionesDisponibles: new Map(),
        promocionAgrupada: null,
        totales: null,
        error: null,
      };

    case "SET_DATOS_ENTREGA": {
      // Actualizar configuración automáticamente según tipo de envío
      const nuevaConfiguracion = {
        ...state.configuracion,
        aplicarDescuentoTakeAway: action.payload.tipoEnvio === "TAKE_AWAY",
        tipoEnvio: action.payload.tipoEnvio,
      };

      return {
        ...state,
        datosEntrega: action.payload,
        configuracion: nuevaConfiguracion,
      };
    }

    case "SET_PROMOCIONES_DISPONIBLES": {
      const { idArticulo, promociones } = action.payload;
      const nuevasPromociones = new Map(state.promocionesDisponibles);
      nuevasPromociones.set(idArticulo, promociones);

      return {
        ...state,
        promocionesDisponibles: nuevasPromociones,
      };
    }

    case "SELECCIONAR_PROMOCION": {
      const { idArticulo, idPromocion } = action.payload;
      const nuevasSelecciones = new Map(state.promocionesSeleccionadas);

      if (idPromocion) {
        nuevasSelecciones.set(idArticulo, idPromocion);
      } else {
        nuevasSelecciones.delete(idArticulo);
      }

      return {
        ...state,
        promocionesSeleccionadas: nuevasSelecciones,
      };
    }

    case "SET_PROMOCION_AGRUPADA": {
      if (!action.payload) {
        // Si se quita la promoción agrupada, solo quitarla
        return {
          ...state,
          promocionAgrupada: null,
        };
      }

      // ✅ FIX 2: NO PISAR productos existentes, solo agregar los que faltan
      console.log(
        "🎁 Aplicando promoción agrupada SIN pisar productos existentes"
      );
      console.log(
        "Items actuales:",
        state.items.map((i) => `${i.nombre} (id: ${i.id})`)
      );
      console.log(
        "Promoción articulos:",
        action.payload.articulos.map(
          (a: any) => `${a.denominacion} (id: ${a.idArticulo})`
        )
      );

      // ✅ FIX: Verificar que no se duplique la misma promoción
      if (state.promocionAgrupada?.idPromocion === action.payload.idPromocion) {
        console.log("⚠️ Promoción ya está aplicada, evitando duplicación");
        return state; // No hacer nada si es la misma promoción
      }

      // Identificar qué productos de la promoción NO están en el carrito
      const productosPromoFaltantes = action.payload.articulos.filter(
        (artPromo: any) =>
          !state.items.some((item) => item.id === artPromo.idArticulo)
      );

      console.log(
        "Productos de promo faltantes:",
        productosPromoFaltantes.map(
          (a: any) => `${a.denominacion} (id: ${a.idArticulo})`
        )
      );

      // Crear items para los productos faltantes SOLO con cantidad 1
      const nuevosItemsPromo: ItemCarrito[] = productosPromoFaltantes.map(
        (art: any) => ({
          id: art.idArticulo,
          nombre: art.denominacion,
          cantidad: 1, // ✅ SIEMPRE cantidad 1 para promoción agrupada
          precio: art.precioVenta,
          imagen: undefined, // Se puede agregar si está disponible
          tiempoPreparacion: undefined,
        })
      );

      console.log(
        "Nuevos items a agregar:",
        nuevosItemsPromo.map((i) => `${i.nombre} (id: ${i.id})`)
      );

      const itemsFinales = [...state.items, ...nuevosItemsPromo];
      console.log(
        "Items finales:",
        itemsFinales.map((i) => `${i.nombre} x${i.cantidad} (id: ${i.id})`)
      );

      return {
        ...state,
        items: itemsFinales,
        promocionAgrupada: action.payload,
      };
    }

    case "RECALCULAR_TOTALES": {
      // Usar la CalculadoraDescuentosService para consistency
      if (state.items.length === 0) {
        return {
          ...state,
          totales: null,
        };
      }

      try {
        const totales = CalculadoraDescuentosService.calcularTotalesCarrito(
          state.items,
          state.promocionesSeleccionadas,
          state.promocionesDisponibles,
          state.promocionAgrupada,
          state.configuracion
        );

        return {
          ...state,
          totales,
          error: null,
        };
      } catch (error: any) {
        console.error("❌ Error calculando totales:", error);
        return {
          ...state,
          error: error.message,
        };
      }
    }

    case "SET_CONFIGURACION":
      return {
        ...state,
        configuracion: { ...state.configuracion, ...action.payload },
      };

    default:
      return state;
  }
}

// ==================== CONTEXT ====================

const CarritoContext = createContext<CarritoContextValue | null>(null);

// ==================== PROVIDER ====================

interface CarritoProviderProps {
  children: React.ReactNode;
}

export const CarritoUnificadoProvider: React.FC<CarritoProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(carritoReducer, initialState);

  // ==================== GETTERS COMPUTADOS ====================

  const estaVacio = state.items.length === 0;

  // ✅ FIX 1: Contador correcto - suma de cantidades PERO cuenta items en promo como 1 unidad
  const cantidadTotal = useMemo(() => {
    return state.items.reduce((total, item) => {
      // Si el item está en una promoción agrupada, cuenta como 1 independientemente de la cantidad
      const estaEnPromoAgrupada = state.promocionAgrupada?.articulos?.some(
        (art: any) => art.idArticulo === item.id
      );

      if (estaEnPromoAgrupada) {
        return total + 1; // Solo cuenta como 1 item por estar en promo
      }

      return total + item.cantidad; // Items normales cuentan su cantidad real
    }, 0);
  }, [state.items, state.promocionAgrupada]);

  // ✅ NUEVO: Contador de items únicos (para mostrar "X productos")
  const cantidadTotalItems = state.items.length;

  const subtotal =
    state.totales?.subtotalOriginal ||
    state.items.reduce((total, item) => total + item.precio * item.cantidad, 0);
  const total = state.totales?.totalFinal || subtotal;
  const tieneDescuentos = state.totales?.tieneDescuentos || false;

  // ==================== ACCIONES DE ITEMS ====================

  const agregarItem = useCallback((producto: any, cantidad: number = 1) => {
    console.log(
      "➕ Agregando item al carrito:",
      producto.denominacion,
      "x",
      cantidad
    );
    dispatch({ type: "AGREGAR_ITEM", payload: { producto, cantidad } });
  }, []);

  const removerItem = useCallback((idArticulo: number) => {
    console.log("🗑️ Removiendo item del carrito:", idArticulo);
    dispatch({ type: "REMOVER_ITEM", payload: idArticulo });
  }, []);

  const actualizarCantidad = useCallback(
    (idArticulo: number, cantidad: number) => {
      console.log("🔄 Actualizando cantidad:", idArticulo, "→", cantidad);
      dispatch({
        type: "ACTUALIZAR_CANTIDAD",
        payload: { idArticulo, cantidad },
      });
    },
    []
  );

  const incrementarCantidad = useCallback(
    (idArticulo: number) => {
      const item = state.items.find((i) => i.id === idArticulo);
      if (item) {
        actualizarCantidad(idArticulo, item.cantidad + 1);
      }
    },
    [state.items, actualizarCantidad]
  );

  const decrementarCantidad = useCallback(
    (idArticulo: number) => {
      const item = state.items.find((i) => i.id === idArticulo);
      if (item && item.cantidad > 1) {
        actualizarCantidad(idArticulo, item.cantidad - 1);
      } else if (item && item.cantidad === 1) {
        removerItem(idArticulo);
      }
    },
    [state.items, actualizarCantidad, removerItem]
  );

  const limpiarCarrito = useCallback(() => {
    console.log("🧹 Limpiando carrito completo");
    dispatch({ type: "LIMPIAR_CARRITO" });
  }, []);

  // ==================== ACCIONES DE PROMOCIONES ====================

  const cargarPromocionesParaItem = useCallback(
    async (idArticulo: number) => {
      if (state.promocionesDisponibles.has(idArticulo)) {
        console.log("✅ Promociones ya cargadas para artículo:", idArticulo);
        return;
      }

      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // Importar dinámicamente el service para evitar dependencias circulares
        const { PromocionService } = await import(
          "../services/PromocionService"
        );
        const promocionService = new PromocionService();

        const promociones = await promocionService.getPromocionesParaArticulo(
          idArticulo
        );

        dispatch({
          type: "SET_PROMOCIONES_DISPONIBLES",
          payload: { idArticulo, promociones },
        });

        console.log(
          `✅ Cargadas ${promociones.length} promociones para artículo ${idArticulo}`
        );
      } catch (error: any) {
        console.error("❌ Error cargando promociones:", error);
        dispatch({ type: "SET_ERROR", payload: error.message });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.promocionesDisponibles]
  );

  const seleccionarPromocion = useCallback(
    (idArticulo: number, idPromocion: number | undefined) => {
      console.log("🎯 Seleccionando promoción:", { idArticulo, idPromocion });
      dispatch({
        type: "SELECCIONAR_PROMOCION",
        payload: { idArticulo, idPromocion },
      });
    },
    []
  );

  const aplicarPromocionAgrupada = useCallback(
    (promocion: PromocionAgrupada) => {
      console.log("🎁 Aplicando promoción agrupada:", promocion.denominacion);
      dispatch({ type: "SET_PROMOCION_AGRUPADA", payload: promocion });
    },
    []
  );

  const quitarPromocionAgrupada = useCallback(() => {
    console.log("❌ Quitando promoción agrupada");
    dispatch({ type: "SET_PROMOCION_AGRUPADA", payload: null });
  }, []);

  // ==================== ACCIONES DE ENTREGA ====================

  const setDatosEntrega = useCallback((datos: DatosEntrega) => {
    console.log("📦 Actualizando datos de entrega:", datos);
    dispatch({ type: "SET_DATOS_ENTREGA", payload: datos });
  }, []);

  // ==================== RECÁLCULO AUTOMÁTICO ====================

  const recalcularTotales = useCallback(() => {
    console.log("💰 Recalculando totales automáticamente...");
    dispatch({ type: "RECALCULAR_TOTALES" });
  }, []);

  // Effect para recalcular totales automáticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.items.length > 0) {
        recalcularTotales();
      }
    }, 100); // Debounce de 100ms

    return () => clearTimeout(timer);
  }, [
    state.items,
    state.promocionesSeleccionadas,
    state.promocionAgrupada,
    state.configuracion,
    recalcularTotales,
  ]);

  // ==================== UTILIDADES ====================

  const obtenerItem = useCallback(
    (idArticulo: number) => {
      return state.items.find((item) => item.id === idArticulo);
    },
    [state.items]
  );

  const getPromocionesDisponibles = useCallback(
    (idArticulo: number) => {
      return state.promocionesDisponibles.get(idArticulo) || [];
    },
    [state.promocionesDisponibles]
  );

  // ==================== VALOR DEL CONTEXT ====================

  const contextValue: CarritoContextValue = useMemo(
    () => ({
      // Estado
      state,

      // Getters computados
      estaVacio,
      cantidadTotal,
      cantidadTotalItems, // ✅ NUEVO
      subtotal,
      total,
      tieneDescuentos,

      // Acciones de items
      agregarItem,
      removerItem,
      actualizarCantidad,
      incrementarCantidad,
      decrementarCantidad,
      limpiarCarrito,

      // Acciones de promociones
      cargarPromocionesParaItem,
      seleccionarPromocion,
      aplicarPromocionAgrupada,
      quitarPromocionAgrupada,

      // Acciones de entrega
      setDatosEntrega,

      // Utilidades
      obtenerItem,
      getPromocionesDisponibles,
      recalcularTotales,
    }),
    [
      state,
      estaVacio,
      cantidadTotal,
      cantidadTotalItems,
      subtotal,
      total,
      tieneDescuentos,
      agregarItem,
      removerItem,
      actualizarCantidad,
      incrementarCantidad,
      decrementarCantidad,
      limpiarCarrito,
      cargarPromocionesParaItem,
      seleccionarPromocion,
      aplicarPromocionAgrupada,
      quitarPromocionAgrupada,
      setDatosEntrega,
      obtenerItem,
      getPromocionesDisponibles,
      recalcularTotales,
    ]
  );

  return (
    <CarritoContext.Provider value={contextValue}>
      {children}
    </CarritoContext.Provider>
  );
};

// ==================== HOOKS ESPECIALIZADOS ====================

export const useCarritoUnificado = (): CarritoContextValue => {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error(
      "useCarritoUnificado debe usarse dentro de CarritoUnificadoProvider"
    );
  }

  return context;
};

// Hook especializado para solo totales (mejor performance)
export const useCarritoTotales = () => {
  const { state } = useCarritoUnificado();

  return useMemo(
    () => ({
      totales: state.totales,
      subtotal: state.totales?.subtotalOriginal || 0,
      descuentoTotal: state.totales?.descuentoTotal || 0,
      gastosEnvio: state.totales?.gastosEnvio || 0,
      total: state.totales?.totalFinal || 0,
      tieneDescuentos: state.totales?.tieneDescuentos || false,
      resumenDescuentos: state.totales?.resumenDescuentos || "",
      loading: state.loading,
    }),
    [state.totales, state.loading]
  );
};

// Hook especializado para solo promociones (mejor performance)
export const useCarritoPromociones = () => {
  const {
    state,
    cargarPromocionesParaItem,
    seleccionarPromocion,
    aplicarPromocionAgrupada,
    quitarPromocionAgrupada,
    getPromocionesDisponibles,
  } = useCarritoUnificado();

  return useMemo(
    () => ({
      promocionesSeleccionadas: state.promocionesSeleccionadas,
      promocionAgrupada: state.promocionAgrupada,
      promocionesAplicadas: state.totales?.promocionesAplicadas || [],
      cargarPromocionesParaItem,
      seleccionarPromocion,
      aplicarPromocionAgrupada,
      quitarPromocionAgrupada,
      getPromocionesDisponibles,
      loading: state.loading,
    }),
    [
      state.promocionesSeleccionadas,
      state.promocionAgrupada,
      state.totales?.promocionesAplicadas,
      state.loading,
      cargarPromocionesParaItem,
      seleccionarPromocion,
      aplicarPromocionAgrupada,
      quitarPromocionAgrupada,
      getPromocionesDisponibles,
    ]
  );
};

// ✅ Hook especializado para solo items (mejor performance) - ACTUALIZADO
export const useCarritoItems = () => {
  const {
    state,
    estaVacio,
    cantidadTotal,
    cantidadTotalItems, // ✅ NUEVO
    agregarItem,
    removerItem,
    actualizarCantidad,
    incrementarCantidad,
    decrementarCantidad,
    limpiarCarrito,
    obtenerItem,
  } = useCarritoUnificado();

  return useMemo(
    () => ({
      items: state.items,
      estaVacio,
      cantidadTotal,
      cantidadTotalItems, // ✅ NUEVO: Para mostrar "X productos"
      agregarItem,
      removerItem,
      actualizarCantidad,
      incrementarCantidad,
      decrementarCantidad,
      limpiarCarrito,
      obtenerItem,
      loading: state.loading,
    }),
    [
      state.items,
      state.loading,
      estaVacio,
      cantidadTotal,
      cantidadTotalItems,
      agregarItem,
      removerItem,
      actualizarCantidad,
      incrementarCantidad,
      decrementarCantidad,
      limpiarCarrito,
      obtenerItem,
    ]
  );
};

export default CarritoUnificadoProvider;
