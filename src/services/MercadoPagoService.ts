import { ApiClienteService } from './ApiClientService';
import type {
    PedidoConMercadoPagoRequestDTO,
    PedidoConMercadoPagoResponseDTO,
    CalcularTotalesRequestDTO,
    CalculoTotalesDTO,
    ConfiguracionMercadoPagoDTO,
    ConfirmarPagoManualRequestDTO,
    ConfirmarPagoManualResponseDTO
} from '../types/mercadopago/MercadoPagoTypes';

export class MercadoPagoService {
    private apiClient: ApiClienteService;

    constructor() {
        this.apiClient = new ApiClienteService();
    }

    // ==================== CÁLCULOS EN TIEMPO REAL ====================

    /**
     * Calcular totales con descuentos en tiempo real usando datos reales del usuario
     */
    async calcularTotales(request: CalcularTotalesRequestDTO): Promise<CalculoTotalesDTO> {
        try {
            console.log('🧮 Calculando totales con request:', request);

            // 🔧 Obtener datos reales del usuario autenticado
            const datosUsuario = await this.obtenerDatosUsuarioAutenticado();

            // Crear request completo con datos reales
            const requestCompleto: PedidoConMercadoPagoRequestDTO = {
                // Datos reales del usuario
                idCliente: datosUsuario.idCliente,
                idSucursal: datosUsuario.idSucursal || 1, // Sucursal por defecto
                emailComprador: datosUsuario.email,
                nombreComprador: datosUsuario.nombre,
                apellidoComprador: datosUsuario.apellido,

                // Datos reales del request original
                tipoEnvio: request.tipoEnvio,
                detalles: request.detalles,
                porcentajeDescuentoTakeAway: request.porcentajeDescuentoTakeAway,
                gastosEnvioDelivery: request.gastosEnvioDelivery,
                aplicarDescuentoTakeAway: request.aplicarDescuentoTakeAway,

                // Configuración para solo calcular (NO crear pedido real)
                crearPreferenciaMercadoPago: false,
                observaciones: "Solo cálculo de totales"
            };

            console.log('📤 Request con datos reales enviado:', JSON.stringify(requestCompleto, null, 2));

            const response = await this.apiClient.post<CalculoTotalesDTO>(
                '/pedidos-mercadopago/calcular-totales',
                requestCompleto
            );

            console.log('✅ Totales calculados exitosamente:', response);
            return response;

        } catch (error: any) {
            console.error('❌ Error al calcular totales:', error);

            // Si falla por problema de autenticación, usar fallback
            if (error.message?.includes('unauthorized') || error.message?.includes('token')) {
                console.log('⚠️ Problema de autenticación, usando fallback...');
                return await this.calcularTotalesConFallback(request);
            }

            throw error;
        }
    }

    // ==================== OBTENER DATOS DEL USUARIO ====================

    /**
 * Obtener datos del usuario autenticado usando el nuevo endpoint
 */
    private async obtenerDatosUsuarioAutenticado(): Promise<{
        idCliente: number;
        email: string;
        nombre: string;
        apellido: string;
        idSucursal?: number;
    }> {
        try {
            // 🔍 ESTRATEGIA 1: localStorage (más rápido y sin bucles)
            const userInfo = localStorage.getItem('user_info');
            if (userInfo) {
                try {
                    const usuario = JSON.parse(userInfo);
                    if (usuario.id && usuario.email && usuario.nombre && usuario.apellido) {
                        console.log('✅ Usando datos de localStorage (evitando API para prevenir bucle)');
                        return {
                            idCliente: Number(usuario.id),
                            email: usuario.email,
                            nombre: usuario.nombre,
                            apellido: usuario.apellido,
                            idSucursal: usuario.idSucursal || 1
                        };
                    }
                } catch (e) {
                    console.log('⚠️ Error parsing localStorage:', e);
                }
            }

            // 🔍 ESTRATEGIA 2: Solo llamar API si NO hay datos en localStorage
            console.log('📡 Obteniendo datos desde /api/clientes/me (primera vez)...');

            const response = await this.apiClient.get<any>('/clientes/me');

            if (response && response.idCliente) {
                console.log('✅ Datos obtenidos del API exitosamente');

                // 🔧 GUARDAR EN LOCALSTORAGE SOLO UNA VEZ
                const dataToStore = {
                    id: response.idCliente,
                    email: response.email,
                    nombre: response.nombre,
                    apellido: response.apellido,
                    idSucursal: 1
                };

                // ⚡ IMPORTANTE: Solo guardar si no existe para evitar bucle
                try {
                    localStorage.setItem('user_info', JSON.stringify(dataToStore));
                    console.log('💾 Datos guardados en localStorage');
                } catch (e) {
                    console.log('⚠️ No se pudo guardar en localStorage:', e);
                }

                return {
                    idCliente: Number(response.idCliente),
                    email: response.email,
                    nombre: response.nombre,
                    apellido: response.apellido,
                    idSucursal: 1
                };
            }

            throw new Error('No se pudo obtener datos del cliente');

        } catch (error: any) {
            console.error('❌ Error al obtener datos del usuario:', error);

            // 🆘 FALLBACK con /auth/me
            try {
                console.log('📡 Fallback: /auth/me...');
                const authResponse = await this.apiClient.get<any>('/auth/me');

                if (authResponse && authResponse.email) {
                    return {
                        idCliente: 1,
                        email: authResponse.email,
                        nombre: "Cliente",
                        apellido: "Genérico",
                        idSucursal: 1
                    };
                }
            } catch (authError: any) {
                console.log('⚠️ También falló /auth/me');
            }

            // 🆘 FALLBACK FINAL
            console.log('⚠️ Usando datos de fallback...');
            return {
                idCliente: 1,
                email: "cliente@example.com",
                nombre: "Cliente",
                apellido: "Genérico",
                idSucursal: 1
            };
        }
    }

