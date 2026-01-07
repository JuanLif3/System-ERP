export interface JwtPayload {
  id: string;        // ID del Usuario
  email: string;     // Email
  companyId: string; // ID de la Pyme (CRÍTICO para Multi-tenancy)
  // Podríamos agregar roles aquí si quisiéramos
}