// pages/MiPerfil.tsx

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useClientePerfil } from "../hooks/useClientePerfil";
import { useDomicilios } from "../hooks/useDomicilios";
import { useAuth } from "../hooks/useAuth";
import { AuthPasswordService } from "../services/AuthPasswordService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Alert } from "../components/common/Alert";
import { Button } from "../components/common/Button";
import { PerfilInfoModal, DomicilioModal } from "../components/perfil";
import type { DomicilioResponseDTO } from "../types/clientes/Index";

interface TabType {
  id: string;
  label: string;
  icon: string;
}

const TABS: TabType[] = [
  { id: "info", label: "Información Personal", icon: "👤" },
  { id: "domicilios", label: "Mis Domicilios", icon: "🏠" },
  { id: "seguridad", label: "Seguridad", icon: "🔒" },
];

export const MiPerfil: React.FC = () => {
  const { user, logout } = useAuth();
  const { user: auth0User } = useAuth0(); // ✅ Usuario de Auth0 con 'sub'

  const {
    perfil,
    isLoading: perfilLoading,
    error: perfilError,
    eliminarCuenta,
    getAuth0Config,
    refresh: refreshPerfil,
  } = useClientePerfil();

  const {
    domicilios,
    domicilioPrincipal,
    isLoading: domiciliosLoading,
    error: domiciliosError,
    marcarComoPrincipal,
    eliminarDomicilio,
    refresh: refreshDomicilios,
  } = useDomicilios();

  const [activeTab, setActiveTab] = useState<string>("info");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] =
    useState(false);

  // Estados para modales
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showDomicilioModal, setShowDomicilioModal] = useState(false);
  const [selectedDomicilio, setSelectedDomicilio] = useState<
    DomicilioResponseDTO | undefined
  >();
  const [domicilioModalMode, setDomicilioModalMode] = useState<
    "create" | "edit"
  >("create");

  // ✅ Estado simplificado para tipo de conexión
  const [userConnectionType, setUserConnectionType] =
    useState<string>("unknown");

  const isLoading = perfilLoading || domiciliosLoading;
  const error = perfilError || domiciliosError;

  // ✅ useEffect simplificado - usa auth0User.sub
  useEffect(() => {
    if (auth0User?.sub) {
      const connectionType = AuthPasswordService.detectConnectionType(
        auth0User.sub
      );
      setUserConnectionType(connectionType);
    }
  }, [auth0User?.sub]);

  /**
   * Maneja la eliminación de cuenta
   */
  const handleEliminarCuenta = async () => {
    try {
      setIsDeleting(true);
      const success = await eliminarCuenta();
      if (success) {
        logout();
      }
    } catch (error: any) {
      console.error("Error al eliminar cuenta:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * ✅ Manejo inteligente de cambio de contraseña
   */
  const handleCambiarPassword = async () => {
    if (!auth0User?.sub) return;

    const canChangePassword = AuthPasswordService.canChangePassword(
      auth0User.sub
    );

    // Usuario de Google OAuth - redirigir a Google
    if (!canChangePassword) {
      const confirmacion = window.confirm(
        "🔍 Tu cuenta está vinculada con Google.\n\n" +
          "• Para cambiar tu contraseña, debes hacerlo desde tu cuenta de Google\n" +
          "• ¿Quieres ser redirigido a Google para gestionar tu cuenta?"
      );

      if (confirmacion) {
        const url = AuthPasswordService.getPasswordManagementUrl(auth0User.sub);
        window.open(url, "_blank");
      }
      return;
    }

    // Usuario con username/password de Auth0
    try {
      setIsRequestingPasswordReset(true);

      const result = await AuthPasswordService.requestPasswordReset();

      if (result.success) {
        alert(
          `✅ ${result.message}\n\nRevisa tu email: ${
            result.email || "tu bandeja de entrada"
          }`
        );
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error: any) {
      alert("❌ Error al solicitar cambio de contraseña. Intenta nuevamente.");
    } finally {
      setIsRequestingPasswordReset(false);
    }
  };

  /**
   * Abre modal para editar información personal
   */
  const handleEditarPerfil = () => {
    setShowPerfilModal(true);
  };

  /**
   * Abre modal para crear domicilio
   */
  const handleCrearDomicilio = () => {
    setSelectedDomicilio(undefined);
    setDomicilioModalMode("create");
    setShowDomicilioModal(true);
  };

  /**
   * Abre modal para editar domicilio
   */
  const handleEditarDomicilio = (domicilio: DomicilioResponseDTO) => {
    setSelectedDomicilio(domicilio);
    setDomicilioModalMode("edit");
    setShowDomicilioModal(true);
  };

  /**
   * Marca un domicilio como principal
   */
  const handleMarcarComoPrincipal = async (id: number) => {
    try {
      await marcarComoPrincipal(id);
      alert("Domicilio marcado como principal correctamente");
    } catch (error: any) {
      alert(error.message || "Error al marcar como principal");
    }
  };

  /**
   * Elimina un domicilio
   */
  const handleEliminarDomicilio = async (id: number) => {
    try {
      const success = await eliminarDomicilio(id);
      if (success) {
        alert("Domicilio eliminado correctamente");
      }
    } catch (error: any) {
      alert(error.message || "Error al eliminar domicilio");
    }
  };

  /**
   * Callback para cuando se actualiza el perfil
   */
  const handlePerfilUpdated = () => {
    refreshPerfil();
  };

  /**
   * Callback para cuando se actualiza un domicilio
   */
  const handleDomicilioUpdated = () => {
    refreshDomicilios();
  };

  /**
   * ✅ Obtiene los datos dinámicos para la sección de seguridad
   */
  const getPasswordSectionData = () => {
    if (!auth0User?.sub) return null;

    return {
      ...AuthPasswordService.getPasswordChangeMessage(auth0User.sub),
      accountType: AuthPasswordService.getAccountTypeDescription(auth0User.sub),
      canChangePassword: AuthPasswordService.canChangePassword(auth0User.sub),
    };
  };

  /**
   * Renderiza el contenido de cada tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Información Personal
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditarPerfil}
                >
                  ✏️ Editar
                </Button>
              </div>

              {perfil && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Nombre
                    </label>
                    <p className="text-gray-900">{perfil.nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Apellido
                    </label>
                    <p className="text-gray-900">{perfil.apellido}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">{perfil.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Teléfono
                    </label>
                    <p className="text-gray-900">{perfil.telefono}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Fecha de Nacimiento
                    </label>
                    <p className="text-gray-900">
                      {new Date(
                        perfil.fechaNacimiento + "T00:00:00"
                      ).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  {perfil.imagen && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Foto de Perfil
                      </label>
                      <img
                        src={perfil.imagen.url}
                        alt="Foto de perfil"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case "domicilios":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mis Domicilios
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCrearDomicilio}
                >
                  ➕ Agregar Domicilio
                </Button>
              </div>

              {domicilios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tienes domicilios registrados</p>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={handleCrearDomicilio}
                  >
                    Agregar mi primer domicilio
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {domicilios.map((domicilio) => (
                    <div
                      key={domicilio.idDomicilio}
                      className={`p-4 border rounded-lg ${
                        domicilio.esPrincipal
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {domicilio.direccionCompleta}
                            </p>
                            {domicilio.esPrincipal && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {domicilio.calle} {domicilio.numero},{" "}
                            {domicilio.localidad} (CP: {domicilio.cp})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!domicilio.esPrincipal && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMarcarComoPrincipal(domicilio.idDomicilio)
                              }
                            >
                              Marcar como principal
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarDomicilio(domicilio)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleEliminarDomicilio(domicilio.idDomicilio)
                            }
                            disabled={domicilios.length === 1}
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "seguridad":
        // ✅ Sección de seguridad completamente limpia y dinámica
        const passwordData = getPasswordSectionData();

        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración de Seguridad
              </h3>

              <div className="space-y-4">
                {/* ✅ Sección de cambio de contraseña dinámica */}
                {passwordData && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {passwordData.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {passwordData.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCambiarPassword}
                      disabled={isRequestingPasswordReset}
                    >
                      {isRequestingPasswordReset
                        ? "📧 Enviando..."
                        : passwordData.buttonText}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Zona de Peligro - sin cambios */}
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-4">
                Zona de Peligro
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">Eliminar Cuenta</h4>
                  <p className="text-sm text-red-700">
                    Una vez eliminada, no podrás recuperar tu cuenta ni tus
                    datos
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={handleEliminarCuenta}
                  disabled={isDeleting}
                >
                  {isDeleting ? "⏳ Eliminando..." : "🗑️ Eliminar Cuenta"}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600">
                Hola {user?.nombre || perfil?.nombre}, gestiona tu información
                personal y configuración
              </p>
            </div>
            {perfil?.imagen && (
              <img
                src={perfil.imagen.url}
                alt="Foto de perfil"
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} />
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-8">{renderTabContent()}</div>

        {/* Modales */}
        <PerfilInfoModal
          isOpen={showPerfilModal}
          onClose={() => setShowPerfilModal(false)}
          onSuccess={handlePerfilUpdated}
        />

        <DomicilioModal
          isOpen={showDomicilioModal}
          onClose={() => setShowDomicilioModal(false)}
          onSuccess={handleDomicilioUpdated}
          domicilio={selectedDomicilio}
          mode={domicilioModalMode}
        />
      </div>
    </div>
  );
};
