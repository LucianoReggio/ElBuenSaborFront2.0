import React from "react";

interface CarritoItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface CarritoModalProps {
  abierto: boolean;
  onCerrar: () => void;
  items: CarritoItem[];
}

const CarritoModal: React.FC<CarritoModalProps> = ({ abierto, onCerrar, items }) => {
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0  bg-opacity-30 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#CD6C50]">Carrito de Compras</h2>
          <button
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
            onClick={onCerrar}
            title="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">¡El carrito está vacío!</p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{item.nombre}</span>
                    <span className="text-sm text-gray-400 ml-2">x{item.cantidad}</span>
                  </div>
                  <div className="font-semibold text-[#CD6C50]">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className={`w-full py-3 rounded-lg font-semibold ${
              items.length > 0
                ? "bg-[#CD6C50] text-white hover:bg-[#b85a42]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            disabled={items.length === 0}
          >
            Confirmar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarritoModal;
