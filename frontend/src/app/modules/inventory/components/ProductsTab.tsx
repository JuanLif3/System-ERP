import { useEffect, useMemo, useState, useRef } from 'react'; 
import { Package, Plus, Search, AlertCircle, Edit, Power, ArrowUpDown, Upload, X } from 'lucide-react'; 
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

// Opciones de Ordenamiento
type SortOption = 'nameAsc' | 'nameDesc' | 'priceAsc' | 'priceDesc' | 'stockAsc' | 'stockDesc';

export const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortOption>('nameAsc');
  
  // Estados del Modal (Crear/Editar)
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Si es null, es modo CREAR
  
  const [formData, setFormData] = useState({
    name: '', 
    sku: '', 
    price: 0, 
    stock: 0, 
    categoryId: '', 
    imageUrl: '',
    hasExpiry: false, // Nuevo: Checkbox
    expiryDate: ''    // Nuevo: Fecha (YYYY-MM-DD)
  });

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      // SIN FILTROS AQUÍ. Guardamos todo lo que manda el backend.
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

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO (Puntos 1 y 5) ---
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Búsqueda (Nombre o SKU)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) || 
        p.sku.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Ordenamiento
    result.sort((a, b) => {
      switch (sortConfig) {
        case 'nameAsc': return a.name.localeCompare(b.name);
        case 'nameDesc': return b.name.localeCompare(a.name);
        case 'priceAsc': return a.price - b.price;
        case 'priceDesc': return b.price - a.price;
        case 'stockAsc': return a.stock - b.stock;
        case 'stockDesc': return b.stock - a.stock;
        default: return 0;
      }
    });

    return result;
  }, [products, searchTerm, sortConfig]);

  // --- ACCIONES ---

  // Abrir modal para Crear
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', sku: '', price: 0, stock: 0, categoryId: '', imageUrl: '',
      hasExpiry: false, expiryDate: '' // <--- Resetear
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  // Abrir modal para Editar (Punto 4)
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    
    // Verificamos si el producto tiene fecha guardada para marcar el checkbox
    const hasDate = !!(product as any).expiryDate; 
    
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      categoryId: product.category?.id || '',
      imageUrl: (product as any).imageUrl || '',
      hasExpiry: hasDate, // Marcar si tiene fecha
      // Formatear fecha para el input type="date" (YYYY-MM-DD)
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
      // Crear URL temporal para previsualizar
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Guardar (Crear o Editar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('sku', formData.sku);
    payload.append('price', formData.price.toString());
    payload.append('stock', formData.stock.toString());
    payload.append('categoryId', formData.categoryId);
    
    // LÓGICA DE VENCIMIENTO
    if (formData.hasExpiry && formData.expiryDate) {
       payload.append('expiryDate', formData.expiryDate);
    } 
    // Si desmarcó el checkbox, no mandamos fecha, y el backend debería recibir null 
    // (Nota: Si estás editando y quieres BORRAR la fecha, a veces hay que mandar null explícito, 
    // pero por ahora probemos si al no enviar se actualiza).

    if (selectedFile) {
      payload.append('file', selectedFile);
    }

    try {
      // Nota: Axios detecta FormData y pone automáticamente el header 'multipart/form-data'
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al guardar producto');
    }
  };

  // Toggle Activo/Inactivo (Punto 3)
  const toggleStatus = async (product: Product) => {
    try {
      // Optimismo UI: Actualizamos localmente primero para que se sienta rápido
      const newStatus = !product.isActive;
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
      
      // Llamada API silenciosa
      await api.patch(`/products/${product.id}`, { isActive: newStatus });
    } catch (error) {
      alert('Error al cambiar estado');
      fetchData(); // Revertir si falla
    }
  };

  // Helper Moneda
  const formatCurrency = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);

  return (
    <div className="space-y-4">
      {/* --- TOOLBAR --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        
        {/* Buscador */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            placeholder="Buscar por nombre o SKU..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filtro de Ordenamiento */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-gray-600 bg-white cursor-pointer hover:border-primary transition-colors">
              <ArrowUpDown size={16} />
              <select 
                value={sortConfig}
                onChange={(e) => setSortConfig(e.target.value as SortOption)}
                className="appearance-none bg-transparent outline-none cursor-pointer w-32"
              >
                <option value="nameAsc">Nombre (A-Z)</option>
                <option value="nameDesc">Nombre (Z-A)</option>
                <option value="stockAsc">Stock (Menor)</option>
                <option value="stockDesc">Stock (Mayor)</option>
                <option value="priceAsc">Precio (Menor)</option>
                <option value="priceDesc">Precio (Mayor)</option>
              </select>
            </div>
          </div>

          {/* Botón Crear */}
          <button 
            onClick={openCreateModal}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* --- TABLA --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Precio</th>
              <th className="px-6 py-3 text-center">Stock</th>
              <th className="px-6 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr><td colSpan={6} className="p-8 text-center">Cargando inventario...</td></tr>
            ) : filteredAndSortedProducts.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-gray-400">No se encontraron productos</td></tr>
            ) : (
              filteredAndSortedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-800">{p.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{p.sku}</div>
                  </td>
                  <td className="px-6 py-3">
                    {/* Si tiene imagen la muestra, si no, un cuadro gris con un icono */}
  {(p as any).imageUrl ? (
    <img src={(p as any).imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
  ) : (
    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-gray-400">
      <Package size={20} />
    </div>
  )}
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
                    <button 
                        onClick={() => toggleStatus(p)}
                        className={`p-1 rounded-full transition-colors ${p.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                        title={p.isActive ? "Desactivar" : "Activar"}
                    >
                        <Power size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button 
                        onClick={() => openEditModal(p)}
                        className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded"
                        title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-slate-800">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* ZONA DE CARGA DE IMAGEN */}
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
                {/* Input invisible */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                />
              </div>

              {/* CAMPOS DE TEXTO (Igual que antes) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input required className="w-full border rounded-lg p-2 text-sm outline-none focus:border-primary" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input required className="w-full border rounded-lg p-2 text-sm outline-none focus:border-primary" 
                    value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" required min="0" className="w-full border rounded-lg p-2 text-sm outline-none focus:border-primary" 
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" required min="0" className="w-full border rounded-lg p-2 text-sm outline-none focus:border-primary" 
                    value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
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
                            // Si desmarca, limpiamos la fecha internamente
                            expiryDate: isChecked ? formData.expiryDate : '' 
                        });
                    }}
                  />
                  <label htmlFor="hasExpiry" className="text-sm font-medium text-slate-700 select-none cursor-pointer">
                    ¿El producto tiene fecha de vencimiento?
                  </label>
                </div>

                {/* Renderizado Condicional: Solo aparece si el checkbox es True */}
                {formData.hasExpiry && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200 mt-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      required={formData.hasExpiry} // Es obligatorio solo si el checkbox está activo
                      className="w-full border rounded-lg p-2 text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select required className="w-full border rounded-lg p-2 text-sm bg-white outline-none focus:border-primary"
                   value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Seleccione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm">
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