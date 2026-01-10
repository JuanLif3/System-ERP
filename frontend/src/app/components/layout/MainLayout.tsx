import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { DemoTour } from '../common/DemoTour'; // <--- 1. IMPORTAR TOUR

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* 2. INSERTAR EL COMPONENTE TOUR (Invisible pero funcional) */}
      <DemoTour /> 

      {/* BOTÓN HAMBURGUESA (Móvil) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <span className="font-bold text-indigo-600 text-lg">Norte DEV</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* OVERLAY OSCURO */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}>
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full p-4 md:p-8 mt-14 md:mt-0 overflow-x-hidden">
        <Outlet />
      </main>

    </div>
  );
};