import { useEffect, useState } from 'react';
import { UserPlus, User as UserIcon, Mail, Shield } from 'lucide-react';
import { api } from '../../config/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string;
  isActive: boolean;
}

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    roles: 'SELLER' // Valor por defecto
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', roles: 'SELLER' });
      fetchUsers();
      alert('Usuario creado correctamente');
    } catch (error) {
      alert('Error al crear usuario. Verifica que el correo no esté duplicado.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipo de Trabajo</h1>
          <p className="text-gray-500 text-sm">Gestiona los accesos a tu ERP</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className={`p-3 rounded-full ${user.roles === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              <UserIcon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{user.fullName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Mail size={14} /> {user.email}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium mt-3">
                <span className={`px-2 py-1 rounded bg-slate-100 text-slate-600 flex items-center gap-1`}>
                  <Shield size={12} /> {user.roles}
                </span>
                <span className={`px-2 py-1 rounded ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Nuevo Miembro</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input required className="w-full border rounded-lg p-2 text-sm" 
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" required className="w-full border rounded-lg p-2 text-sm" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Temporal</label>
                <input type="password" required className="w-full border rounded-lg p-2 text-sm" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select className="w-full border rounded-lg p-2 text-sm bg-white"
                  value={formData.roles} onChange={e => setFormData({...formData, roles: e.target.value})}
                >
                  <option value="SELLER">Vendedor (Solo Ventas)</option>
                  <option value="MANAGER">Gerente (Solo Finanzas)</option>
                  <option value="ADMIN">Administrador (Todo)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};