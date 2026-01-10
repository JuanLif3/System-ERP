import { useState } from 'react';
import { Package, Tags } from 'lucide-react';
import { ProductsTab } from './components/ProductsTab';
import { CategoriesTab } from './components/CategoriesTab';
import clsx from 'clsx';

export const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-500 text-sm">Gestiona tus productos y categorías</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
          <button
            id="tour-inv-tab-products" // <--- ID AQUÍ
            onClick={() => setActiveTab('products')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === 'products' ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <Package size={18} /> Productos
          </button>
          <button
            id="tour-inv-tab-categories" // <--- ID AQUÍ
            onClick={() => setActiveTab('categories')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === 'categories' ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <Tags size={18} /> Categorías
          </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'products' ? <ProductsTab /> : <CategoriesTab />}
      </div>
    </div>
  );
};