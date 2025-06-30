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
import Promociones from "./pages/Promociones"; // ← Nueva importación
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
import { MiPerfil } from "./pages/MiPerfil";
import { GestionPedidos } from "./pages/GestionPedidos";
import Cocina from "./pages/Cocina";
import {
  LayoutGrid, // Rubros
  Box,        // Ingredientes
  ShoppingBag, // Productos
  ClipboardList, // Gestión Pedidos
  Flame,      // Cocina
  Users       // Usuarios
} from "lucide-react";


// Componente de Loading
const LoadingScreen: React.FC<{ message?: string }> = ({
  message = "Cargando...",
}) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto"></div>
      <p className="mt-4 text-[#99AAB3]">{message}</p>
    </div>
  </div>
);


// Componente para manejar el callback de Auth0
const CallbackPage: React.FC = () => {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return <LoadingScreen message="Procesando login..." />;
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

  return <Navigate to="/" replace />;
};

// Componente protegido para múltiples roles
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
  fallbackTo?: string;
}> = ({ children, allowedRoles = ["ADMIN"], fallbackTo = "/" }) => {
  const { isAuthenticated, isLoading, user, backendUser, auth0User } =
    useAuth();

  if (isLoading) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Lógica de roles optimizada
  let userRole: string | undefined;

  if (backendUser?.usuario?.rol) {
    userRole = backendUser.usuario.rol;
  } else if (backendUser?.rol) {
    userRole = backendUser.rol;
  } else if ((user as any)?.usuario?.rol) {
    userRole = (user as any).usuario.rol;
  } else if ((user as any)?.rol) {
    userRole = (user as any).rol;
  } else if (auth0User && (auth0User as any)["https://APIElBuenSabor/roles"]) {
    const roles = (auth0User as any)["https://APIElBuenSabor/roles"];
    if (Array.isArray(roles) && roles.length > 0) {
      userRole = roles[0].toUpperCase();
    }
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole) {
      return <LoadingScreen message="Verificando rol de usuario..." />;
    }

    if (!allowedRoles.includes(userRole)) {
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
                  Rol actual: {userRole}
                  <br />
                  Roles permitidos: {allowedRoles.join(", ")}
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
  }

  return <>{children}</>;
};

// AuthRoute optimizado
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para el elemento de navegación activo
const NavLink: React.FC<{ to: string; children: React.ReactNode; className?: string }> =  ({
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
      <nav className="w-64 bg-white shadow-lg border-r border-[#99AAB3] border-opacity-30 flex-shrink-0 overflow-y-auto">
        <div className="p-6 space-y-3">
          <div className="text-xs font-semibold text-[#99AAB3] uppercase tracking-wide mb-4 px-2">
            Menú Principal
          </div>
          
          <NavLink to="/categorias" className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5" />
            Rubros
          </NavLink>
          <NavLink to="/insumos" className="flex items-center gap-3">
            <Box className="w-5 h-5" />
            Ingredientes
          </NavLink>
          <NavLink to="/productos" className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            Productos
          </NavLink>
          <NavLink to="/gestion-pedidos" className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5" />
            Gestión Pedidos
          </NavLink>
          <NavLink to="/cocina" className="flex items-center gap-3">
            <Flame className="w-5 h-5" />
            Cocina
          </NavLink>
          <NavLink to="/usuarios" className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            Usuarios
          </NavLink>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto bg-[#F7F7F5] bg-opacity-50">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
    <Footer />
  </div>
);

// Layout específico para cocina (sin sidebar, fullscreen)
const CocinaLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    {children}
  </div>
);

// Layout para páginas públicas (sin sidebar, pero con Header y Footer)
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
  const { isLoading: auth0Loading } = useAuth0();
  const { isLoading: authLoading } = useAuth();

  // Loading global: Esperar hasta que todo esté listo
  if (auth0Loading || authLoading) {
    return <LoadingScreen message="Inicializando aplicación..." />;
  }

  return (
    <CarritoProvider>
      <Router>
        <Routes>
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

          {/* Rutas autenticadas */}
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
          <Route
            path="/mi-perfil"
            element={
              <AuthRoute>
                <PublicLayout>
                  <MiPerfil />
                </PublicLayout>
              </AuthRoute>
            }
          />

          {/* ← NUEVA RUTA PARA PROMOCIONES (SOLO ADMIN) */}
          <Route
            path="/promociones"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout>
                  <Promociones />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Gestión de pedidos (ADMIN Y CAJERO) */}
          <Route
            path="/gestion-pedidos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "CAJERO"]}>
                <AdminLayout>
                  <GestionPedidos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Cocina (COCINERO Y ADMIN) */}
          <Route
            path="/cocina"
            element={
              <ProtectedRoute
                allowedRoles={["COCINERO", "ADMIN"]}
                fallbackTo="/"
              >
                <CocinaLayout>
                  <Cocina />
                </CocinaLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COCINERO"]}>
                <AdminLayout>
                  <Categorias />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insumos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COCINERO"]}>
                <AdminLayout>
                  <Insumos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COCINERO"]}>
                <AdminLayout>
                  <Productos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COCINERO"]}>
                <AdminLayout>
                  <StockControl />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout>
                  <Usuarios />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Delivery (requieren rol DELIVERY) */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute
                allowedRoles={["DELIVERY"]}
                fallbackTo="/catalogo"
              >
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