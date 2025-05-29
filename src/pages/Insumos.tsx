import React from "react";

const Insumos: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Ingredientes
          </h1>
          <p className="text-gray-600 mt-1">
            Administre los insumos y su stock
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-6xl mb-4">🥕</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Página en Desarrollo
        </h2>
        <p className="text-gray-600 mb-4">
          La gestión de ingredientes estará disponible próximamente.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 max-w-md mx-auto">
          <p className="text-yellow-800 text-sm">
            <strong>HU#22:</strong> Alta, modificación y baja de ingredientes
            <br />
            <strong>HU#24:</strong> Registro de compra de ingrediente
            <br />
            <strong>HU#25:</strong> Control de stock de ingredientes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insumos;
