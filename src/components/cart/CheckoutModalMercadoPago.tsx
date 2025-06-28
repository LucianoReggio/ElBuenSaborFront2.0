import React, { useState, useEffect } from 'react';
import {
    X, MapPin, User, MessageSquare, CreditCard, AlertCircle,
    ChevronDown, DollarSign, Smartphone, CheckCircle, ExternalLink,
    Calculator, Tag, Truck, Clock
} from 'lucide-react';
import { useCarritoMercadoPago } from '../../hooks/useCarritoMercadoPago';
import { useAuth } from '../../hooks/useAuth';
import { PedidoService } from '../../services/PedidoServices';
import { MercadoPagoService } from '../../services/MercadoPagoService';
import { ClienteService } from '../../services/ClienteService';
import type { ClienteResponseDTO } from '../../types/clientes/ClienteResponseDTO';
import type { MetodoPago } from '../../types/mercadopago/MercadoPagoTypes';

const pedidoService = new PedidoService();
const mercadoPagoService = new MercadoPagoService();

interface CheckoutModalMercadoPagoProps {
    abierto: boolean;
    onCerrar: () => void;
    onExito: (data?: any) => void;
}

const CheckoutModalMercadoPago: React.FC<CheckoutModalMercadoPagoProps> = ({
    abierto,
    onCerrar,
    onExito
}) => {
    const carrito = useCarritoMercadoPago();
    const { user, isAuthenticated, backendUser } = useAuth(); // ✅ Agregar backendUser

    // 🔍 DEBUG COMPLETO DEL USER
    useEffect(() => {
        console.log('🔍 === DEBUG USER OBJECT ===');
        console.log('🔍 user (principal):', user);
        console.log('🔍 backendUser:', backendUser);
        console.log('🔍 isAuthenticated:', isAuthenticated);
        
        if (user) {
            console.log('🔍 user.userId:', user.userId);
            console.log('🔍 user.idCliente:', user.idCliente);
            console.log('🔍 user.nombre:', user.nombre);
            console.log('🔍 user.apellido:', user.apellido);
            console.log('🔍 user.email:', user.email);
            console.log('🔍 user.domicilios:', user.domicilios);
            console.log('🔍 user.usuario:', user.usuario);
            console.log('🔍 Todas las propiedades de user:', Object.keys(user));
        }
        
        if (backendUser) {
            console.log('🔍 backendUser.userId:', backendUser.userId);
            console.log('🔍 backendUser.idCliente:', backendUser.idCliente);
            console.log('🔍 backendUser.usuario:', backendUser.usuario);
            console.log('🔍 Todas las propiedades de backendUser:', Object.keys(backendUser));
        }
    }, [user, backendUser, isAuthenticated]);

    const [loading, setLoading] = useState(false);
    const [loadingDomicilios, setLoadingDomicilios] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState<string | null>(null);

    // Estados del formulario
    const [idSucursal] = useState(1);
    const [domicilios, setDomicilios] = useState<ClienteResponseDTO['domicilios']>([]);
    const [domicilioSeleccionado, setDomicilioSeleccionado] = useState<number | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');

    // Estados para resultado del pedido
    const [pedidoCreado, setPedidoCreado] = useState<any>(null);
    const [linkPago, setLinkPago] = useState<string | null>(null);

    // ==================== CARGAR DOMICILIOS CON DEBUG Y FALLBACKS ====================

    const cargarDomicilios = async () => {
        try {
            // 🔍 DEBUG: Verificar el objeto user completo
            console.log('🔍 DEBUG USER OBJECT en cargarDomicilios:', user);
            console.log('🔍 user.userId:', user?.userId);
            console.log('🔍 user.idCliente:', user?.idCliente);
            
            let clienteId = user?.idCliente;
            
            // 🆘 FALLBACK: Si no hay idCliente, obtenerlo del backend
            if (!clienteId) {
                console.log('⚠️ No hay idCliente en user, obteniendo del backend...');
                
                try {
                    // Opción 1: Intentar con /clientes/me usando el servicio (que ya tiene Auth0 configurado)
                    console.log('📡 Intentando ClienteService.getMyProfile()...');
                    const perfilCompleto = await ClienteService.getMyProfile();
                    clienteId = perfilCompleto.idCliente;
                    console.log('✅ idCliente obtenido de /clientes/me:', clienteId);
                } catch (error1) {
                    console.log('❌ Error con ClienteService.getMyProfile():', error1);
                    
                    // Opción 2: Usar userId si existe (como fallback)
                    if (user?.userId) {
                        console.log('🔄 Intentando con userId como fallback...');
                        clienteId = user.userId;
                    } else {
                        console.log('❌ Tampoco hay userId disponible');
                    }
                }
            }
            
            console.log('🏠 Cargando domicilios para cliente:', clienteId);
            
            if (!clienteId) {
                console.error('❌ No se pudo obtener ID del cliente de ninguna forma');
                setError('No se pudo cargar la información del cliente');
                return;
            }
            
            setLoadingDomicilios(true);
            
            // 🔍 DEBUG: Verificar la llamada al servicio
            console.log('📡 Llamando ClienteService.getById con ID:', clienteId);
            const clienteData = await ClienteService.getById(clienteId);
            console.log('📡 Respuesta del servicio:', clienteData);
            
            setDomicilios(clienteData.domicilios || []);
            console.log('✅ Domicilios cargados:', clienteData.domicilios?.length || 0);
            console.log('✅ Domicilios array:', clienteData.domicilios);
            
        } catch (error: any) {
            console.error('❌ Error al cargar domicilios:', error);
            console.error('❌ Error details:', error.response?.data);
            
            // Fallback: usar domicilios que ya tienes en user si están disponibles
            if (user?.domicilios) {
                setDomicilios(user.domicilios);
                console.log('🔄 Usando domicilios del user cache:', user.domicilios.length);
            } else {
                setError('No se pudieron cargar los domicilios');
            }
        } finally {
            setLoadingDomicilios(false);
        }
    };

    // 🎯 useEffect cargarDomicilios triggered  
    useEffect(() => {
        console.log('🎯 useEffect cargarDomicilios triggered');
        console.log('🎯 abierto:', abierto);
        console.log('🎯 user?.idCliente:', user?.idCliente);
        console.log('🎯 isAuthenticated:', isAuthenticated);
        
        // ✅ CAMBIAR: No esperar user?.idCliente, solo que esté autenticado
        if (abierto && isAuthenticated) {
            cargarDomicilios();
        }
    }, [abierto, isAuthenticated]); // ✅ CAMBIAR: solo depender de isAuthenticated

    // ==================== RESTO DEL CÓDIGO IGUAL ====================
    
    useEffect(() => {
        if (!abierto) {
            setError(null);
            setExito(null);
            setPedidoCreado(null);
            setLinkPago(null);
            setMetodoPago('EFECTIVO');
        }
    }, [abierto]);

    if (!abierto) return null;

    const handleConfirmarPedido = async () => {
        try {
            setLoading(true);
            setError(null);
            setExito(null);

            // ✅ CORRECCIÓN: Validar idCliente también
            if (!isAuthenticated || (!user?.userId && !user?.idCliente)) {
                setError('Debes iniciar sesión para realizar un pedido');
                return;
            }

            if (carrito.estaVacio) {
                setError('El carrito está vacío');
                return;
            }

            // Validar domicilio para delivery
            if (carrito.datosEntrega.tipoEnvio === 'DELIVERY') {
                if (domicilios.length === 0) {
                    setError('No tienes domicilios registrados. Agrega uno en tu perfil o selecciona "Retiro en local"');
                    return;
                }
                if (!domicilioSeleccionado) {
                    setError('Debes seleccionar un domicilio para delivery');
                    return;
                }
            }

            // Decidir qué servicio usar según el método de pago
            if (metodoPago === 'EFECTIVO') {
                await crearPedidoEfectivo();
            } else {
                await crearPedidoMercadoPago();
            }

        } catch (err: any) {
            console.error('❌ Error al crear pedido:', err);
            
            // 🔍 DEBUG: Mostrar más detalles del error
            if (err.response) {
                console.error('❌ Error response:', err.response);
                console.error('❌ Error response data:', err.response.data);
                console.error('❌ Error response status:', err.response.status);
            }
            
            // Intentar extraer más información del error
            let errorMessage = err.message || 'Error al procesar el pedido. Intenta de nuevo.';
            
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.mensaje) {
                    errorMessage = err.response.data.mensaje;
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const crearPedidoEfectivo = async () => {
        // ✅ OBTENER idCliente correcto del backend
        let clienteId = user?.idCliente;
        
        if (!clienteId) {
            console.log('⚠️ Obteniendo idCliente del backend para pedido efectivo...');
            try {
                const perfilCompleto = await ClienteService.getMyProfile();
                clienteId = perfilCompleto.idCliente;
                console.log('✅ idCliente obtenido:', clienteId);
            } catch (error) {
                // Fallback a userId solo si no hay otra opción
                clienteId = user!.userId;
                console.log('⚠️ Usando userId como fallback:', clienteId);
            }
        }
        
        const pedidoRequest = {
            idCliente: clienteId,
            idSucursal: idSucursal,
            tipoEnvio: carrito.datosEntrega.tipoEnvio,
            ...(carrito.datosEntrega.tipoEnvio === 'DELIVERY' && domicilioSeleccionado ? {
                idDomicilio: domicilioSeleccionado
            } : {}),
            detalles: carrito.items.map(item => ({
                idArticulo: item.id,
                cantidad: item.cantidad
            })),
            ...(carrito.datosEntrega.observaciones?.trim() ? {
                observaciones: carrito.datosEntrega.observaciones.trim()
            } : {})
        };

        console.log('💵 Creando pedido con pago en efectivo:', pedidoRequest);
        const pedidoCreado = await pedidoService.crearPedido(pedidoRequest);

        setPedidoCreado(pedidoCreado);
        setExito('¡Pedido creado exitosamente! Puedes pagar en efectivo al momento de la entrega.');

        carrito.limpiarCarrito();
        setTimeout(() => {
            onExito({ pedido: pedidoCreado, metodoPago: 'EFECTIVO' });
            onCerrar();
        }, 2000);
    };

    const crearPedidoMercadoPago = async () => {
        console.log('💳 Creando pedido con MercadoPago...');
        
        // ✅ VALIDACIONES PREVIAS
        if (!user?.email || !user?.nombre || !user?.apellido) {
            setError('Datos de usuario incompletos. Actualiza tu perfil.');
            return;
        }
        
        // ✅ OBTENER idCliente correcto ANTES de crear el request
        let clienteId = user?.idCliente;
        
        if (!clienteId) {
            console.log('⚠️ Obteniendo idCliente del backend para MercadoPago...');
            try {
                const perfilCompleto = await ClienteService.getMyProfile();
                clienteId = perfilCompleto.idCliente;
                console.log('✅ idCliente obtenido del backend:', clienteId);
            } catch (error) {
                console.error('❌ Error obteniendo perfil, usando userId como fallback');
                clienteId = user.userId;
            }
        }
        
        if (!clienteId) {
            setError('No se pudo obtener la información del cliente');
            return;
        }
        
        // 🔍 DEBUG: Verificar datos antes de enviar
        console.log('🔍 Datos del carrito:', {
            items: carrito.items,
            tipoEnvio: carrito.datosEntrega.tipoEnvio,
            observaciones: carrito.datosEntrega.observaciones,
            domicilioSeleccionado
        });
        
        console.log('🔍 Datos del usuario:', {
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            userId: user.userId,
            clienteId: clienteId
        });
        
        // ✅ CREAR request con todos los campos validados
        const pedidoRequest: any = {
            idCliente: Number(clienteId), // ✅ Asegurar que sea número
            idSucursal: Number(idSucursal), // ✅ Asegurar que sea número
            tipoEnvio: carrito.datosEntrega.tipoEnvio,
            detalles: carrito.items.map(item => ({
                idArticulo: Number(item.id),
                cantidad: Number(item.cantidad)
            })),
            // ✅ Datos del comprador - asegurar que no sean undefined
            emailComprador: user.email, // ✅ Ya validado arriba
            nombreComprador: user.nombre, // ✅ Ya validado arriba  
            apellidoComprador: user.apellido, // ✅ Ya validado arriba
            // Configuración
            porcentajeDescuentoTakeAway: 10.0,
            gastosEnvioDelivery: 200.0,
            aplicarDescuentoTakeAway: carrito.datosEntrega.tipoEnvio === 'TAKE_AWAY',
            crearPreferenciaMercadoPago: true,
            externalReference: `PEDIDO_${Date.now()}_${clienteId}`
        };
        
        // ✅ Agregar campos opcionales solo si tienen valor
        if (domicilioSeleccionado) {
            pedidoRequest.idDomicilio = Number(domicilioSeleccionado);
        }
        
        if (carrito.datosEntrega.observaciones?.trim()) {
            pedidoRequest.observaciones = carrito.datosEntrega.observaciones.trim();
        }

        console.log('💳 Request completo enviado a MercadoPago:', JSON.stringify(pedidoRequest, null, 2));
        
        // 🔍 DEBUG: Verificar que todos los campos requeridos estén presentes
        console.log('🔍 Validación de campos:');
        console.log('  - idCliente:', pedidoRequest.idCliente, typeof pedidoRequest.idCliente);
        console.log('  - tipoEnvio:', pedidoRequest.tipoEnvio, typeof pedidoRequest.tipoEnvio);
        console.log('  - idSucursal:', pedidoRequest.idSucursal, typeof pedidoRequest.idSucursal);
        console.log('  - emailComprador:', pedidoRequest.emailComprador, typeof pedidoRequest.emailComprador);
        console.log('  - nombreComprador:', pedidoRequest.nombreComprador, typeof pedidoRequest.nombreComprador);
        console.log('  - apellidoComprador:', pedidoRequest.apellidoComprador, typeof pedidoRequest.apellidoComprador);
        console.log('  - detalles length:', pedidoRequest.detalles.length);
        console.log('  - detalles:', pedidoRequest.detalles);
        
        const response = await mercadoPagoService.crearPedidoConMercadoPago(pedidoRequest);

        if (!response.exito) {
            throw new Error(response.mensaje || 'Error al crear el pedido');
        }

        setPedidoCreado(response.pedido);

        if (MercadoPagoService.debeUsarMercadoPago(response)) {
            const link = MercadoPagoService.obtenerLinkPago(response.mercadoPago);
            setLinkPago(link);
            setExito('¡Pedido creado! Usa el botón "Pagar con MercadoPago" para completar el pago.');
        } else {
            setError(response.mercadoPago?.errorMercadoPago || 'No se pudo generar el link de pago');
        }

        carrito.limpiarCarrito();
    };

    const abrirMercadoPago = () => {
        if (linkPago) {
            window.open(linkPago, '_blank');
        }
    };

    // ==================== COMPONENTE RENDERIZADO ====================

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <CreditCard className="w-6 h-6 text-[#CD6C50]" />
                        <h2 className="text-xl font-bold text-gray-800">Confirmar Pedido</h2>
                    </div>
                    <button
                        onClick={onCerrar}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">

                    {/* Estado de Éxito */}
                    {exito && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-green-800">¡Pedido Creado!</h4>
                                    <p className="text-green-600 text-sm">{exito}</p>

                                    {/* Botón de MercadoPago si aplica */}
                                    {linkPago && (
                                        <button
                                            onClick={abrirMercadoPago}
                                            className="mt-3 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Pagar con MercadoPago
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-red-800">Error</h4>
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Información del cliente */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <User className="w-5 h-5 text-[#CD6C50]" />
                            <h3 className="font-semibold text-gray-800">Información del cliente</h3>
                        </div>
                        <p className="text-gray-700">
                            {user?.nombre} {user?.apellido}
                        </p>
                        <p className="text-gray-600 text-sm">{user?.email}</p>
                    </div>

                    {/* Tipo de entrega y domicilio */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <MapPin className="w-5 h-5 text-[#CD6C50]" />
                            <h3 className="font-semibold text-gray-800">Entrega</h3>
                        </div>
                        <p className="text-gray-700 mb-3">
                            {carrito.datosEntrega.tipoEnvio === 'DELIVERY' ? 'Delivery' : 'Retiro en local'}
                        </p>

                        {/* Selector de domicilio para DELIVERY */}
                        {carrito.datosEntrega.tipoEnvio === 'DELIVERY' && (
                            <div className="space-y-3">
                                {loadingDomicilios ? (
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ) : domicilios.length === 0 ? (
                                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <p className="text-orange-700 text-sm font-medium">
                                            ⚠️ No tienes domicilios registrados
                                        </p>
                                        <p className="text-orange-600 text-xs mt-1">
                                            Agrega un domicilio en tu perfil o selecciona "Retiro en local"
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Seleccionar dirección:
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={domicilioSeleccionado || ''}
                                                onChange={(e) => setDomicilioSeleccionado(Number(e.target.value) || null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent appearance-none bg-white"
                                            >
                                                <option value="">Selecciona una dirección</option>
                                                {domicilios.map((domicilio, index) => {
                                                    const valorOption = domicilio.idDomicilio || (index + 1);
                                                    return (
                                                        <option key={index} value={valorOption}>
                                                            {domicilio.calle} {domicilio.numero}, {domicilio.localidad} - CP {domicilio.cp}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Método de Pago */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <CreditCard className="w-5 h-5 text-[#CD6C50]" />
                            <h3 className="font-semibold text-gray-800">Método de pago</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Pago en Efectivo */}
                            <button
                                onClick={() => setMetodoPago('EFECTIVO')}
                                className={`p-3 rounded-lg border-2 transition-all ${metodoPago === 'EFECTIVO'
                                    ? 'border-[#CD6C50] bg-[#CD6C50]/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <DollarSign className={`w-6 h-6 mx-auto mb-2 ${metodoPago === 'EFECTIVO' ? 'text-[#CD6C50]' : 'text-gray-400'
                                    }`} />
                                <p className={`text-sm font-medium ${metodoPago === 'EFECTIVO' ? 'text-[#CD6C50]' : 'text-gray-600'
                                    }`}>
                                    Efectivo
                                </p>
                                <p className="text-xs text-gray-500">Al entregar</p>
                            </button>

                            {/* MercadoPago */}
                            <button
                                onClick={() => setMetodoPago('MERCADO_PAGO')}
                                className={`p-3 rounded-lg border-2 transition-all ${metodoPago === 'MERCADO_PAGO'
                                    ? 'border-[#CD6C50] bg-[#CD6C50]/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Smartphone className={`w-6 h-6 mx-auto mb-2 ${metodoPago === 'MERCADO_PAGO' ? 'text-[#CD6C50]' : 'text-gray-400'
                                    }`} />
                                <p className={`text-sm font-medium ${metodoPago === 'MERCADO_PAGO' ? 'text-[#CD6C50]' : 'text-gray-600'
                                    }`}>
                                    MercadoPago
                                </p>
                                <p className="text-xs text-gray-500">Online</p>
                            </button>
                        </div>
                    </div>

                    {/* Resumen del pedido con totales del backend */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <Calculator className="w-5 h-5 text-[#CD6C50]" />
                            <h3 className="font-semibold text-gray-800">Resumen del pedido</h3>
                            {carrito.cargandoTotales && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#CD6C50]"></div>
                            )}
                        </div>

                        <div className="space-y-2 text-sm">
                            {/* Items del carrito */}
                            {carrito.items.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <span>{item.nombre} x{item.cantidad}</span>
                                    <span>${(item.precio * item.cantidad).toFixed(0)}</span>
                                </div>
                            ))}

                            <div className="border-t pt-2 mt-2 space-y-1">
                                {/* Subtotal */}
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${carrito.subtotal.toFixed(0)}</span>
                                </div>

                                {/* Descuento */}
                                {carrito.tieneDescuento && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="flex items-center">
                                            <Tag className="w-3 h-3 mr-1" />
                                            Descuento retiro
                                        </span>
                                        <span>-${carrito.descuento.toFixed(0)}</span>
                                    </div>
                                )}

                                {/* Envío */}
                                {carrito.costoEnvio > 0 && (
                                    <div className="flex justify-between">
                                        <span className="flex items-center">
                                            <Truck className="w-3 h-3 mr-1" />
                                            Envío
                                        </span>
                                        <span>${carrito.costoEnvio.toFixed(0)}</span>
                                    </div>
                                )}

                                {/* Total final */}
                                <div className="flex justify-between font-bold text-lg text-[#CD6C50] border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span>${carrito.total.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mostrar resumen del descuento */}
                        {carrito.resumenDescuento && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                                ✨ {carrito.resumenDescuento}
                            </div>
                        )}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            Observaciones adicionales
                        </label>
                        <textarea
                            value={carrito.datosEntrega.observaciones || ''}
                            onChange={(e) => carrito.setDatosEntrega({
                                ...carrito.datosEntrega,
                                observaciones: e.target.value
                            })}
                            placeholder="Ej: Sin cebolla, extra queso, tocar timbre del 2do piso..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Tiempo estimado */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <p className="text-blue-800 text-sm">
                                <strong>Tiempo estimado:</strong> {carrito.items.length > 0 ?
                                    Math.max(...carrito.items.map(item => item.tiempoPreparacion || 0)) +
                                    (carrito.datosEntrega.tipoEnvio === 'DELIVERY' ? 15 : 0)
                                    : 0} minutos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex space-x-3">
                        <button
                            onClick={onCerrar}
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmarPedido}
                            disabled={loading || carrito.estaVacio || !!exito}
                            className="flex-1 px-4 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Procesando...' :
                                exito ? '¡Creado!' :
                                    metodoPago === 'EFECTIVO' ? 'Confirmar Pedido' : 'Crear y Pagar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModalMercadoPago;