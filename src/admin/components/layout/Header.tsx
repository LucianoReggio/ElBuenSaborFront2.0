import React from 'react';
import { ChevronDown, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section - Admin Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-gray-700 font-medium">Admin</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-gray-600 text-sm">Administrador</span>
          </div>

          {/* Center Section - Logo */}
          <div className="flex-1 flex justify-center">
            <div className="rounded-full flex items-center justify-center">
              <img 
                src="/src/assets/logos/Logo-nabvar.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain" 
              />
            </div>
          </div>

          {/* Right Section - Navigation Menu */}
          <nav className="flex items-center space-x-8">
            <button 
              type="button"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Listado de Pedidos
            </button>
            <button 
              type="button"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Informes
            </button>
            <button 
              type="button"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Usuarios
            </button>
            <button 
              type="button"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Cocina
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;