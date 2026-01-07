import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { api } from '../../../config/api';

interface Category {
  id: string;
  name: string;
  description: string;
}

export const CategoriesTab = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/categories', { name: newName, description: newDesc });
      setNewName('');
      setNewDesc('');
      fetchCategories(); // Recargar lista
    } catch (error) {
      alert('Error al crear categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Creación Rápida */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Plus size={16} /> Nueva Categoría
        </h3>
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="Ej: Lácteos"
            />
          </div>
          <div className="flex-[2]">
            <label className="text-xs text-gray-500 mb-1 block">Descripción (Opcional)</label>
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="Descripción breve..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newName}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Agregar'}
          </button>
        </form>
      </div>

      {/* Lista de Categorías */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Descripción</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={3} className="p-4 text-center">Cargando...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-400">No hay categorías registradas</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                        <Tag size={14}/>
                    </div>
                    {cat.name}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{cat.description || '-'}</td>
                  <td className="px-6 py-3 text-right">
                    <button className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};