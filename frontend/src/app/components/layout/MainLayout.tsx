import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  // Verificación básica de seguridad (Frontend Only)
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Aquí se renderizarán las páginas hijas (Dashboard, Ventas, etc.) */}
        <Outlet /> 
      </main>
    </div>
  );
};