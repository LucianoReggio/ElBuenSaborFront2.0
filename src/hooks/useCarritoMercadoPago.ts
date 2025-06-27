// src/hooks/useCarritoMercadoPago.ts
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useCarritoContext } from '../context/CarritoContext';
import { MercadoPagoService } from '../services/MercadoPagoService';
import type { CalculoTotalesDTO, CalcularTotalesRequestDTO } from '../types/mercadopago/MercadoPagoTypes';

const mercadoPagoService = new MercadoPagoService();

export interface UseCarritoMercadoPagoReturn {
    // Estados básicos del carrito (del contexto original)
    items: any[];
    cantidadTotal: number;
    estaVacio: boolean;
    tiempoEstimadoTotal: number;

    // Totales calculados por el backend
    totalesBackend: CalculoTotalesDTO | null;
    cargandoTotales: boolean;
    errorTotales: string | null;

    // Totales formateados para la UI
    subtotal: number;
    descuento: number;
    costoEnvio: number;
    total: number;
    tieneDescuento: boolean;
    resumenDescuento: string;

    // Datos de entrega
    datosEntrega: any;
    setDatosEntrega: (datos: any) => void;

    // Acciones del carrito original
    agregarItem: (producto: any, cantidad?: number) => void;
    removerItem: (idProducto: number) => void;
    actualizarCantidad: (idProducto: number, nuevaCantidad: number) => void;
    incrementarCantidad: (idProducto: number) => void;
    decrementarCantidad: (idProducto: number) => void;
    limpiarCarrito: () => void;

    // Utilidades
    obtenerItem: (idProducto: number) => any | undefined;

    // Nuevas acciones con MercadoPago
    recalcularTotales: () => Promise<void>;
    obtenerTotalesFormateados: () => any;
}

