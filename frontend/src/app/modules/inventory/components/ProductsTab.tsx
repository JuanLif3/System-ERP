import { useEffect, useState, useRef } from 'react';
import { Package, Plus, Search, AlertCircle, Edit, Power, Upload, X } from 'lucide-react';
import { api } from '../../../config/api';
import { useNotification } from '../../../context/NotificationContext'; // <--- IMPORTADO

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: Category;
  isActive: boolean;
  imageUrl?: string;
  expiryDate?: string;
}

export const ProductsTab = () => {
  const notify = useNotification(); // <--- HOOK DE NOTIFICACIONES
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '', 
    sku: '', 
    price: 0, 
    stock: 0, 
    categoryId: '', 
    imageUrl: '',
    hasExpiry: false,
    expiryDate: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      notify.error('Error al cargar datos del inventario'); // Notificación de error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', sku: '', price: 0, stock: 0, categoryId: '', imageUrl: '',
      hasExpiry: false, expiryDate: ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    const hasDate = !!(product as any).expiryDate;
    
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      categoryId: product.category?.id || '',
      imageUrl: (product as any).imageUrl || '',
      hasExpiry: hasDate,
      expiryDate: hasDate ? new Date((product as any).expiryDate).toISOString().split('T')[0] : ''
    });
    
    setSelectedFile(null);
    setPreviewUrl((product as any).imageUrl || null);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('sku', formData.sku);
    payload.append('price', formData.price.toString());
    payload.append('stock', formData.stock.toString());
    payload.append('categoryId', formData.categoryId);
    
    if (formData.hasExpiry && formData.expiryDate) {
       payload.append('expiryDate', formData.expiryDate);
    } 

    if (selectedFile) {
      payload.append('file', selectedFile);
    }

    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
        notify.success('Producto actualizado correctamente'); // <--- ÉXITO
      } else {
        await api.post('/products', payload);
        notify.success('Producto creado con éxito'); // <--- ÉXITO
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      notify.error('Error al guardar el producto. Revisa los datos.'); // <--- ERROR
    }
  };

  const toggleStatus = async (product: Product) => {
    // Confirmación opcional (si quieres quitarla, comenta estas 2 lineas)
    if (!window.confirm(`¿${product.isActive ? 'Desactivar' : 'Activar'} este producto?`)) return;

    try {
      await api.patch(`/products/${product.id}`, { isActive: !product.isActive });
      notify.success(`Producto ${product.isActive ? 'desactivado' : 'activado'} correctamente`); // <--- ÉXITO
      fetchData();
    } catch (error) {
      console.error(error);
      notify.error('No se pudo cambiar el estado del producto'); // <--- ERROR
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" 
            placeholder="Buscar productos..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={openCreateModal} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Imagen</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center p-8 text-gray-500">Cargando inventario...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-8 text-gray-500">No se encontraron productos.</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3">
                    {(p as any).imageUrl ? (
                      <img src={(p as any).imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <p className="font-bold text-slate-700">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-medium">
                      {p.category?.name || 'Sin Cat.'}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-700">${p.price.toLocaleString()}</td>
                  <td className="px-6 py-3">
                     <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {p.stock} u.
                     </div>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => toggleStatus(p)} title="Cambiar Estado">
                      <Power size={18} className={`${p.isActive ? 'text-green-500' : 'text-gray-300'} hover:scale-110 transition-transform`} />
                    </button>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => openEditModal(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-slate-800">
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
               </h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex flex-col items-center justify-center mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-all relative overflow-hidden group"
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-medium flex items-center gap-2"><Edit size={18}/> Cambiar Foto</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm text-slate-600 font-medium">Sube una foto</p>
                      <p className="text-xs text-slate-400">Clic aquí para seleccionar</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input required className="w-full border rounded-lg p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input required className="w-full border rounded-lg p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" required min="0" className="w-full border rounded-lg p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" required min="0" className="w-full border rounded-lg p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                    value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select required className="w-full border rounded-lg p-2 text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                   value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Seleccione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="hasExpiry"
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    checked={formData.hasExpiry}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFormData({ 
                            ...formData, 
                            hasExpiry: isChecked,
                            expiryDate: isChecked ? formData.expiryDate : '' 
                        });
                    }}
                  />
                  <label htmlFor="hasExpiry" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                    ¿El producto tiene fecha de vencimiento?
                  </label>
                </div>

                {formData.hasExpiry && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200 mt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      required={formData.hasExpiry} 
                      className="w-full border rounded-lg p-2 text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-lg shadow-blue-500/30">
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};