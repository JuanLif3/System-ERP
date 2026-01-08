import { useState } from 'react';
import { Building2, Save, User } from 'lucide-react';
import { api } from '../../config/api';
import { useNotification } from '../../context/NotificationContext'; // <--- IMPORTADO

export const SaasDashboard = () => {
  const notify = useNotification(); // <--- HOOK
  const [form, setForm] = useState({
    companyName: '', 
    companyRUT: '',
    companyPhone: '', 
    ownerFullName: '', 
    ownerEmail: '', 
    ownerPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!window.confirm('¿Crear nueva Pyme?')) return;

    try {
      await api.post('/companies/saas/create', form);
      notify.success('Pyme y Usuario Admin creados exitosamente'); // <--- ÉXITO
      
      setForm({ 
          companyName: '', companyRUT: '', companyPhone: '',
          ownerFullName: '', ownerEmail: '', ownerPassword: '' 
      });
    } catch (error) {
      console.error(error);
      notify.error('Error al crear Pyme. Verifica si el correo o RUT ya existen.'); // <--- ERROR
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Panel Super Admin (SaaS)</h1>
        <p className="text-slate-500">Crea nuevas instancias para tus clientes.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-600">
          <Building2 /> Registrar Nueva Pyme
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Fantasía</label>
              <input required className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ej: Pizzería Juan"
                value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RUT / Identificador</label>
              <input required className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="77.123.456-K"
                value={form.companyRUT} onChange={e => setForm({...form, companyRUT: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono Empresa</label>
              <input required className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+569 1234 5678"
                value={form.companyPhone} onChange={e => setForm({...form, companyPhone: e.target.value})} />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Datos Dueño */}
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
            <User size={20} /> Datos del Administrador (Cliente)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input required className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Juan Pérez"
                value={form.ownerFullName} onChange={e => setForm({...form, ownerFullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <input required type="email" className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="juan@pizzeria.cl"
                value={form.ownerEmail} onChange={e => setForm({...form, ownerEmail: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Inicial</label>
              <input required type="password" minLength={6} className="w-full border p-2 rounded bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="******"
                value={form.ownerPassword} onChange={e => setForm({...form, ownerPassword: e.target.value})} />
              <p className="text-xs text-gray-400 mt-1">El cliente podrá cambiarla después.</p>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all shadow-md">
            <Save size={20} /> Crear Pyme y Usuario Admin
          </button>
        </form>
      </div>
    </div>
  );
};