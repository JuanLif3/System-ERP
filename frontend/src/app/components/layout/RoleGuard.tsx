import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';

interface Props {
  allowedRoles: string[];
}

export const RoleGuard = ({ allowedRoles }: Props) => {
  // Usamos el hook useAuth para tener la fuente de la verdad (Contexto)
  // No confiamos solo en localStorage crudo aquí.
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // --- 1. NIVEL DE SEGURIDAD CRÍTICO (Autenticación) ---
  // Si el usuario no existe o no está autenticado, interceptamos la ruta.
  if (!isAuthenticated || !user) {
    // Redirigimos al Login inmediatamente.
    // 'state={{ from: location }}' sirve para que, tras loguearse, 
    // el sistema pueda devolverlo a la página que intentó ver (opcional).
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- 2. NIVEL DE PERMISOS (Autorización) ---
  // El usuario existe, pero ¿tiene el rol necesario para esta ruta?
  if (!allowedRoles.includes(user.roles)) {
    console.warn(`⛔ Acceso denegado a ${location.pathname} para el rol: ${user.roles}`);
    
    // Redirección Inteligente según su rol real:
    
    // A. Si es Super Admin y se perdió, lo mandamos a su panel
    if (user.roles === 'SUPER_ADMIN') {
        return <Navigate to="/saas" replace />;
    }
    
    // B. Si es un usuario de Pyme (ADMIN, MANAGER, SELLER)
    if (['ADMIN', 'MANAGER', 'SELLER'].includes(user.roles)) {
        // Caso especial: El Vendedor NO tiene dashboard, lo mandamos a ventas
        if (user.roles === 'SELLER') return <Navigate to="/sales" replace />;
        
        // El resto (Admin/Manager) va al Dashboard por defecto
        return <Navigate to="/dashboard" replace />;
    }
    
    // C. Fallback de seguridad final (por si el rol es desconocido)
    return <Navigate to="/login" replace />;
  }

  // --- 3. ACCESO CONCEDIDO ---
  return <Outlet />;
};