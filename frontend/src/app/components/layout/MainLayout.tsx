import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { DemoTour } from '../common/DemoTour';

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // CAMBIO 1: h-screen y overflow-hidden para que la "ventana" sea fija
    <div className="h-screen w-screen bg-slate-50 flex overflow-hidden">
      
      <DemoTour /> 

      {/* HEADER MÓVIL (Solo visible en pantallas pequeñas) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm h-16">
        <span className="font-bold text-indigo-600 text-lg">Norte DEV</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* OVERLAY OSCURO (Móvil) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      {/* CAMBIO 2: En escritorio es relativo, en móvil es fijo. 
          Al ser hijo directo de un flex container con h-screen, tomará toda la altura. */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-full flex-shrink-0
      `}>
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      {/* CAMBIO 3: flex-1 y overflow-y-auto hacen que SOLO esta parte tenga scroll */}
      <main className="flex-1 w-full relative overflow-y-auto overflow-x-hidden bg-slate-50 pt-16 md:pt-0">
        <div className="p-4 md:p-8 min-h-full">
           <Outlet />
        </div>
      </main>

    </div>
  );
};