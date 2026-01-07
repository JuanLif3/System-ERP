import { useState } from 'react';
import { Package, Tags } from 'lucide-react';
import { ProductsTab } from './components/ProductsTab';
import { CategoriesTab } from './components/CategoriesTab';
import clsx from 'clsx';

export const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-gray-500 text-sm">Gestiona tus productos y categorías</p>
        </div>
        
        {/* Selector de Pestañas */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start">
          <button
            onClick={() => setActiveTab('products')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'products' ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Package size={16} /> Productos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === 'categories' ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Tags size={16} /> Categorías
          </button>
        </div>
      </div>

      {/* Contenido Dinámico */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'products' ? <ProductsTab /> : <CategoriesTab />}
      </div>
    </div>
  );
};