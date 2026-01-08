import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Wallet, LogOut, Building2 } from 'lucide-react';
import clsx from 'clsx';

// Definimos los items con sus roles permitidos
const menuItems = [
  { 
  path: '/admin/companies', 
  label: 'Pymes', 
  icon: Building2, 
  roles: ['SUPER_ADMIN'] 
},
  { 
    path: '/saas', 
    label: 'Panel SaaS', 
    icon: Building2, // Importar de lucide-react
    roles: ['SUPER_ADMIN'] 
  },
  { 
    path: '/dashboard', 
    label: 'Finanzas', 
    icon: LayoutDashboard, 
    roles: ['ADMIN', 'MANAGER'] 
  },
  { 
    path: '/sales', 
    label: 'Ventas y Pedidos', 
    icon: ShoppingCart, 
    roles: ['ADMIN', 'SELLER'] 
  },
  { 
    path: '/inventory', 
    label: 'Inventario', 
    icon: Package, 
    roles: ['ADMIN', 'SELLER', 'MANAGER'] // Todos necesitan ver productos
  },
  { 
    path: '/expenses', 
    label: 'Gastos', 
    icon: Wallet, 
    roles: ['ADMIN', 'MANAGER'] 
  },
  { 
    path: '/users', 
    label: 'Usuarios', 
    icon: Users, 
    roles: ['ADMIN'] // Solo el dueño contrata
  },
];

export const Sidebar = () => {
  const location = useLocation();

  // 1. Recuperar el usuario del almacenamiento local
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.roles || 'SELLER'; // Fallback seguro

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Borramos datos del usuario también
    window.location.href = '/login';
  };

  // 2. Filtrar el menú
  const allowedItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-500">ERP System</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <div>
             <p className="text-xs font-bold text-white">{user?.fullName}</p>
             <p className="text-[10px] text-gray-400 uppercase tracking-wider">{userRole}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {allowedItems.map((item) => {
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