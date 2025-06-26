import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Categorias from "./pages/Categorias";
import Insumos from "./pages/Insumos";
import Productos from "./pages/Productos";
import StockControl from "./pages/StockControl";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import RegistroPage from "./pages/Registro";
import LoginPage from "./pages/Login";
import Home from "./pages/Home";
import ProductoDetalle from "./pages/ProductoDetalle";
import Catalogo from "./pages/Catalogo";
import Usuarios from "./pages/Usuarios";
import { CarritoProvider } from "./context/CarritoContext";
import MisPedidos from "./pages/MisPedidos";
import DeliveryDashboard from "./pages/DeliveryDashboard";


// Componente para manejar el callback de Auth0
const CallbackPage: React.FC = () => {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
          <p className="mt-4 text-[#99AAB3]">Procesando login...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-red-800 font-semibold mb-2">
              Error de autenticación
            </h2>
            <p className="text-red-600 text-sm">{error.message}</p>
            <Link
              to="/"
              className="inline-block mt-4 px-4 py-2 bg-[#CD6C50] text-white rounded hover:bg-[#E29C44] transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay loading ni error, redirigir al home
  return <Navigate to="/" replace />;
};

// Componente para proteger rutas administrativas
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
  fallbackTo?: string;
}> = ({ children, requiredRole = "ADMIN", fallbackTo = "/" }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
          <p className="mt-4 text-[#99AAB3]">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Obtener rol del usuario (compatibilidad con diferentes estructuras)
  const userRole = (user as any)?.usuario?.rol || (user as any)?.rol;

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-yellow-800 font-semibold mb-2">
              Acceso restringido
            </h2>
            <p className="text-yellow-600 text-sm mb-4">
              No tienes permisos para acceder a esta sección.
              <br />
              <span className="text-xs">
                Rol actual: {userRole || "No definido"}
              </span>
            </p>
            <Link
              to={fallbackTo}
              className="inline-block px-4 py-2 bg-[#CD6C50] text-white rounded hover:bg-[#E29C44] transition-colors"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Componente para rutas que requieren autenticación básica
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
          <p className="mt-4 text-[#99AAB3]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para el elemento de navegación activo
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({
  to,
  children,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-[#CD6C50] text-white shadow-md border-r-4 border-[#E29C44]"
          : "text-[#99AAB3] hover:text-[#F7F7F5] hover:bg-[#99AAB3] hover:bg-opacity-10"
      }`}
    >
      {children}
    </Link>
  );
};

// Layout para páginas administrativas
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg border-r border-[#99AAB3] border-opacity-30 flex-shrink-0 overflow-y-auto">
        <div className="p-6 space-y-3">
          <div className="text-xs font-semibold text-[#99AAB3] uppercase tracking-wide mb-4 px-2">
            Menú Principal
          </div>
          <NavLink to="/dashboard">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"/>
            </svg>
            Dashboard
          </NavLink>
          <NavLink to="/categorias">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"/>
            </svg>
            Rubros
          </NavLink>
          <NavLink to="/insumos">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Ingredientes
          </NavLink>
          <NavLink to="/productos">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
            </svg>
            Productos
          </NavLink>
          <NavLink to="/stock">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Control Stock
          </NavLink>
          <NavLink to="/usuarios">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Usuarios
          </NavLink>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F7F7F5] bg-opacity-50">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
    <Footer />
  </div>
);

// Componente de Layout para páginas públicas (sin sidebar, pero con Header y Footer)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

// Componente principal
function App() {
  const { isLoading } = useAuth0();

  // Mostrar loading mientras Auth0 se inicializa
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
          <p className="mt-4 text-[#99AAB3]">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <CarritoProvider>
      <Router>
        <Routes>
          {/* Callback de Auth0 */}
          <Route path="/callback" element={<CallbackPage />} />

          {/* Rutas públicas */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/home"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/catalogo"
            element={
              <PublicLayout>
                <Catalogo />
              </PublicLayout>
            }
          />
          <Route
            path="/productos/:id"
            element={
              <PublicLayout>
                <ProductoDetalle />
              </PublicLayout>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicLayout>
                <RegistroPage />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            }
          />

          {/* Rutas que requieren autenticación */}
          <Route
            path="/mis-pedidos"
            element={
              <AuthRoute>
                <PublicLayout>
                  <MisPedidos />
                </PublicLayout>
              </AuthRoute>
            }
          />

          {/* Rutas administrativas (requieren rol ADMIN) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Categorias />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insumos"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Insumos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Productos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <Usuarios />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout>
                  <StockControl />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Delivery (requieren rol DELIVERY) */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute requiredRole="DELIVERY" fallbackTo="/catalogo">
                <PublicLayout>
                  <DeliveryDashboard />
                </PublicLayout>
              </ProtectedRoute>
            }
          />

          {/* Ruta 404 */}
          <Route
            path="*"
            element={
              <PublicLayout>
                <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-[#99AAB3] border-opacity-20 m-8">
                  <h2 className="text-2xl font-bold text-[#CD6C50] mb-4">
                    Página no encontrada
                  </h2>
                  <p className="text-[#99AAB3] mb-6">
                    La página que buscas no existe.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 bg-[#CD6C50] text-white rounded-md hover:bg-[#E29C44] transition-all duration-200 shadow-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Volver al Home
                  </Link>
                </div>
              </PublicLayout>
            }
          />
        </Routes>
      </Router>
    </CarritoProvider>
  );
}

export default App;
