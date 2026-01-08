import { useEffect, useState } from 'react';
import { api } from '../../../config/api';
import { FileText, Calendar, Trash2, X, User as UserIcon, Package } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    sku: string;
  };
}

interface Order {
  id: string;
  total: number;
  totalItems: number;
  status: string;
  createdAt: string;
  user: { fullName: string }; // Información del vendedor
  items: OrderItem[];
}

export const OrderHistoryTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de Detalle
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Verificar si soy Admin para mostrar el botón de borrar
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.roles === 'ADMIN';

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de anular esta venta? El stock será devuelto.')) return;
    
    try {
      await api.delete(`/orders/${id}`);
      fetchOrders(); // Recargar tabla
      alert('Venta anulada correctamente');
    } catch (error) {
      alert('Error al anular venta');
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';

    // TRUCO DE ARQUITECTO:
    // Si la fecha viene "2026-01-08T00:53:21" (sin Z), el navegador cree que es hora local.
    // Le pegamos una 'Z' al final para gritarle al navegador: "¡ESTO ES UTC!"
    // Así, cuando la convierta a Chile, le restará las 3 o 4 horas correspondientes.
    const rawDate = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    
    const date = new Date(rawDate);

    return new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago', // Esto hace la conversión (UTC - 3 horas)
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  if (loading) return <div className="p-8 text-center">Cargando historial...</div>;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID / Fecha</th>
              <th className="px-6 py-4">Vendedor</th>
              <th className="px-6 py-4 text-center">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
  <div className="flex flex-col">
    <span className="font-mono text-xs text-gray-500 mb-1">{order.id.split('-')[0]}...</span>
    <div className="flex items-center gap-1 text-gray-700 font-medium">
        <Calendar size={14} className="text-blue-500" />
        {/* Aquí se usa la función */}
        {formatDate(order.createdAt)} 
    </div>
  </div>
</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <UserIcon size={14} />
                    <span className="capitalize">{order.user?.fullName.split(' ')[0] || 'Sistema'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                    {order.items?.length || 0}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">
                  {formatMoney(order.total)}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors"
                        title="Ver Detalle"
                    >
                      <FileText size={18} />
                    </button>
                    
                    {isAdmin && (
                        <button 
                            onClick={() => handleDelete(order.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Anular Venta"
                        >
                        <Trash2 size={18} />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE DETALLE --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Detalle de Venta</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Info General */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="font-medium text-slate-800">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Vendedor</p>
                        <p className="font-medium text-slate-800">{selectedOrder.user?.fullName}</p>
                    </div>
                </div>

                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Package size={16}/> Productos Vendidos
                </h4>
                
                {/* Lista de Productos */}
                <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                            <div>
                                <p className="font-medium text-slate-800 text-sm">{item.product?.name || 'Producto eliminado'}</p>
                                <p className="text-xs text-gray-500 font-mono">SKU: {item.product?.sku}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-800">{formatMoney(item.price * item.quantity)}</p>
                                <p className="text-xs text-gray-500">{item.quantity} x {formatMoney(item.price)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Pagado</span>
                <span className="text-2xl font-bold text-blue-600">{formatMoney(selectedOrder.total)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};