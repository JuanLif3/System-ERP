import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { RoleGuard } from './components/layout/RoleGuard';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';
import { LandingPage } from './modules/landing/LandingPage';

// Importaciones Perezosas
const LoginPage = lazy(() => import('./modules/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./modules/finance/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ExpensesPage = lazy(() => import('./modules/expenses/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const SalesPage = lazy(() => import('./modules/sales/SalesPage').then(m => ({ default: m.SalesPage })));
const InventoryPage = lazy(() => import('./modules/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const UsersPage = lazy(() => import('./modules/users/UsersPage').then(m => ({ default: m.UsersPage })));
const ReportsPage = lazy(() => import('./modules/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));

// Módulos SaaS (Super Admin)
const SaasDashboard = lazy(() => import('./modules/saas/SaasDashboard').then(m => ({ default: m.SaasDashboard })));
const CompaniesPage = lazy(() => import('./modules/saas/CompaniesPage').then(m => ({ default: m.CompaniesPage })));

// Componente de Carga
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-indigo-600 animate-pulse">Cargando módulo...</p>
    </div>
  </div>
);

// --- COMPONENTE DE REDIRECCIÓN INTELIGENTE ---
// Este componente decide a dónde ir cuando entras al sistema logueado
const HomeRedirector = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;

  // Si es Super Admin, a su panel SaaS
  if (user.roles === 'SUPER_ADMIN') {
    return <Navigate to="/saas" replace />;
  }

  // Si es Pyme normal, a su Dashboard Financiero
  return <Navigate to="/dashboard" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            
            {/* Ruta Pública (Landing Page) */}
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/login" element={<LoginPage />} />

            {/* --- SISTEMA INTERNO --- */}
            <Route element={<MainLayout />}>
              
              {/* Ruta "Raíz del Sistema" que redirige según rol */}
              <Route path="/app" element={<HomeRedirector />} />

              {/* GRUPO 1: ADMIN y MANAGER (Dashboard, Gastos, Reportes) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>

              {/* GRUPO 2: ADMIN y VENDEDOR (Ventas) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN', 'SELLER']} />}>
                <Route path="/sales" element={<SalesPage />} />
              </Route>
              
              {/* GRUPO 3: TODOS LOS DE LA PYME (Inventario) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'SELLER']} />}>
                 <Route path="/inventory" element={<InventoryPage />} />
              </Route>

              {/* GRUPO 4: SOLO ADMIN (Usuarios) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>

              {/* GRUPO 5: SUPER ADMIN (SaaS) */}
              <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/saas" element={<SaasDashboard />} />
                <Route path="/admin/companies" element={<CompaniesPage />} />
              </Route>

            </Route>
            
            {/* Fallback global */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;