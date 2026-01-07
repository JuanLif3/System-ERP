import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './modules/auth/LoginPage';
import { DashboardPage } from './modules/finance/DashboardPage'; // <--- Importar
import { InventoryPage } from './modules/inventory/InventoryPage';
import { SalesPage } from './modules/sales/SalesPage';
import { ExpensesPage } from './modules/expenses/ExpensesPage';
import { UsersPage } from './modules/users/UsersPage';

// Placeholders restantes
const Sales = () => <h1 className="text-3xl font-bold text-slate-800">Ventas y Pedidos</h1>;
const Inventory = () => <h1 className="text-3xl font-bold text-slate-800">Gestión de Inventario</h1>;
const Users = () => <h1 className="text-3xl font-bold text-slate-800">Usuarios</h1>;
const Expenses = () => <h1 className="text-3xl font-bold text-slate-800">Gastos</h1>;

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Aquí usamos el componente real */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        
        <Route path="sales" element={<SalesPage />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;