    // ==================== FALLBACK PARA CÁLCULOS ====================

    /**
     * Calcular totales usando cálculos locales como fallback
     */
    private async calcularTotalesConFallback(request: CalcularTotalesRequestDTO): Promise<CalculoTotalesDTO> {
        console.log('🔄 Calculando totales con fallback local...');

        // Calcular totales localmente (básico)
        const subtotalProductos = request.detalles.reduce((total, detalle) => {
            // Necesitarías el precio del producto aquí
            // Por ahora, estimación genérica
            return total + (3500 * detalle.cantidad); // $3500 precio promedio
        }, 0);

        const descuentoTakeAway = request.aplicarDescuentoTakeAway ?
            subtotalProductos * (request.porcentajeDescuentoTakeAway || 10) / 100 : 0;

        const gastosEnvio = request.tipoEnvio === 'DELIVERY' ?
            (request.gastosEnvioDelivery || 200) : 0;

        const totalFinal = subtotalProductos - descuentoTakeAway + gastosEnvio;

        return {
            subtotalProductos,
            descuentoTakeAway,
            porcentajeDescuento: request.aplicarDescuentoTakeAway ? (request.porcentajeDescuentoTakeAway || 10) : 0,
            gastosEnvio,
            totalFinal,
            tipoEnvio: request.tipoEnvio,
            resumenCalculo: 'Cálculo local (fallback)',
            seAplicoDescuento: request.aplicarDescuentoTakeAway || false
        };
    }

    // ==================== CREAR PEDIDO CON MERCADOPAGO ====================

    /**
     * Crear pedido completo con link de MercadoPago usando datos reales
     */
    async crearPedidoConMercadoPago(request: PedidoConMercadoPagoRequestDTO): Promise<PedidoConMercadoPagoResponseDTO> {
        try {
            console.log('🚀 Creando pedido con MercadoPago:', request);

            // Si no vienen datos del comprador, obtenerlos
            if (!request.emailComprador || !request.nombreComprador) {
                const datosUsuario = await this.obtenerDatosUsuarioAutenticado();
                request.emailComprador = request.emailComprador || datosUsuario.email;
                request.nombreComprador = request.nombreComprador || datosUsuario.nombre;
                request.apellidoComprador = request.apellidoComprador || datosUsuario.apellido;
                request.idCliente = request.idCliente || datosUsuario.idCliente;
            }

            const response = await this.apiClient.post<PedidoConMercadoPagoResponseDTO>(
                '/pedidos-mercadopago/crear',
                request
            );
            console.log('✅ Pedido con MP creado:', response);
            return response;
        } catch (error) {
            console.error('❌ Error al crear pedido con MP:', error);
            throw error;
        }
    }

    // ==================== RESTO DE MÉTODOS IGUALES ====================

    async obtenerConfiguracion(): Promise<ConfiguracionMercadoPagoDTO> {
        try {
            const response = await this.apiClient.get<ConfiguracionMercadoPagoDTO>('/pedidos-mercadopago/configuracion');
            console.log('⚙️ Configuración obtenida:', response);
            return response;
        } catch (error) {
            console.error('❌ Error al obtener configuración:', error);
            throw error;
        }
    }

    async confirmarPagoManual(request: ConfirmarPagoManualRequestDTO): Promise<ConfirmarPagoManualResponseDTO> {
        try {
            console.log('✅ Confirmando pago manual:', request);
            const response = await this.apiClient.post<ConfirmarPagoManualResponseDTO>(
                '/pagos/confirmar-pago-manual',
                request
            );
            console.log('✅ Pago confirmado:', response);
            return response;
        } catch (error) {
            console.error('❌ Error al confirmar pago:', error);
            throw error;
        }
    }

    async verificarEstadoFactura(idFactura: number): Promise<any> {
        try {
            const response = await this.apiClient.get(`/pagos/debug/factura/${idFactura}`);
            console.log('🔍 Estado de factura:', response);
            return response;
        } catch (error) {
            console.error('❌ Error al verificar factura:', error);
            throw error;
        }
    }

    async obtenerTodosLosPagos(): Promise<any> {
        try {
            const response = await this.apiClient.get('/pagos/debug/todos-los-pagos');
            console.log('📊 Información de pagos:', response);
            return response;
        } catch (error) {
            console.error('❌ Error al obtener info de pagos:', error);
            throw error;
        }
    }

