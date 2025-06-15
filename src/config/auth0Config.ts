// src/config/auth0Config.ts
export const auth0Config = {
  domain: 'dev-o8lmxt7st7bl46cy.us.auth0.com',
  clientId: 'G1oLzrCWSXb9eVpcmPbEBXe0qNyvwxhH',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://APIElBuenSabor',
    scope: 'openid profile email' // 🆕 AGREGADO: scopes para obtener datos del usuario
  },
  // Configuraciones adicionales
  useRefreshTokens: true,
  cacheLocation: 'localstorage' as const,
};