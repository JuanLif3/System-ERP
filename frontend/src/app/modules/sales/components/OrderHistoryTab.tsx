import { useEffect, useState } from 'react';
import { api } from '../../../config/api';
import { FileText, Calendar } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  totalItems: number; // Agregamos esta columna en la entidad Order del backend
  status: string;
  createdAt: string;
  items: any[];
}

export const OrderHistoryTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrders();
  }, []);

  const formatMoney = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('es-CL');

  if (loading) return <div className="p-8 text-center">Cargando historial...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium">
          <tr>
            <th className="px-6 py-4">ID Orden</th>
            <th className="px-6 py-4">Fecha</th>
            <th className="px-6 py-4">Items</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4 text-right">Detalle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-mono text-xs text-gray-500">
                {order.id.slice(0, 8)}...
              </td>
              <td className="px-6 py-4 flex items-center gap-2 text-gray-700">
                <Calendar size={14} className="text-gray-400" />
                {formatDate(order.createdAt)}
              </td>
              <td className="px-6 py-4">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                  {order.items?.length || 0} prod
                </span>
              </td>
              <td className="px-6 py-4 font-bold text-slate-800">
                {formatMoney(order.total)}
              </td>
              <td className="px-6 py-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-primary transition-colors">
                  <FileText size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};