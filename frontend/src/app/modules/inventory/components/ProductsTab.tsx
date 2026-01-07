import { useEffect, useState } from 'react';
import { Package, Plus, Search, AlertCircle } from 'lucide-react';
import { api } from '../../../config/api';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: { id: string; name: string } | null;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
}

export const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', sku: '', price: 0, stock: 0, categoryId: ''
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setShowModal(false);
      setFormData({ name: '', sku: '', price: 0, stock: 0, categoryId: '' }); // Reset
      fetchData(); // Recargar tabla
    } catch (error) {
      alert('Error al crear producto');
    }
  };

  // Helper para moneda
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            placeholder="Buscar por nombre o SKU..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none w-64"
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3 text-center">Stock</th>
              <th className="px-6 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-6 py-3 text-mono text-xs text-gray-500">{p.sku}</td>
                <td className="px-6 py-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {p.category?.name || 'Sin Cat.'}
                  </span>
                </td>
                <td className="px-6 py-3 font-medium">{formatCurrency(p.price)}</td>
                <td className="px-6 py-3 text-center">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stock < 10 && <AlertCircle size={12}/>}
                    {p.stock}
                  </div>
                </td>
                <td className="px-6 py-3 text-center">
                  <span className={`w-2 h-2 rounded-full inline-block ${p.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CASERO (Simple y Funcional) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Crear Nuevo Producto</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input required className="w-full border rounded-lg p-2 text-sm" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input required className="w-full border rounded-lg p-2 text-sm" 
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" required className="w-full border rounded-lg p-2 text-sm" 
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                  <input type="number" required className="w-full border rounded-lg p-2 text-sm" 
                    value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select required className="w-full border rounded-lg p-2 text-sm bg-white"
                   value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Seleccione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};