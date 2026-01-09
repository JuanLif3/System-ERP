import { useEffect, useState, useRef } from 'react';
import { Package, Plus, Search, Edit, Power, Upload, X, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { api } from '../../../config/api';
import { useNotification } from '../../../context/NotificationContext';

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
  const notify = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE FILTRO Y PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState(''); // 'expiry-asc', 'expiry-desc', etc.
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 35;

  // --- ESTADOS DE MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', price: 0, stock: 0, categoryId: '', imageUrl: '',
    hasExpiry: false, expiryDate: ''
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
      notify.error('Error al cargar datos del inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? p.category?.id === selectedCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      switch (sortOrder) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'stock-asc': return a.stock - b.stock;
        case 'stock-desc': return b.stock - a.stock;
        
        // --- NUEVOS FILTROS DE VENCIMIENTO ---
        case 'expiry-asc': // Más próximo a vencer (Los que tienen fecha van primero)
            if (!a.expiryDate && !b.expiryDate) return 0;
            if (!a.expiryDate) return 1; // Si A no tiene fecha, va al final
            if (!b.expiryDate) return -1; // Si B no tiene fecha, B va al final
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();

        case 'expiry-desc': // Más lejano a vencer
            if (!a.expiryDate && !b.expiryDate) return 0;
            if (!a.expiryDate) return 1; 
            if (!b.expiryDate) return -1;
            return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
            
        default: return 0;
      }
    });

  // --- LÓGICA DE PAGINACIÓN ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOrder]);

  // --- MANEJADORES DEL MODAL ---
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', price: 0, stock: 0, categoryId: '', imageUrl: '', hasExpiry: false, expiryDate: '' });
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

    if (selectedFile) payload.append('file', selectedFile);

    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
        notify.success('Producto actualizado');
      } else {
        await api.post('/products', payload);
        notify.success('Producto creado');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      notify.error('Error al guardar');
    }
  };

  const toggleStatus = async (product: Product) => {
    if (!window.confirm(`¿${product.isActive ? 'Desactivar' : 'Activar'}?`)) return;
    try {
      await api.patch(`/products/${product.id}`, { isActive: !product.isActive });
      notify.success('Estado cambiado');
      fetchData();
    } catch (error) { notify.error('Error al cambiar estado'); }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'S/F';
    const date = new Date(dateStr);
    const now = new Date();
    // Cálculo simple de días para dar color
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let colorClass = 'text-slate-600';
    if (diffDays < 0) colorClass = 'text-red-600 font-bold'; // Vencido
    else if (diffDays < 30) colorClass = 'text-orange-600 font-bold'; // Por vencer

    return <span className={colorClass}>{date.toLocaleDateString('es-CL', { timeZone: 'UTC' })}</span>;
  };

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* BUSCADOR */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm transition-all" 
            placeholder="Buscar productos..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTROS AVANZADOS */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filtro Categoría */}
            <select 
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
            >
                <option value="">Todas las Categorías</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Ordenar Por (ACTUALIZADO) */}
            <select 
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
            >
                <option value="">Ordenar por...</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="stock-asc">Stock: Menor a Mayor</option>
                <option value="stock-desc">Stock: Mayor a Menor</option>
                <option className="text-orange-600 font-bold" value="expiry-asc">Vencimiento: Más Próximo</option>
                <option className="text-green-600 font-bold" value="expiry-desc">Vencimiento: Más Lejano</option>
            </select>

            {/* Botón Nuevo */}
            <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 ml-auto md:ml-2">
                <Plus size={20} /> Nuevo
            </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                <th className="px-6 py-3">Imagen</th>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Categoría</th>
                <th className="px-6 py-3">Precio</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Vencimiento</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                <tr><td colSpan={8} className="text-center p-8 text-gray-500">Cargando inventario...</td></tr>
                ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-8 text-gray-500">No se encontraron productos.</td></tr>
                ) : (
                paginatedProducts.map((p) => (
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
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {p.stock} u.
                        </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                        {formatDate((p as any).expiryDate)}
                    </td>
                    <td className="px-6 py-3 text-center">
                        <button onClick={() => toggleStatus(p)} title="Cambiar Estado">
                        <Power size={18} className={`${p.isActive ? 'text-green-500' : 'text-gray-300'} hover:scale-110 transition-transform`} />
                        </button>
                    </td>
                    <td className="px-6 py-3 text-center">
                        <button onClick={() => openEditModal(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit size={18} />
                        </button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        
        {/* PAGINACIÓN */}
        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
                Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
            </span>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={20} className="text-slate-600"/>
                </button>
                <span className="text-xs font-medium text-slate-700">
                    Página {currentPage} de {totalPages || 1}
                </span>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={20} className="text-slate-600"/>
                </button>
            </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar z-10">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
               <h3 className="text-xl font-bold text-slate-800">{editingProduct ? 'Editar' : 'Crear'} Producto</h3>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>
            <div className="p-6">
                <form onSubmit={handleSave} className="space-y-4">
                {/* FOTO */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all relative overflow-hidden group">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <div className="text-center p-4"><Upload className="mx-auto text-slate-400 mb-2"/><p className="text-sm text-slate-600">Subir foto</p></div>}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>

                {/* CAMPOS BASICOS */}
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-slate-700">Nombre</label><input required className="input-modern" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                    <div><label className="text-sm font-medium text-slate-700">SKU</label><input required className="input-modern" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-slate-700">Precio</label><input type="number" required min="0" className="input-modern no-spinner" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
                    <div><label className="text-sm font-medium text-slate-700">Stock</label><input type="number" required min="0" className="input-modern no-spinner" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} /></div>
                </div>
                
                <div>
                    <label className="text-sm font-medium text-slate-700">Categoría</label>
                    <select required className="input-modern bg-white" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* VENCIMIENTO */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="hasExpiry" className="w-4 h-4 text-indigo-600 rounded" checked={formData.hasExpiry} onChange={(e) => setFormData({ ...formData, hasExpiry: e.target.checked, expiryDate: e.target.checked ? formData.expiryDate : '' })} />
                    <label htmlFor="hasExpiry" className="text-sm font-medium text-slate-700 select-none cursor-pointer">¿Tiene fecha de vencimiento?</label>
                    </div>
                    {formData.hasExpiry && (
                    <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
                        <input type="date" required={formData.hasExpiry} className="input-modern" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
                    </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-lg shadow-indigo-600/30">Guardar</button>
                </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};