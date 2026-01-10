import { useState } from 'react';
import { ShoppingCart, History } from 'lucide-react';
import { NewSaleTab } from './components/NewSaleTab';
import { OrderHistoryTab } from './components/OrderHistoryTab';
import clsx from 'clsx';

export const SalesPage = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  return (
    // CAMBIO 1: p-3 en móvil, p-6 en PC. 
    // h-[calc(100vh-theme(spacing.20))] ayuda a que el scroll sea interno y no de toda la página
    <div className="p-3 md:p-6 space-y-3 md:space-y-4 flex flex-col h-[calc(100vh-3.5rem)] md:h-screen"> 
      
      {/* Header Compacto y Responsivo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm gap-3 sm:gap-0 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Ventas y Pedidos</h1>
        </div>
        
        {/* Botones expandidos en móvil */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pos')}
            className={clsx(
              "flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === 'pos' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <ShoppingCart size={16} /> <span>Nueva Venta</span>
          </button>
          <button
          id="tour-sales-tab-history"
            onClick={() => setActiveTab('history')}
            className={clsx(
              "flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === 'history' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <History size={16} /> <span>Historial</span>
          </button>
        </div>
      </div>

      {/* Contenido: flex-1 y overflow-hidden para forzar el scroll dentro del componente hijo */}
      <div className="flex-1 overflow-hidden animate-in fade-in duration-300 relative">
        {activeTab === 'pos' ? <NewSaleTab /> : <OrderHistoryTab />}
      </div>
    </div>
  );
};