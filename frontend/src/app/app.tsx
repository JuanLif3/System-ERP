import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { RoleGuard } from './components/layout/RoleGuard'; // <--- Importar

import { LoginPage } from './modules/auth/LoginPage';
import { DashboardPage } from './modules/finance/DashboardPage';
import { SalesPage } from './modules/sales/SalesPage';
import { InventoryPage } from './modules/inventory/InventoryPage';
import { UsersPage } from './modules/users/UsersPage';
import { ExpensesPage } from './modules/expenses/ExpensesPage';
import { SaasDashboard } from './modules/saas/SaasDashboard';
import { CompaniesPage } from './modules/saas/CompaniesPage';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './modules/auth/context/AuthContext';
import { ReportsPage } from './modules/reports/ReportsPage';

export function App() {
  return (
    <AuthProvider>
    <NotificationProvider>
    <Routes>
      
      <Route path="/login" element={<LoginPage />} />

      {/* --- INICIO DEL LAYOUT PRINCIPAL (Sidebar + Header) --- */}
      <Route path="/" element={<MainLayout />}>
        
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Rutas normales (Dashboard, Ventas, etc.) */}
        <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER']} />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
        </Route>

        <Route element={<RoleGuard allowedRoles={['ADMIN', 'SELLER']} />}>
           <Route path="sales" element={<SalesPage />} />
        </Route>
        
        <Route path="inventory" element={<InventoryPage />} />

        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="users" element={<UsersPage />} />
        </Route>

        {/* --- AQUÍ DEBE ESTAR EL SUPER ADMIN (Dentro de MainLayout) --- */}
        <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN']} />}>
          <Route path="saas" element={<SaasDashboard />} />
          <Route path="admin/companies" element={<CompaniesPage />} />
        </Route>

        <Route path="/reports" element={<ReportsPage />} />

      </Route>
      {/* --- FIN DEL LAYOUT PRINCIPAL --- */}
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </NotificationProvider>
    </AuthProvider>
  );
}

export default App;