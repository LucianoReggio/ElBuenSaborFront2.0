import React from "react";

const Productos: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Productos
          </h1>
          <p className="text-gray-600 mt-1">
            Administre los productos manufacturados
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">🍕</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Página en Desarrollo
        </h2>
        <p className="text-gray-600 mb-4">
          La gestión de productos manufacturados estará disponible próximamente.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 max-w-md mx-auto">
          <p className="text-yellow-800 text-sm">
            <strong>HU#23:</strong> Alta, modificación y baja de productos
            <br />
            Incluye gestión de recetas e ingredientes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Productos;
