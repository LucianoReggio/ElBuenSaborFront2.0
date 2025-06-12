import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
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
import CallbackPage from "./pages/Callback";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, hasRole, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole) && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-[#99AAB3] border-opacity-20">
          <h2 className="text-2xl font-bold text-[#CD6C50] mb-4">
            Acceso denegado
          </h2>
          <p className="text-[#99AAB3] mb-6">
            No tienes permisos para acceder a esta página.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-[#CD6C50] text-white rounded-md hover:bg-[#E29C44] transition-all duration-200 shadow-sm font-medium"
          >
            Ir al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Componente para redirigir usuarios autenticados
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <LoadingSpinner />
      </div>
    );
  }

  // Si ya está autenticado y trata de ir a login/registro, redirigir al dashboard
  if (
    isAuthenticated &&
    (window.location.pathname === "/login" ||
      window.location.pathname === "/registro")
  ) {
    return <Navigate to="/dashboard" replace />;
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

// Componente de Layout para páginas administrativas (con sidebar)
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
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
              <svg
                className="w-5 h-5 mr-3 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                />
              </svg>
              Dashboard
            </NavLink>
            <NavLink to="/categorias">
              <svg
                className="w-5 h-5 mr-3 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"
                />
              </svg>
              Rubros
            </NavLink>
            <NavLink to="/insumos">
              <svg
                className="w-5 h-5 mr-3 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Ingredientes
            </NavLink>
            <NavLink to="/productos">
              <svg
                className="w-5 h-5 mr-3 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              Productos
            </NavLink>
            <NavLink to="/stock">
              <svg
                className="w-5 h-5 mr-3 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Control Stock
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
};

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

// Componente principal de la App
function App() {
  return (
    <Router>
      <Routes>
        {/* Callback de Auth0 */}
        <Route path="/callback" element={<CallbackPage />} />

        {/* Rutas públicas */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <PublicLayout>
                <Home />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <PublicRoute>
              <PublicLayout>
                <Home />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/registro"
          element={
            <PublicRoute>
              <PublicLayout>
                <RegistroPage />
              </PublicLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            </PublicRoute>
          }
        />

        {/* Rutas protegidas - administrativas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
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
          path="/stock"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout>
                <StockControl />
              </AdminLayout>
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
  );
}

export default App;
