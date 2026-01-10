import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Trash2, Plus, CheckCircle, Package, ImageOff, CreditCard, Banknote, ArrowRightLeft, X, Minus } from 'lucide-react';
import { api } from '../../../config/api';
import { useNotification } from '../../../context/NotificationContext';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl?: string;
  isActive: boolean;
}
interface CartItem extends Product { quantity: number; }

// --- CORRECCIÓN FINAL DE IMAGEN ---
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return undefined;
  
  // 1. PRIMERO LIMPIAMOS EL "LOCALHOST" DE LA BASE DE DATOS
  // Esto arregla el error: reemplazamos la parte "http://localhost:3000" por nada.
  let cleanPath = imagePath
    .replace('http://localhost:3000', '')
    .replace('https://localhost:3000', '')
    .replace('localhost:3000', '');

  // 2. Si es una URL externa REAL (ej: https://aws.s3...), la devolvemos.
  // Pero como ya borramos el localhost arriba, esta línea ya no dejará pasar la URL mala.
  if (cleanPath.startsWith('http')) return cleanPath;

  // 3. Limpiamos barras duplicadas
  cleanPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;

  // 4. CONSTRUIMOS LA URL CORRECTA SEGÚN DONDE ESTEMOS
  const isProd = window.location.hostname.includes('nortedev.cl');
  
  // Si estamos en nortedev.cl, usamos ese dominio. Si no, usamos localhost.
  const baseUrl = isProd ? 'https://www.nortedev.cl' : 'http://localhost:3000';

  return `${baseUrl}/${cleanPath}`;
};

