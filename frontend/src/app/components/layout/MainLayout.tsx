import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react'; // Asegúrate de tener estos íconos

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* 1. BOTÓN HAMBURGUESA (Solo visible en Móvil) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <span className="font-bold text-indigo-600 text-lg">Nexus ERP</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 2. OVERLAY OSCURO (Fondo negro al abrir menú en móvil) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 3. SIDEBAR (Adaptable) */}
      {/* - fixed: Para que flote sobre el contenido en móvil.
         - md:static: Para que se quede quieto a la izquierda en PC.
         - translate-x: Animación para entrar/salir.
      */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}>
        {/* Pasamos una función para cerrar el menú al hacer click en un link */}
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </aside>

      {/* 4. CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full p-4 md:p-8 mt-14 md:mt-0 overflow-x-hidden">
        <Outlet />
      </main>

    </div>
  );
};