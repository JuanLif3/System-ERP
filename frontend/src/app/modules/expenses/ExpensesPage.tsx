import { useEffect, useState } from 'react';
import { 
  DollarSign, Plus, Calendar, User, Trash2, Edit, Search, X 
} from 'lucide-react';
import { api } from '../../config/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../auth/context/AuthContext';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  user?: { fullName: string };
}

export const ExpensesPage = () => {
  const notify = useNotification();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const isDemo = user?.email === 'demo@nexus.cl';

  // Estados Modal
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } catch (error) {
      console.error(error);
      notify.error('Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  // 🔒 AVISO
  const openModal = () => {
      if (isDemo) notify.info('🎓 Demo: Puedes ver los campos, pero no guardar gastos.');
      setShowModal(true);
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(e => 
    e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        date: new Date(expense.date).toISOString().split('T')[0]
      });
    } else {
      setEditingExpense(null);
      setFormData({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) { notify.error('🚫 Demo: No puedes borrar gastos.'); return; }
    if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      notify.success('Gasto eliminado');
      fetchExpenses();
    } catch (error) {
      notify.error('Error al eliminar');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) { notify.error('🚫 Demo: Acción bloqueada.'); return; }
    const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date
    };

    try {
      if (editingExpense) {
        await api.patch(`/expenses/${editingExpense.id}`, payload);
        notify.success('Gasto actualizado');
      } else {
        await api.post('/expenses', payload);
        notify.success('Gasto registrado');
      }
      setShowModal(false);
      fetchExpenses();
    } catch (error) {
      console.error(error);
      notify.error('Error al guardar');
    }
  };

  return (
    <>
      {/* 1. CONTENEDOR PRINCIPAL (Con animación) */}
      <div className="p-6 space-y-6 animate-fade-in-up">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registro de Gastos</h1>
            <p className="text-slate-500 text-sm">Administra los egresos de la empresa</p>
          </div>
          <button 
              id="tour-expenses-create"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5"
          >
              <Plus size={18} /> Registrar Gasto
          </button>
        </div>

        {/* CONTENEDOR TABLA */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden">
          
          {/* BUSCADOR */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-sm transition-all"
                      placeholder="Buscar gasto por descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Registrado Por</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400">Cargando gastos...</td></tr>
                  ) : filteredExpenses.length === 0 ? (
                      <tr><td colSpan={5} className="p-10 text-center text-slate-400">No hay gastos registrados.</td></tr>
                  ) : (
                      filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-600">
                              <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-slate-400"/>
                                  {new Date(expense.date).toLocaleDateString('es-CL', { timeZone: 'UTC' })}
                              </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                              {expense.description || <span className="text-slate-400 italic">Sin descripción</span>}
                          </td>
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-500 text-xs">
                                  <User size={12}/> {expense.user?.fullName || 'Sistema'}
                              </div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-red-600">
                              - ${Number(expense.amount).toLocaleString('es-CL')}
                          </td>
                          <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                  <button 
                                      onClick={() => handleOpenModal(expense)}
                                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                      title="Editar"
                                  >
                                      <Edit size={18} />
                                  </button>
                                  <button 
                                      onClick={() => handleDelete(expense.id)}
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Eliminar"
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
      </div>

      {/* 2. MODAL (FUERA DE LA ANIMACIÓN) */}
      {/* Al estar aquí afuera, el 'fixed inset-0' tomará toda la pantalla correctamente */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
          {/* Fondo oscuro (Overlay) */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
          
          {/* Contenido del Modal */}
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-300 overflow-hidden z-10">
            
            {/* Header Modal */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl shadow-sm border border-red-200">
                  <DollarSign size={24} strokeWidth={2.5} />
                </div>
                {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-all focus:outline-none"
              >
                <X size={24}/>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Descripción del Gasto</label>
                      <input 
                          required 
                          className="input-modern w-full" 
                          placeholder="Ej: Pago de Internet"
                          value={formData.description} 
                          onChange={e => setFormData({...formData, description: e.target.value})} 
                          autoFocus
                      />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Monto</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                            <input 
                                type="number" 
                                required 
                                min="0"
                                className="input-modern w-full pl-8 no-spinner" 
                                placeholder="0"
                                value={formData.amount} 
                                onChange={e => setFormData({...formData, amount: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Fecha</label>
                        <input 
                            type="date" 
                            required 
                            className="input-modern w-full"
                            value={formData.date} 
                            onChange={e => setFormData({...formData, date: e.target.value})} 
                        />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-100">
                      <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors">
                          Cancelar
                      </button>
                      <button type="submit" className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-bold shadow-lg shadow-red-600/30 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                          <DollarSign size={18} />
                          {editingExpense ? 'Guardar Cambios' : 'Registrar Gasto'}
                      </button>
                  </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};