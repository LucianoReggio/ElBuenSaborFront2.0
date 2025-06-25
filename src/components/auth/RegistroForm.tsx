import React, { useState } from "react";
import type { ClienteRegisterDTO } from "../../types/clientes/Index";

interface RegistroFormProps {
  onSubmit: (
    data: Omit<ClienteRegisterDTO, "email" | "password" | "confirmPassword">
  ) => Promise<void>;
  onSwitchToLogin: () => void;
  onAuth0Register: () => void;
  onGoogleRegister: () => void;
  loading?: boolean;
  error?: string;
  userEmail?: string; // Email del usuario autenticado en Auth0
  showAdditionalData?: boolean; // Mostrar formulario de datos adicionales
}

export const RegistroForm: React.FC<RegistroFormProps> = ({
  onSubmit,
  onSwitchToLogin,
  onAuth0Register,
  onGoogleRegister,
  loading = false,
  error,
  userEmail,
  showAdditionalData = false,
}) => {
  const [formData, setFormData] = useState<
    Omit<ClienteRegisterDTO, "email" | "password" | "confirmPassword">
  >({
    nombre: "",
    apellido: "",
    telefono: "",
    fechaNacimiento: "",
    domicilio: {
      calle: "",
      numero: 0,
      cp: 0,
      localidad: "",
    },
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio";
    if (!formData.apellido.trim())
      errors.apellido = "El apellido es obligatorio";
    if (!formData.domicilio.calle.trim())
      errors.direccion = "La dirección es obligatoria";
    if (!formData.domicilio.localidad.trim())
      errors.departamento = "El departamento es obligatorio";

    // Validar número de domicilio
    if (!formData.domicilio.numero || formData.domicilio.numero <= 0) {
      errors.numero = "El número es obligatorio y debe ser mayor a 0";
    }

    // Validar fecha de nacimiento
    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const seleccionada = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      if (seleccionada >= hoy) {
        errors.fechaNacimiento = "La fecha debe estar en el pasado";
      }
    }

    // Validar código postal
    if (
      !formData.domicilio.cp ||
      formData.domicilio.cp < 1000 ||
      formData.domicilio.cp > 9999
    ) {
      errors.cp = "Código postal inválido (debe estar entre 1000 y 9999)";
    }

    if (!formData.telefono.trim()) {
      errors.telefono = "El teléfono es obligatorio";
    } else if (!/^[0-9+\-\s()]{10,20}$/.test(formData.telefono)) {
      errors.telefono = "Teléfono inválido (10-20 caracteres)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      console.log("Datos a enviar:", formData);
      await onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");

      // Convertir a número si es numero o cp
      let processedValue = value;
      if (child === "numero" || child === "cp") {
        processedValue = value === "" ? 0 : parseInt(value) || 0;
      }

      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: processedValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Si no debe mostrar datos adicionales, mostrar opciones de registro Auth0
  if (!showAdditionalData) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
          Únete a nuestra familia
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Mensaje explicativo */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">
              Elige cómo quieres crear tu cuenta
            </p>
          </div>

          {/* Botón Registro con Email (Auth0) */}
          <button
            onClick={onAuth0Register}
            disabled={loading}
            className="w-full bg-[#CD6C50] hover:bg-[#b85a42] disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#CD6C50] focus:ring-offset-2 flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>{loading ? "Procesando..." : "Registrarse con Email"}</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          {/* Botón Google */}
          <button
            onClick={onGoogleRegister}
            disabled={loading}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Registrarse con Google</span>
          </button>

          {/* Link a Login */}
          <div className="text-center mt-6">
            <span className="text-gray-600 text-sm">¿Ya tienes cuenta? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#CD6C50] hover:text-[#b85a42] font-medium transition-colors duration-200 text-sm"
            >
              Iniciar sesión
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              🔒 Después del registro, podrás completar tu perfil con datos
              adicionales
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de datos adicionales (cuando ya está autenticado con Auth0)
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        Completa tu perfil
      </h2>

      {userEmail && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            ✅ Autenticado como: <strong>{userEmail}</strong>
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <input
            type="text"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.nombre ? "border-red-500" : "border-gray-300"
              }`}
          />
          {validationErrors.nombre && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.nombre}
            </p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <input
            type="text"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={(e) => handleInputChange("apellido", e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.apellido ? "border-red-500" : "border-gray-300"
              }`}
          />
          {validationErrors.apellido && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.apellido}
            </p>
          )}
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={formData.fechaNacimiento}
            max={new Date().toISOString().split("T")[0]}
            min="1900-01-01"
            onChange={(e) =>
              handleInputChange("fechaNacimiento", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.fechaNacimiento
                ? "border-red-500"
                : "border-gray-300"
              }`}
          />
          {validationErrors.fechaNacimiento && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.fechaNacimiento}
            </p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <input
            type="text"
            placeholder="Dirección (Calle)"
            value={formData.domicilio.calle}
            onChange={(e) =>
              handleInputChange("domicilio.calle", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.direccion ? "border-red-500" : "border-gray-300"
              }`}
          />
          {validationErrors.direccion && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.direccion}
            </p>
          )}
        </div>

        {/* Número y Código Postal en una fila */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              placeholder="Número"
              value={formData.domicilio.numero || ""}
              onChange={(e) =>
                handleInputChange("domicilio.numero", e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.numero ? "border-red-500" : "border-gray-300"
                }`}
            />
            {validationErrors.numero && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.numero}
              </p>
            )}
          </div>

          <div>
            <input
              type="number"
              placeholder="C.P."
              value={formData.domicilio.cp || ""}
              onChange={(e) =>
                handleInputChange("domicilio.cp", e.target.value)
              }
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.cp ? "border-red-500" : "border-gray-300"
                }`}
            />
            {validationErrors.cp && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.cp}</p>
            )}
          </div>
        </div>

        {/* Localidad */}
        <div>
          <input
            type="text"
            placeholder="Localidad"
            value={formData.domicilio.localidad}
            onChange={(e) =>
              handleInputChange("domicilio.localidad", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.departamento
                ? "border-red-500"
                : "border-gray-300"
              }`}
          />
          {validationErrors.departamento && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.departamento}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <input
            type="tel"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) => handleInputChange("telefono", e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 placeholder-gray-400 ${validationErrors.telefono ? "border-red-500" : "border-gray-300"
              }`}
          />
          {validationErrors.telefono && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.telefono}
            </p>
          )}
        </div>

        {/* Botón Completar Registro */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#CD6C50] hover:bg-[#b85a42] disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#CD6C50] focus:ring-offset-2"
        >
          {loading ? "Completando registro..." : "Completar registro"}
        </button>
      </div>
    </div>
  );
};