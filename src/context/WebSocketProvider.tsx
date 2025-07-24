// // context/WebSocketProvider.tsx - versión corregida
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// import { useAuth0 } from "@auth0/auth0-react";
// import { useWebSocketByRole } from "../hooks/useWebSocket";

// interface WebSocketContextType {
//   isConnected: boolean;
// }

// const WebSocketContext = createContext<WebSocketContextType>({
//   isConnected: false,
// });

// export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { isAuthenticated: auth0Authenticated, isLoading: auth0Loading } =
//     useAuth0();
//   const {
//     isAuthenticated,
//     user,
//     backendUser,
//     isLoading: authLoading,
//   } = useAuth();
//   const [isConnected, setIsConnected] = useState(false);

//   // ✅ NUEVO: Solo determinar rol si está completamente cargado
//   const getUserRole = (): string | undefined => {
//     if (authLoading || auth0Loading) return undefined;
//     if (backendUser?.usuario?.rol) return backendUser.usuario.rol;
//     if (backendUser?.rol) return backendUser.rol;
//     if ((user as any)?.usuario?.rol) return (user as any).usuario.rol;
//     if ((user as any)?.rol) return (user as any).rol;
//     return undefined;
//   };

//   const userRole = getUserRole();
//   const shouldConnect =
//     auth0Authenticated &&
//     isAuthenticated &&
//     !authLoading &&
//     !auth0Loading &&
//     !!userRole;

//   // ✅ NUEVO: Solo activar WebSocket cuando todo esté listo
//   useWebSocketByRole(shouldConnect ? userRole : "");

//   useEffect(() => {
//     setIsConnected(shouldConnect);
//     console.log("🔌 WebSocket state:", {
//       shouldConnect,
//       auth0Authenticated,
//       isAuthenticated,
//       userRole,
//       authLoading,
//       auth0Loading,
//     });
//   }, [
//     shouldConnect,
//     auth0Authenticated,
//     isAuthenticated,
//     userRole,
//     authLoading,
//     auth0Loading,
//   ]);

//   return (
//     <WebSocketContext.Provider value={{ isConnected }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocketContext = () => useContext(WebSocketContext);

// ---------------------------------------------------------- //

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";

interface WebSocketContextType {
  isConnected: boolean;
  shouldConnect: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  shouldConnect: false,
});

export const useWebSocketContext = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading, needsAdditionalData, backendSynced } =
    useAuth();

  const [shouldConnect, setShouldConnect] = useState(false);

  // ✅ CRÍTICO: Solo conectar WebSocket cuando:
  // 1. Usuario está autenticado
  // 2. No está cargando
  // 3. Backend está sincronizado
  // 4. NO necesita datos adicionales (perfil completo)
  useEffect(() => {
    const canConnect =
      isAuthenticated && !isLoading && backendSynced && !needsAdditionalData();

    // ✅ Debug temporal para ver el estado
    console.log("🔌 WebSocket connection check:", {
      isAuthenticated,
      isLoading,
      backendSynced,
      needsAdditionalData: needsAdditionalData(),
      canConnect,
      shouldConnect,
    });

    if (canConnect && !shouldConnect) {
      // Delay adicional para asegurar que el flujo de Auth0 termine
      setTimeout(() => {
        setShouldConnect(true);
      }, 1000);
    } else if (!canConnect && shouldConnect) {
      setShouldConnect(false);
    }
  }, [
    isAuthenticated,
    isLoading,
    backendSynced,
    needsAdditionalData,
    shouldConnect,
  ]);

  // ✅ Hook de WebSocket condicionado
  const { isConnected } = useWebSocket();

  // ✅ Solo conectar si se debe conectar
  const actuallyConnected = shouldConnect && isConnected;

  return (
    <WebSocketContext.Provider
      value={{
        isConnected: actuallyConnected,
        shouldConnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
