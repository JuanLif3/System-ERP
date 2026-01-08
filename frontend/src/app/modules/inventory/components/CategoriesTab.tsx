import { useEffect, useState } from 'react';
import { Tags, Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '../../../config/api';
import { useNotification } from '../../../context/NotificationContext'; // <--- IMPORTADO

interface Category {
  id: string;
  name: string;
  description: string;
}

export const CategoriesTab = () => {
  const notify = useNotification(); // <--- HOOK
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
    setEditingCategory(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, description: cat.description });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, form);
        notify.success('Categoría actualizada correctamente'); // <--- ÉXITO
      } else {
        await api.post('/categories', form);
        notify.success('Categoría creada correctamente'); // <--- ÉXITO
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      notify.error('Error al guardar la categoría'); // <--- ERROR
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría? Si tiene productos, no se podrá eliminar.')) return;
    try {
      await api.delete(`/categories/${id}`);
      notify.success('Categoría eliminada'); // <--- ÉXITO
      fetchCategories();
    } catch (error) {
      console.error(error);
      notify.error('No se pudo eliminar. Verifique que no tenga productos asociados.'); // <--- ERROR
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
         <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
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
                            <Tags size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800">{c.name}</h4>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16}/></button>
                    </div>
                </div>
                <p className="text-sm text-gray-500 ml-11">{c.description || 'Sin descripción'}</p>
            </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">{editingCategory ? 'Editar' : 'Nueva'} Categoría</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input required className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary/20" 
                            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24" 
                            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};