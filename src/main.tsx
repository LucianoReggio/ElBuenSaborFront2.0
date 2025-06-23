import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "./index.css";
import App from "./App.tsx";

// Configuración de Auth0
const auth0Config = {
  domain: "dev-ik2kub20ymu4sfpr.us.auth0.com",
  clientId: "4u4F4fKQrsD9Bvvh9ODZ0tnqzR431TBV",
  authorizationParams: {
    redirect_uri: window.location.origin + "/callback",
    audience: "https://APIElBuenSabor",
    scope: "openid profile email",
  },
  // Configuración adicional para optimizar Auth0
  cacheLocation: "localstorage" as const,
  useRefreshTokens: true,
  useRefreshTokensFallback: false,

  // Callback para manejar redirección después del login
  onRedirectCallback: (appState?: any) => {
    console.log("🔄 Auth0 redirect callback:", appState);

    // Redirigir a la URL de destino o home
    const targetUrl = appState?.targetUrl || appState?.returnTo || "/";

    // Usar replace para evitar problemas de navegación
    window.history.replaceState({}, document.title, targetUrl);
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      cacheLocation={auth0Config.cacheLocation}
      useRefreshTokens={auth0Config.useRefreshTokens}
      useRefreshTokensFallback={auth0Config.useRefreshTokensFallback}
      onRedirectCallback={auth0Config.onRedirectCallback}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
