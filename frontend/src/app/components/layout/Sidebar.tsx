import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, Users, 
  Receipt, BarChart3, LogOut, Building2, Store, FileText 
} from 'lucide-react';
import { useAuth } from '../../modules/auth/context/AuthContext';

// Definimos la estructura de las props
interface SidebarProps {
  onCloseMobile?: () => void;
}

const MENU_ITEMS = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    roles: ['ADMIN', 'MANAGER'] 
  },
  { 
    path: '/sales', 
    label: 'Ventas', 
    icon: ShoppingCart, 
    roles: ['ADMIN', 'SELLER'] 
  },
  { 
    path: '/inventory', 
    label: 'Inventario', 
    icon: Package, 
    roles: ['ADMIN', 'MANAGER', 'SELLER'] 
  },
  { 
    path: '/expenses', 
    label: 'Gastos', 
    icon: Receipt, 
    roles: ['ADMIN', 'MANAGER'] 
  },
  { 
    path: '/reports', 
    label: 'Reportes', 
    icon: FileText, 
    roles: ['ADMIN', 'MANAGER'] 
  },
  { 
    path: '/users', 
    label: 'Usuarios', 
    icon: Users, 
    roles: ['ADMIN'] 
  },
  { 
    path: '/saas', 
    label: 'Panel SaaS', 
    icon: BarChart3, 
    roles: ['SUPER_ADMIN'] 
  },
  { 
    path: '/admin/companies', 
    label: 'Gestión Pymes', 
    icon: Building2, 
    roles: ['SUPER_ADMIN'] 
  }
];

// Recibimos las props aquí
export const Sidebar = ({ onCloseMobile }: SidebarProps) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const filteredMenu = MENU_ITEMS.filter(item => {
    if (!user?.roles) return false;
    return item.roles.includes(user.roles);
  });

  return (
    // NOTA: Quité 'fixed left-0 top-0' y puse 'h-full'. 
    // El posicionamiento ahora lo controla el MainLayout.
    <aside className="w-72 bg-white h-full border-r border-slate-100 flex flex-col z-30 shadow-soft">
      
      {/* HEADER CON LOGO */}
      <div className="p-8 pb-4 flex-shrink-0"> {/* flex-shrink-0 evita que se aplaste */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-glow">
            <Store size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Nexus ERP
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
              {user?.company || 'SaaS Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Menu Principal</p>
        
        {filteredMenu.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          const isSales = item.path === '/sales';
          
          return (
            <Link
              key={item.path}
              to={item.path}
              id={isSales ? "tour-sales-btn" : undefined}
              // AQUÍ AGREGAMOS LA ACCIÓN DE CERRAR
              onClick={onCloseMobile} 
              className={`
                relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
              )}

              <Icon 
                size={20} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER DEL SIDEBAR */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || 'Usuario'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'cargando...'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};