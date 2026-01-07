import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Wallet, LogOut } from 'lucide-react';
import clsx from 'clsx'; // Utilidad para clases condicionales

const menuItems = [
  { path: '/dashboard', label: 'Finanzas', icon: LayoutDashboard },
  { path: '/sales', label: 'Ventas y Pedidos', icon: ShoppingCart },
  { path: '/inventory', label: 'Inventario', icon: Package }, // Productos y Categorías
  { path: '/users', label: 'Usuarios', icon: Users },
  { path: '/expenses', label: 'Gastos', icon: Wallet },
];

export const Sidebar = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-500">ERP System</h1>
        <p className="text-xs text-gray-400 mt-1">Enterprise Edition</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 w-full rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};