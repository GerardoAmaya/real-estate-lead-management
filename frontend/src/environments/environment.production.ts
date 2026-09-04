// En produccion la SPA y la API se sirven bajo el mismo dominio, asi que
// una ruta relativa evita hardcodear el host y elimina el CORS.
export const environment = {
  production: true,
  apiUrl: '/api',
};
