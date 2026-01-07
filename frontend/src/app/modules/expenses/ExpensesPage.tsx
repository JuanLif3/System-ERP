import { useEffect, useState } from 'react';
import { Plus, Wallet, Calendar, Trash2 } from 'lucide-react';
import { api } from '../../config/api';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  user: { fullName: string }; // Para saber quién registró el gasto
}

export const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto (YYYY-MM-DD)
  });

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount), // Convertir a número
        date: new Date(formData.date).toISOString() // Convertir a ISO para el backend
      });
      setShowModal(false);
      setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (error) {
      alert('Error al registrar gasto');
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-CL');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gastos Operativos</h1>
          <p className="text-gray-500 text-sm">Registra las salidas de dinero de la empresa</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Registrar Gasto
        </button>
      </div>

      {/* Tabla de Gastos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Registrado Por</th>
              <th className="px-6 py-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center">Cargando...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">No hay gastos registrados</td></tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-red-50 text-red-600 rounded">
                      <Wallet size={16} />
                    </div>
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400"/>
                      {formatDate(expense.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {expense.user?.fullName || 'Sistema'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    - {formatMoney(expense.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Creación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Nuevo Gasto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  required
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ej: Pago de Luz"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};