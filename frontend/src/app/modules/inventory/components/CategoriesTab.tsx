import { useEffect, useState } from 'react';
import { Tag, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../../../config/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../auth/context/AuthContext'; // 👈 Importamos Auth

interface Category {
  id: string;
  name: string;
  description: string;
}

export const CategoriesTab = () => {
  const notify = useNotification();
  const { user } = useAuth(); // 👈 Obtenemos usuario
  const isDemo = user?.email === 'demo@nortedev.cl'; // 👈 Flag Demo

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
      notify.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    // 🔒 Aviso
    if (isDemo) notify.info('🎓 Modo Demo: Puedes ver el formulario, pero no guardar.');
    setEditingCategory(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    // 🔒 Aviso
    if (isDemo) notify.info('🎓 Modo Demo: Edición simulada (No se guardará).');
    setEditingCategory(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔒 Bloqueo Guardado
    if (isDemo) {
        notify.error('🚫 Demo: No puedes guardar cambios en categorías.');
        return;
    }

    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, form);
        notify.success('Categoría actualizada correctamente');
      } else {
        await api.post('/categories', form);
        notify.success('Categoría creada correctamente');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      notify.error('Error al guardar la categoría');
    }
  };

  const handleDelete = async (id: string) => {
    // 🔒 Bloqueo Borrado
    if (isDemo) {
        notify.error('🚫 Demo: No puedes eliminar categorías.');
        return;
    }

    if (!window.confirm('¿Eliminar esta categoría? Si tiene productos, no se podrá eliminar.')) return;
    try {
      await api.delete(`/categories/${id}`);
      notify.success('Categoría eliminada');
      fetchCategories();
    } catch (error) {
      console.error(error);
      notify.error('No se pudo eliminar. Verifique que no tenga productos asociados.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
         <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5">
           <Plus size={20} /> Nueva Categoría
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
            <p className="text-gray-500">Cargando categorías...</p>
        ) : categories.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Tag size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800">{c.name}</h4>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16}/></button>
                    </div>
                </div>
                <p className="text-sm text-gray-500 ml-11">{c.description || 'Sin descripción'}</p>
            </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">{editingCategory ? 'Editar' : 'Nueva'} Categoría</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                
                {/* 🔒 Aviso Visual Demo en Modal */}
                {isDemo && (
                    <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 text-blue-700 text-xs flex items-center gap-2">
                        <AlertCircle size={16}/> <b>Modo Demo:</b> Acciones de guardado deshabilitadas.
                    </div>
                )}

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input required className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-24" 
                            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};