export const NewSaleTab = () => {
  const notify = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
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

  const initiateCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const processSale = async (paymentMethod: 'CASH' | 'CARD' | 'TRANSFER') => {
    setLoading(true);
    try {
      const items = cart.map(item => ({ productId: item.id, quantity: item.quantity }));
      await api.post('/orders', { items, paymentMethod });
      
      notify.success('Venta realizada con éxito');
      setCart([]);
      setShowPaymentModal(false);
      fetchProducts();
    } catch (error) {
      console.error(error);
      notify.error('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    (p.isActive === true) && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full min-h-0">
      
      {/* SECCIÓN IZQUIERDA: PRODUCTOS */}
      <div 
        id="tour-sales-products" 
        className="flex-1 flex flex-col bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden min-h-0 order-1 lg:order-1"
      >
        
        {/* Barra de Búsqueda */}
        <div className="p-3 lg:p-4 border-b border-slate-100 bg-white z-10 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm lg:text-base"
              placeholder="Buscar producto..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Grid de Productos Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4 custom-scrollbar bg-slate-50/50">
          {filteredProducts.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Package size={48} opacity={0.2} />
               <p className="mt-2 text-sm">
                 {searchTerm ? "No se encontraron productos" : "No hay productos activos para vender"}
               </p>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-20 lg:pb-0"> 
              {filteredProducts.map(product => (
                <div key={product.id} onClick={() => addToCart(product)} className={`group bg-white rounded-xl border border-slate-100 shadow-sm transition-all cursor-pointer relative overflow-hidden flex flex-col active:scale-95 duration-150 ${product.stock === 0 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-indigo-300 hover:shadow-md'}`}>
                  {/* Imagen (Usamos la función corregida) */}
                  <div className="w-full aspect-square bg-slate-100 relative overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                            src={getImageUrl(product.imageUrl)} 
                            className="w-full h-full object-cover transition-transform duration-500 lg:group-hover:scale-110" 
                            alt={product.name} 
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageOff size={32} /></div>
                      )}
                      
                      {/* Fallback visual */}
                      <div className="hidden w-full h-full absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-100"><ImageOff size={32} /></div>

                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm backdrop-blur-md ${product.stock < 5 ? 'bg-red-500/90 text-white' : 'bg-white/90 text-slate-700'}`}>
                          {product.stock}
                        </span>
                      </div>
                      
                      {product.stock > 0 && (
                        <div className="absolute bottom-2 right-2 hidden lg:block opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg"><Plus size={16} /></div>
                        </div>
                      )}
                  </div>

                  <div className="p-2.5 lg:p-3 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="font-bold text-slate-700 text-xs lg:text-sm line-clamp-2 mb-1 leading-snug">{product.name}</div>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">{product.sku}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between items-center">
                        <div className="text-sm lg:text-lg font-bold text-slate-900">${product.price.toLocaleString()}</div>
                        <div className="lg:hidden bg-indigo-50 text-indigo-600 p-1.5 rounded-md"><Plus size={14}/></div>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DERECHA: CARRITO (Mantenemos diseño móvil ajustado) */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl shadow-soft border border-slate-200 lg:h-full order-2 lg:order-2 shrink-0 h-auto max-h-[35vh] lg:max-h-none border-t-4 lg:border-t-0 border-indigo-50 lg:border-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-soft z-20">
        
        <div className="p-2 lg:p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm lg:text-base">
              <ShoppingCart size={20} className="text-indigo-600"/> 
              <span className="hidden sm:inline">Tu Carrito</span>
              <span className="sm:hidden">Carrito</span>
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{cart.length} ítems</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-3 custom-scrollbar min-h-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-4">
                <p className="text-sm font-medium">Carrito vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                    {item.imageUrl ? <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Package size={16}/></div>}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 text-xs lg:text-sm truncate">{item.name}</p>
                  <p className="text-[10px] lg:text-xs text-slate-400">${item.price.toLocaleString()} x {item.quantity}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="font-bold text-slate-800 text-xs lg:text-sm">${(item.price * item.quantity).toLocaleString()}</div>
                  <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                    <button onClick={(e) => {e.stopPropagation(); updateQuantity(item.id, -1)}} className="p-1 hover:bg-white rounded text-slate-500"><Minus size={12}/></button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={(e) => {e.stopPropagation(); updateQuantity(item.id, 1)}} className="p-1 hover:bg-white rounded text-slate-500"><Plus size={12}/></button>
                  </div>
                </div>

                <button onClick={(e) => {e.stopPropagation(); removeFromCart(item.id)}} className="text-slate-300 hover:text-red-500 p-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>

        <div className="p-3 lg:p-5 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="flex justify-between items-end mb-2 lg:mb-4">
            <span className="text-slate-500 font-medium text-sm">Total</span>
            <span className="text-xl lg:text-3xl font-bold text-slate-900 tracking-tight">${total.toLocaleString()}</span>
          </div>
          <button 
            id="tour-sales-pay-btn" 
            onClick={initiateCheckout} 
            disabled={cart.length === 0 || loading} 
            className="w-full py-3 lg:py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base lg:text-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={20} /> <span className="hidden sm:inline">Confirmar Venta</span><span className="sm:hidden">Cobrar</span></>}
          </button>
        </div>
      </div>

      {/* --- MODAL DE SELECCIÓN DE PAGO --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 relative pb-10 sm:pb-6">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"><X size={20}/></button>
            
            <div className="text-center mb-6 lg:mb-8">
              <h3 className="text-xl lg:text-2xl font-bold text-slate-800">Método de Pago</h3>
              <p className="text-slate-500 mt-1 text-sm">Selecciona cómo pagará el cliente</p>
              <div className="mt-4 text-3xl font-bold text-indigo-600">${total.toLocaleString()}</div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => processSale('CASH')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 group transition-all active:bg-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Banknote size={24}/></div>
                  <span className="font-bold text-slate-700 group-hover:text-green-700">Efectivo</span>
                </div>
              </button>

              <button onClick={() => processSale('CARD')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 group transition-all active:bg-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CreditCard size={24}/></div>
                  <span className="font-bold text-slate-700 group-hover:text-blue-700">Débito / Crédito</span>
                </div>
              </button>

              <button onClick={() => processSale('TRANSFER')} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50 group transition-all active:bg-violet-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><ArrowRightLeft size={24}/></div>
                  <span className="font-bold text-slate-700 group-hover:text-violet-700">Transferencia</span>
                </div>
              </button>
            </div>
            
            {loading && (
               <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-2xl z-10">
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