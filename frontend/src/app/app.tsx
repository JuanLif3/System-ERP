import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { RoleGuard } from './components/layout/RoleGuard'; // <--- Importar

import { LoginPage } from './modules/auth/LoginPage';
import { DashboardPage } from './modules/finance/DashboardPage';
import { SalesPage } from './modules/sales/SalesPage';
import { InventoryPage } from './modules/inventory/InventoryPage';
import { UsersPage } from './modules/users/UsersPage';
import { ExpensesPage } from './modules/expenses/ExpensesPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<MainLayout />}>
        {/* Redirección inteligente: Si entra a raíz, decide según rol (Opcional, por ahora dejamos dashboard) */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* --- ZONA PROTEGIDA: ADMIN Y MANAGER --- */}
        <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER']} />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
        </Route>

        {/* --- ZONA PROTEGIDA: ADMIN Y SELLER --- */}
        <Route element={<RoleGuard allowedRoles={['ADMIN', 'SELLER']} />}>
           <Route path="sales" element={<SalesPage />} />
        </Route>
        
        {/* --- ZONA COMÚN: TODOS --- */}
        <Route path="inventory" element={<InventoryPage />} />

        {/* --- ZONA SOLO ADMIN --- */}
        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="users" element={<UsersPage />} />
        </Route>

      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;