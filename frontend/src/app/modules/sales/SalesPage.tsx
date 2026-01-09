import { useState } from 'react';
import { ShoppingCart, History } from 'lucide-react';
import { NewSaleTab } from './components/NewSaleTab';
import { OrderHistoryTab } from './components/OrderHistoryTab';
import clsx from 'clsx';

export const SalesPage = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  return (
    <div className="p-6 space-y-4"> {/* AGREGADO p-6 AQUÍ */}
      {/* Header Compacto */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Ventas y Pedidos</h1>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pos')}
            className={clsx(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === 'pos' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ShoppingCart size={16} /> Nueva Venta
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={clsx(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              activeTab === 'history' ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <History size={16} /> Historial
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'pos' ? <NewSaleTab /> : <OrderHistoryTab />}
      </div>
    </div>
  );
};