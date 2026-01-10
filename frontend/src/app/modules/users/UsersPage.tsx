import { useEffect, useState } from 'react';
import { User, Mail, Shield, Plus, Edit, Search, Power, X, CheckCircle, Lock } from 'lucide-react';
import { api } from '../../config/api';
import { useNotification } from '../../context/NotificationContext';
import clsx from 'clsx';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  roles: string;
  isActive: boolean;
}

export const UsersPage = () => {
  const notify = useNotification();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados del Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    roles: 'admin' // Valor por defecto
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error(error);
      notify.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeTab === 'active' ? u.isActive : !u.isActive;
    return matchesSearch && matchesStatus;
  });

  // --- ACCIONES ---
  const handleOpenModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        fullName: user.fullName, 
        email: user.email, 
        password: '', // Password vacío al editar (opcional cambiarlo)
        roles: user.roles 
      });
    } else {
      setEditingUser(null);
      setFormData({ fullName: '', email: '', password: '', roles: 'employee' });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Limpiamos datos vacíos (como password en edición)
      const payload: any = { ...formData };
      if (editingUser && !payload.password) delete payload.password;

      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, payload);
        notify.success('Usuario actualizado correctamente');
      } else {
        await api.post('/users', payload);
        notify.success('Usuario creado correctamente');
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error(error);
      notify.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const toggleStatus = async (user: UserData) => {
    const action = user.isActive ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Estás seguro de ${action} a ${user.fullName}?`)) return;

    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      notify.success(`Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`);
      fetchUsers();
    } catch (error) {
      notify.error('No se pudo cambiar el estado');
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      
      {/* HEADER Y PESTAÑAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500 text-sm">Control de acceso y personal</p>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('active')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === 'active' 
                ? "bg-white text-indigo-600 shadow-sm text-indigo-600" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <CheckCircle size={16} /> Activos
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              activeTab === 'inactive' 
                ? "bg-white text-red-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Power size={16} /> Inactivos
          </button>
        </div>

        <button 
            id="tour-users-create"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
        >
            <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      {/* CONTENEDOR DE TABLA */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden">
        
        {/* BUSCADOR */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all"
                    placeholder="Buscar por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* TABLA */}
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Cargando...</td></tr>
            ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400">No se encontraron usuarios en esta sección.</td></tr>
            ) : (
                filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ${user.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className={`font-bold ${user.isActive ? 'text-slate-800' : 'text-slate-500'}`}>{user.fullName}</p>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                    <Mail size={12}/> {user.email}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200 uppercase">
                            <Shield size={12}/>
                            {user.roles}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleOpenModal(user)}
                                title="Editar usuario"
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => toggleStatus(user)}
                                title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                                className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            >
                                <Power size={18} />
                            </button>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                        {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                        <input required className="input-modern" 
                            value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                        <input type="email" required className="input-modern" 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contraseña {editingUser && <span className="text-slate-400 font-normal text-xs">(Dejar en blanco para mantener actual)</span>}
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input 
                                type="password" 
                                className="input-modern pl-10"
                                required={!editingUser} 
                                minLength={6}
                                placeholder={editingUser ? "••••••••" : "Mínimo 6 caracteres"}
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Permisos</label>
                        <select className="input-modern bg-white"
                            value={formData.roles} onChange={e => setFormData({...formData, roles: e.target.value})}
                        >
                            <option value="admin">Administrador (Acceso Total)</option>
                            <option value="manager">Gerente (Inventario + Finanzas)</option>
                            <option value="seller">Vendedor (Ventas + Inventario)</option>
                            <option value="employee">Empleado (Solo Ventas)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5">
                            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};