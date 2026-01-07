import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Search, PackageX } from 'lucide-react';
import { api } from '../../../config/api';

// Interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const NewSaleTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar productos al iniciar
  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      // Filtramos solo los que tienen stock > 0
      setProducts(data.filter((p: Product) => p.stock > 0));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Lógica del Carrito ---

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      
      // Si ya existe, aumentamos cantidad (si hay stock)
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Límite de stock
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Si no existe, lo agregamos
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          // Validaciones: no bajar de 1, no superar stock
          if (newQty < 1) return item;
          if (newQty > item.product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  // --- Finalizar Venta ---

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // Mapear el carrito al formato que espera el Backend DTO
      const payload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      await api.post('/orders', payload);
      
      alert('¡Venta registrada con éxito!');
      setCart([]); // Limpiar carrito
      fetchProducts(); // Recargar stock actualizado
    } catch (error) {
      alert('Error al procesar la venta');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cálculos
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const formatMoney = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  
  // Filtrado
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
      
      {/* IZQUIERDA: Catálogo de Productos */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="Buscar producto por nombre o SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          {loading ? (
            <div className="text-center p-10">Cargando catálogo...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center p-10 text-gray-400">No se encontraron productos con stock</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                // Verificar cuánto hay en el carrito para deshabilitar si se agota
                const inCart = cart.find(c => c.product.id === product.id)?.quantity || 0;
                const isOutOfStock = inCart >= product.stock;

                return (
                  <button
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    disabled={isOutOfStock}
                    className={`text-left p-3 rounded-xl border transition-all hover:shadow-md flex flex-col justify-between h-24
                      ${isOutOfStock 
                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' 
                        : 'bg-white border-slate-200 hover:border-primary cursor-pointer'
                      }`}
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-gray-500">{product.sku}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <span className="font-bold text-primary">{formatMoney(product.price)}</span>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        Stock: {product.stock - inCart}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DERECHA: Carrito de Compras */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-900 text-white rounded-t-xl flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2">
            <ShoppingCart size={18} /> Carrito Actual
          </h3>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {cart.length} items
          </span>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <PackageX size={40} className="opacity-20" />
              <p className="text-sm">El carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 p-2 border border-slate-100 rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-primary font-bold">{formatMoney(item.product.price * item.quantity)}</p>
                </div>
                
                {/* Controles de Cantidad */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                  <button 
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product.id, 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Total y Checkout */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Total a Pagar</span>
            <span className="text-2xl font-bold text-slate-800">{formatMoney(totalAmount)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
};