export const useCarritoMercadoPago = (): UseCarritoMercadoPagoReturn => {
    const carrito = useCarritoContext();

    const [totalesBackend, setTotalesBackend] = useState<CalculoTotalesDTO | null>(null);
    const [isCalculandoTotales, setIsCalculandoTotales] = useState(false);
    const [errorTotales, setErrorTotales] = useState<string | null>(null);
    const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
    const isCalculandoRef = useRef(false);

    // ==================== VALIDAR DATOS ANTES DE ENVIAR ====================

    const validarDatosItems = (items: any[]): boolean => {
        if (!items || items.length === 0) {
            console.log('📝 No hay items para validar');
            return false;
        }

        for (const item of items) {
            // Validar que el item tenga las propiedades necesarias
            if (!item.id || !item.cantidad) {
                console.error('❌ Item inválido - falta id o cantidad:', item);
                return false;
            }

            // Validar que sean números válidos
            const idNumero = Number(item.id);
            const cantidadNumero = Number(item.cantidad);

            if (isNaN(idNumero) || isNaN(cantidadNumero)) {
                console.error('❌ Item con datos no numéricos:', { id: item.id, cantidad: item.cantidad });
                return false;
            }

            if (idNumero <= 0 || cantidadNumero <= 0) {
                console.error('❌ Item con valores inválidos:', { id: idNumero, cantidad: cantidadNumero });
                return false;
            }
        }

        console.log('✅ Validación de items exitosa');
        return true;
    };

    // ==================== CONSTRUIR REQUEST CORRECTAMENTE ====================

    const construirRequestCalculo = (): CalcularTotalesRequestDTO | null => {
        if (!validarDatosItems(carrito.items)) {
            return null;
        }

        // 🔧 CORRECCIÓN: Mapear correctamente a la estructura del backend
        const detalles = carrito.items.map(item => ({
            idArticulo: Number(item.id),     // ✅ "idArticulo" (no "id")
            cantidad: Number(item.cantidad)  // ✅ Asegurar que sea número
        }));

        const request: CalcularTotalesRequestDTO = {
            tipoEnvio: carrito.datosEntrega.tipoEnvio,
            detalles,                        // ✅ Estructura correcta
            porcentajeDescuentoTakeAway: 10,
            gastosEnvioDelivery: 200,
            aplicarDescuentoTakeAway: carrito.datosEntrega.tipoEnvio === 'TAKE_AWAY'
        };

        return request;
    };

    // ==================== CALCULAR TOTALES CON VALIDACIÓN ====================

    const recalcularTotales = useCallback(async () => {
        if (isCalculandoRef.current || carrito.estaVacio) {
            console.log('⏭️ Saltando recálculo - ya calculando o carrito vacío');
            return;
        }

        try {
            isCalculandoRef.current = true;
            setIsCalculandoTotales(true);
            setErrorTotales(null);

            // Construir request con validación
            const request = construirRequestCalculo();
            if (!request) {
                console.error('❌ No se pudo construir request válido');
                setErrorTotales('Datos del carrito inválidos');
                return;
            }

            // 📤 LOG DETALLADO DEL REQUEST
            console.log('📤 REQUEST ENVIADO AL BACKEND:');
            console.log('   Estructura completa:', JSON.stringify(request, null, 2));
            console.log('   Tipo de envío:', request.tipoEnvio);
            console.log('   Cantidad de items:', request.detalles.length);
            console.log('   Detalles:', request.detalles);

            const totales = await mercadoPagoService.calcularTotales(request);

            setTotalesBackend(totales);
            console.log('✅ Totales actualizados exitosamente:', totales);

        } catch (error: any) {
            console.error('❌ Error al calcular totales:', error);

            // 📥 LOG DETALLADO DEL ERROR
            if (error.response?.data) {
                console.error('📥 Detalles del error del backend:', error.response.data);
            }

            setErrorTotales(error.message || 'Error al calcular totales');

            // Fallback a cálculos locales
            setTotalesBackend({
                subtotalProductos: carrito.subtotal,
                descuentoTakeAway: carrito.datosEntrega.tipoEnvio === 'TAKE_AWAY' ? carrito.subtotal * 0.1 : 0,
                porcentajeDescuento: carrito.datosEntrega.tipoEnvio === 'TAKE_AWAY' ? 10 : 0,
                gastosEnvio: carrito.costoEnvio,
                totalFinal: carrito.total,
                tipoEnvio: carrito.datosEntrega.tipoEnvio,
                resumenCalculo: 'Cálculo local (backend no disponible)',
                seAplicoDescuento: carrito.datosEntrega.tipoEnvio === 'TAKE_AWAY'
            });
        } finally {
            isCalculandoRef.current = false;
            setIsCalculandoTotales(false);
        }
    }, [carrito.items, carrito.datosEntrega.tipoEnvio, carrito.estaVacio]); // ✅ Sin isCalculandoTotales

    // ==================== DEBOUNCE PARA EVITAR MÚLTIPLES LLAMADAS ====================

    /*const recalcularTotalesDebounced = useCallback((delay = 500) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = window.setTimeout(() => {
            recalcularTotales();
        }, delay);

        setDebounceTimer(timer);
    }, [recalcularTotales]);*/

    // ==================== AUTO-RECALCULAR CON DEBOUNCE ====================

    useEffect(() => {
        console.log('🔄 Trigger recálculo - Items:', carrito.items.length, 'Tipo:', carrito.datosEntrega.tipoEnvio);

        // ✅ DEBOUNCE directo sin dependencias circulares
        const timer = setTimeout(() => {
            if (!isCalculandoRef.current && !carrito.estaVacio && carrito.items.length > 0) {
                recalcularTotales();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [carrito.items, carrito.datosEntrega.tipoEnvio, carrito.estaVacio, recalcularTotales]); // ✅ Todas las dependencias necesarias

    // ==================== TOTALES FORMATEADOS PARA LA UI ====================

    const totalesFormateados = useMemo(() => {
        if (!totalesBackend) {
            // Fallback a los cálculos del carrito original
            return {
                subtotal: carrito.subtotal,
                descuento: 0,
                costoEnvio: carrito.costoEnvio,
                total: carrito.total,
                tieneDescuento: false,
                resumenDescuento: ''
            };
        }

        const formateo = MercadoPagoService.formatearTotales(totalesBackend);

        return {
            subtotal: formateo.subtotal,
            descuento: formateo.descuento,
            costoEnvio: formateo.costoEnvio,
            total: formateo.total,
            tieneDescuento: formateo.tieneDescuento,
            resumenDescuento: formateo.tieneDescuento
                ? `${formateo.porcentajeDescuento}% de descuento por retiro en local`
                : ''
        };
    }, [totalesBackend, carrito.subtotal, carrito.costoEnvio, carrito.total]);

    // ==================== WRAPPER PARA SETDATOSENTREGA ====================

    const setDatosEntregaConRecalculo = (datos: any) => {
        console.log('📦 Cambiando datos de entrega:', datos);
        carrito.setDatosEntrega(datos);
        // El useEffect se encargará de recalcular automáticamente
    };

    // ==================== FUNCIÓN AUXILIAR PARA OBTENER TOTALES ====================

    const obtenerTotalesFormateados = () => {
        return {
            ...totalesFormateados,
            backend: totalesBackend,
            cargando: isCalculandoTotales,
            error: errorTotales,
            tiempoEstimado: carrito.tiempoEstimadoTotal
        };
    };

    return {
        // Estados básicos del carrito
        items: carrito.items,
        cantidadTotal: carrito.cantidadTotal,
        estaVacio: carrito.estaVacio,
        tiempoEstimadoTotal: carrito.tiempoEstimadoTotal,

        // Totales calculados por el backend
        totalesBackend,
        cargandoTotales: isCalculandoTotales,
        errorTotales,

        // Totales formateados para la UI
        subtotal: totalesFormateados.subtotal,
        descuento: totalesFormateados.descuento,
        costoEnvio: totalesFormateados.costoEnvio,
        total: totalesFormateados.total,
        tieneDescuento: totalesFormateados.tieneDescuento,
        resumenDescuento: totalesFormateados.resumenDescuento,

        // Datos de entrega
        datosEntrega: carrito.datosEntrega,
        setDatosEntrega: setDatosEntregaConRecalculo,

        // Acciones del carrito original
        agregarItem: carrito.agregarItem,
        removerItem: carrito.removerItem,
        actualizarCantidad: carrito.actualizarCantidad,
        incrementarCantidad: carrito.incrementarCantidad,
        decrementarCantidad: carrito.decrementarCantidad,
        limpiarCarrito: carrito.limpiarCarrito,

        // Utilidades
        obtenerItem: carrito.obtenerItem,

        // Nuevas acciones con MercadoPago
        recalcularTotales,
        obtenerTotalesFormateados
    };
};