import { useEffect, useState } from 'react';
import { 
  Calendar, Package, Trash2, Banknote, CreditCard, ArrowRightLeft, User, Eye, X, ShoppingBag, Send 
} from 'lucide-react';
import { api } from '../../../config/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../auth/context/AuthContext';

interface Product {
  name: string;
  sku: string;
  imageUrl?: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  user?: { fullName: string };
}

export const OrderHistoryTab = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADOS DE LOS MODALES ---
  // Inicializamos en NULL para que no aparezcan al cargar
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); 
  const [requestDeleteOrder, setRequestDeleteOrder] = useState<Order | null>(null); 
  const [deleteReason, setDeleteReason] = useState('');

  const notify = useNotification();

  // Verificación robusta de roles (Convierte a string para evitar errores si es null)
  const userRole = user?.roles?.toString().toLowerCase() || '';
  const isAdmin = userRole.includes('admin') || userRole.includes('manager');

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error(error);
      notify.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- LÓGICA DEL BOTÓN DE ELIMINAR ---
  const handleDeleteClick = (order: Order) => {
      // Esta función SOLO se ejecuta cuando el usuario hace clic
      if (isAdmin) {
          // Si es Admin, borra directamente
          handleDirectDelete(order.id);
      } else {
          // Si es Vendedor, ABRE el modal (guarda la orden en el estado)
          setDeleteReason(''); // Limpiamos el texto anterior
          setRequestDeleteOrder(order); 
      }
  }

  const handleDirectDelete = async (id: string) => {
      if(!window.confirm('¿Eliminar venta permanentemente? Esto devolverá el stock.')) return;
      try {
          await api.delete(`/orders/${id}`);
          notify.success('Venta eliminada');
          fetchOrders();
          if (selectedOrder?.id === id) setSelectedOrder(null);
      } catch (error) {
          notify.error('Error al eliminar venta');
      }
  }

  const submitDeletionRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!requestDeleteOrder) return;
      try {
          await api.post(`/orders/${requestDeleteOrder.id}/request-delete`, { reason: deleteReason });
          notify.success('Solicitud enviada al administrador');
          setRequestDeleteOrder(null); // Cerramos el modal
      } catch (error: any) {
          notify.error(error.response?.data?.message || 'Error al enviar solicitud');
      }
  }

  const renderPaymentMethod = (method: string) => {
    switch (method) {
        case 'CASH': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100"><Banknote size={14}/> Efectivo</span>;
        case 'CARD': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"><CreditCard size={14}/> Tarjeta</span>;
        case 'TRANSFER': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100"><ArrowRightLeft size={14}/> Transf.</span>;
        default: return <span className="text-slate-400 text-xs italic">No especificado</span>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">ID / Fecha</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center p-8 text-slate-400">Cargando historial...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-8 text-slate-400">No hay ventas registradas.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                          <span className="font-mono text-xs text-slate-400 mb-0.5">#{order.id.slice(-8)}</span>
                          <div className="flex items-center gap-1 text-slate-600">
                              <Calendar size={12}/>
                              <span>{new Date(order.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                              <User size={12} />
                          </div>
                          <span className="text-xs font-medium">{order.user?.fullName || 'Desconocido'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        {renderPaymentMethod(order.paymentMethod)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                          <Package size={16} className="text-slate-400"/>
                          {order.items?.reduce((acc, item) => acc + item.quantity, 0)} un.
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      ${Number(order.total).toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                          {/* VER DETALLE */}
                          <button 
                            onClick={() => setSelectedOrder(order)} 
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                            title="Ver Detalle"
                          >
                              <Eye size={18} />
                          </button>
                          
                          {/* ELIMINAR / SOLICITAR (CORREGIDO) */}
                          <button 
                            onClick={() => handleDeleteClick(order)} // <--- CLAVE: Arrow function implícita en la definición o referencia directa correcta
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title={isAdmin ? "Eliminar Venta" : "Solicitar Eliminación"}
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE DETALLE --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ShoppingBag size={20} className="text-indigo-600"/> Detalle de Venta
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedOrder.id}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg p-1 transition-colors">
                        <X size={20}/>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 mb-1">Fecha y Hora</p>
                            <div className="font-medium text-slate-700 text-sm flex items-center gap-2">
                                <Calendar size={14}/>
                                {new Date(selectedOrder.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <p className="text-xs text-slate-400 mb-1">Método de Pago</p>
                             <div className="mt-0.5">{renderPaymentMethod(selectedOrder.paymentMethod)}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                             <p className="text-xs text-slate-400 mb-1">Vendedor</p>
                             <div className="font-medium text-slate-700 text-sm flex items-center gap-2">
                                <User size={14}/> {selectedOrder.user?.fullName || 'Sistema / Desconocido'}
                             </div>
                        </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Productos ({selectedOrder.items?.length})</h4>
                    <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                    {item.product?.imageUrl ? <img src={item.product.imageUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={16}/></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{item.product?.name || 'Producto eliminado'}</p>
                                    <p className="text-xs text-slate-500 font-mono">{item.product?.sku}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                                    <p className="text-xs text-slate-400">{item.quantity} x ${item.price.toLocaleString('es-CL')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Total Pagado</span>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">${Number(selectedOrder.total).toLocaleString('es-CL')}</span>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE SOLICITUD DE BORRADO --- */}
      {requestDeleteOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Trash2 size={20} className="text-red-500"/> Solicitar Eliminación
                    </h3>
                    <button onClick={() => setRequestDeleteOrder(null)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                
                <p className="text-sm text-slate-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                    No tienes permisos para eliminar ventas directamente. Envía una solicitud al administrador explicando el motivo.
                </p>

                <form onSubmit={submitDeletionRequest}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de la solicitud</label>
                    <textarea 
                        required
                        className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none h-24 transition-all"
                        placeholder="Ej: El cliente devolvió el producto, error en el cobro, duplicada..."
                        value={deleteReason}
                        onChange={e => setDeleteReason(e.target.value)}
                        autoFocus
                    />
                    
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setRequestDeleteOrder(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-lg shadow-red-600/20 flex items-center gap-2 transition-transform active:scale-95">
                            <Send size={16}/> Enviar Solicitud
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
};