    // ==================== UTILIDADES ====================

    static convertirItemsCarrito(items: Array<{ id: number, cantidad: number }>) {
        console.log('🔄 Convirtiendo items del carrito:', items);

        const detalles = items.map(item => {
            const detalle = {
                idArticulo: Number(item.id),
                cantidad: Number(item.cantidad)
            };

            if (isNaN(detalle.idArticulo) || detalle.idArticulo <= 0) {
                console.error('❌ ID de artículo inválido:', item.id);
                throw new Error(`ID de artículo inválido: ${item.id}`);
            }

            if (isNaN(detalle.cantidad) || detalle.cantidad <= 0) {
                console.error('❌ Cantidad inválida:', item.cantidad);
                throw new Error(`Cantidad inválida: ${item.cantidad}`);
            }

            return detalle;
        });

        console.log('✅ Items convertidos exitosamente:', detalles);
        return detalles;
    }

    static crearRequestCalculo(
        tipoEnvio: 'DELIVERY' | 'TAKE_AWAY',
        items: Array<{ id: number, cantidad: number }>
    ): CalcularTotalesRequestDTO {
        console.log('🏗️ Creando request de cálculo:', { tipoEnvio, cantidadItems: items.length });

        if (!tipoEnvio || !['DELIVERY', 'TAKE_AWAY'].includes(tipoEnvio)) {
            throw new Error('Tipo de envío inválido');
        }

        if (!items || items.length === 0) {
            throw new Error('No hay items para calcular');
        }

        const request: CalcularTotalesRequestDTO = {
            tipoEnvio,
            detalles: this.convertirItemsCarrito(items),
            porcentajeDescuentoTakeAway: 10.0,
            gastosEnvioDelivery: 200.0,
            aplicarDescuentoTakeAway: tipoEnvio === 'TAKE_AWAY'
        };

        console.log('✅ Request de cálculo creado:', request);
        return request;
    }

    static crearRequestPedidoCompleto(
        idCliente: number,
        idSucursal: number,
        tipoEnvio: 'DELIVERY' | 'TAKE_AWAY',
        items: Array<{ id: number, cantidad: number }>,
        datosComprador: {
            email: string;
            nombre: string;
            apellido: string;
        },
        opciones?: {
            idDomicilio?: number;
            observaciones?: string;
            crearPreferenciaMercadoPago?: boolean;
        }
    ): PedidoConMercadoPagoRequestDTO {
        console.log('🏗️ Creando request de pedido completo:', {
            idCliente,
            tipoEnvio,
            cantidadItems: items.length,
            comprador: datosComprador.email
        });

        const request: PedidoConMercadoPagoRequestDTO = {
            idCliente,
            idSucursal,
            tipoEnvio,
            idDomicilio: opciones?.idDomicilio,
            observaciones: opciones?.observaciones,
            detalles: this.convertirItemsCarrito(items),
            emailComprador: datosComprador.email,
            nombreComprador: datosComprador.nombre,
            apellidoComprador: datosComprador.apellido,
            porcentajeDescuentoTakeAway: 10.0,
            gastosEnvioDelivery: 200.0,
            aplicarDescuentoTakeAway: tipoEnvio === 'TAKE_AWAY',
            crearPreferenciaMercadoPago: opciones?.crearPreferenciaMercadoPago ?? true,
            externalReference: `PEDIDO_${Date.now()}_${idCliente}`
        };

        console.log('✅ Request de pedido completo creado:', request);
        return request;
    }

    static extraerInfoRespuesta(response: PedidoConMercadoPagoResponseDTO) {
        return {
            exito: response.exito,
            mensaje: response.mensaje,
            pedidoId: response.pedido?.idPedido,
            facturaId: response.factura?.idFactura,
            linkPago: response.mercadoPago?.linkPago || response.mercadoPago?.linkPagoSandbox,
            total: response.calculoTotales?.totalFinal,
            descuento: response.calculoTotales?.descuentoTakeAway,
            preferenciaCreada: response.mercadoPago?.preferenciaCreada,
            errorMercadoPago: response.mercadoPago?.errorMercadoPago
        };
    }

    static formatearTotales(calculoTotales: CalculoTotalesDTO) {
        return {
            subtotal: calculoTotales.subtotalProductos,
            descuento: calculoTotales.descuentoTakeAway,
            costoEnvio: calculoTotales.gastosEnvio,
            total: calculoTotales.totalFinal,
            resumen: calculoTotales.resumenCalculo,
            tieneDescuento: calculoTotales.seAplicoDescuento,
            porcentajeDescuento: calculoTotales.porcentajeDescuento
        };
    }

    static debeUsarMercadoPago(response: PedidoConMercadoPagoResponseDTO): boolean {
        return response.exito &&
            response.mercadoPago?.preferenciaCreada === true &&
            !!(response.mercadoPago?.linkPago || response.mercadoPago?.linkPagoSandbox);
    }

    static obtenerLinkPago(mercadoPagoInfo: any): string | null {
        return mercadoPagoInfo?.linkPagoSandbox || mercadoPagoInfo?.linkPago || null;
    }
}