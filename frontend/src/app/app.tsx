import { Suspense, lazy } from 'react'; // <--- 1. Importar Suspense y lazy
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { RoleGuard } from './components/layout/RoleGuard';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './modules/auth/context/AuthContext';

// --- 2. IMPORTACIONES PEREZOSAS (Code Splitting) ---
// Esto hace que el navegador NO descargue todo el código al inicio, sino por partes.
// Nota: El .then(m => ...) asume que usas exportaciones nombradas (export const Name = ...).
// Si usas export default, solo basta con lazy(() => import('...'))

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

// --- COMPONENTE DE CARGA (SPINNER) ---
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-indigo-600 animate-pulse">Cargando módulo...</p>
    </div>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        {/* 3. SUSPENSE ENVUELVE LAS RUTAS */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            
            <Route path="/login" element={<LoginPage />} />

            {/* --- LAYOUT PRINCIPAL --- */}
            <Route path="/" element={<MainLayout />}>
              
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* GRUPO 1: ADMIN y MANAGER (Dashboard, Gastos, Reportes) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER']} />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="reports" element={<ReportsPage />} /> {/* <--- Movido aquí por seguridad */}
              </Route>

              {/* GRUPO 2: ADMIN y VENDEDOR (Ventas) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN', 'SELLER']} />}>
                <Route path="sales" element={<SalesPage />} />
              </Route>
              
              {/* GRUPO 3: TODOS LOS DE LA PYME (Inventario) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'SELLER']} />}>
                 <Route path="inventory" element={<InventoryPage />} />
              </Route>

              {/* GRUPO 4: SOLO ADMIN (Usuarios) */}
              <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                <Route path="users" element={<UsersPage />} />
              </Route>

              {/* GRUPO 5: SUPER ADMIN (SaaS) */}
              <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="saas" element={<SaasDashboard />} />
                <Route path="admin/companies" element={<CompaniesPage />} />
              </Route>

            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;