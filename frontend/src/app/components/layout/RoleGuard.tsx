import { Navigate, Outlet } from 'react-router-dom';

interface Props {
  allowedRoles: string[];
}

export const RoleGuard = ({ allowedRoles }: Props) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.roles || '';

  if (!allowedRoles.includes(userRole)) {
    // Si no tiene permiso, lo mandamos a una página segura o al login
    // Por simplicidad, si es vendedor y quiere ir al dashboard, lo mandamos a ventas
    return <Navigate to="/sales" replace />;
  }

  return <Outlet />;
};