import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Trash2, Plus, CheckCircle, Package, ImageOff, CreditCard, Banknote, ArrowRightLeft, X } from 'lucide-react';
import { api } from '../../../config/api';
import { useNotification } from '../../../context/NotificationContext';

// ... (Interfaces Product y CartItem se mantienen igual) ...
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl?: string;
}
interface CartItem extends Product { quantity: number; }

export const NewSaleTab = () => {
  const notify = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NUEVO: Estado para el modal de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) { console.error(error); notify.error('Error al cargar productos'); }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) { notify.error('Producto sin stock'); return; }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { notify.warning('No hay más stock'); return prev; }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // 1. ABRE EL MODAL EN LUGAR DE ENVIAR DIRECTO
  const initiateCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  // 2. PROCESA LA VENTA CON EL MÉTODO SELECCIONADO
  const processSale = async (paymentMethod: 'CASH' | 'CARD' | 'TRANSFER') => {
    setLoading(true);
    try {
      const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
      
      // Enviamos el paymentMethod al backend
      await api.post('/orders', { items, paymentMethod });
      
      notify.success('Venta realizada con éxito');
      setCart([]);
      setShowPaymentModal(false); // Cierra modal
      fetchProducts();
    } catch (error) {
      console.error(error);
      notify.error('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
      {/* IZQUIERDA: PRODUCTOS (Igual que antes) */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="Buscar por nombre o SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"> 
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => addToCart(product)} className={`group bg-white rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col ${product.stock === 0 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1'}`}>
                <div className="w-full aspect-square bg-slate-100 relative overflow-hidden">
                    {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageOff size={40} /></div>}
                    <div className="absolute top-2 left-2"><span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-md ${product.stock < 5 ? 'bg-red-500/90 text-white' : 'bg-white/90 text-slate-700'}`}>{product.stock} un.</span></div>
                    {product.stock > 0 && <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"><div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg"><Plus size={20} /></div></div>}
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between">
                    <div><div className="font-bold text-slate-700 text-sm line-clamp-2 mb-1">{product.name}</div><span className="text-[10px] font-mono text-slate-400">{product.sku}</span></div>
                    <div className="mt-2 pt-2 border-t border-slate-50"><div className="text-lg font-bold text-slate-900">${product.price.toLocaleString()}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DERECHA: CARRITO */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl shadow-soft border border-slate-200 h-full">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingCart size={20} className="text-indigo-600"/> Tu Carrito</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{cart.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center"><ShoppingCart size={32} opacity={0.2} /></div>
                <p className="text-sm font-medium">Carrito vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors group">
                <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Package size={16}/></div>}
                </div>
                <div className="flex-1 min-w-0"><p className="font-medium text-slate-700 text-sm truncate">{item.name}</p><p className="text-xs text-slate-400">${item.price.toLocaleString()} x {item.quantity}</p></div>
                <div className="flex flex-col items-end gap-1"><div className="font-bold text-slate-800 text-sm">${(item.price * item.quantity).toLocaleString()}</div><div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5"><button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white hover:shadow rounded text-slate-500"><div className="w-3 h-0.5 bg-current"/></button><button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white hover:shadow rounded text-slate-500"><Plus size={12}/></button></div></div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>
        <div className="p-5 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-end mb-4"><span className="text-slate-500 font-medium">Total</span><span className="text-3xl font-bold text-slate-900 tracking-tight">${total.toLocaleString()}</span></div>
          <button onClick={initiateCheckout} disabled={cart.length === 0 || loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:translate-y-0">
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={20} /> Confirmar Venta</>}
          </button>
        </div>
      </div>

      {/* --- MODAL DE SELECCIÓN DE PAGO --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Método de Pago</h3>
              <p className="text-slate-500 mt-1">Selecciona cómo pagará el cliente</p>
              <div className="mt-4 text-3xl font-bold text-indigo-600">${total.toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => processSale('CASH')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 group transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Banknote size={24}/></div>
                  <span className="font-bold text-slate-700 group-hover:text-green-700">Efectivo</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-green-500"></div>
              </button>

              <button onClick={() => processSale('CARD')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 group transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CreditCard size={24}/></div>
                  <span className="font-bold text-slate-700 group-hover:text-blue-700">Débito / Crédito</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-blue-500"></div>
              </button>

              <button onClick={() => processSale('TRANSFER')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50 group transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><ArrowRightLeft size={24}/></div>
                  <span className="font-bold text-slate-700 group-hover:text-violet-700">Transferencia</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-violet-500"></div>
              </button>
            </div>
            
            {loading && (
               <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-2xl z-10">
                   <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                   <p className="font-medium text-indigo-600">Procesando pago...</p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};