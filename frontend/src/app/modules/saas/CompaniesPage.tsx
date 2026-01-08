import { useEffect, useState } from 'react';
import { Building2, Phone, Power, Search, AlertTriangle } from 'lucide-react';
import { api } from '../../config/api';

interface Company {
  id: string;
  name: string;
  rut: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const toggleStatus = async (company: Company) => {
    const action = company.isActive ? 'suspender' : 'activar';
    if(!window.confirm(`¿Estás seguro de ${action} a ${company.name}? Sus usuarios no podrán ingresar.`)) return;

    try {
        // Actualización optimista
        setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, isActive: !c.isActive } : c));
        await api.patch(`/companies/${company.id}/status`);
    } catch (error) {
        alert('Error al cambiar estado');
        fetchCompanies(); // Revertir
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de Pymes</h1>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Total Registradas: {companies.length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4">RUT</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
                <tr><td colSpan={5} className="p-6 text-center">Cargando empresas...</td></tr>
            ) : (
                companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${company.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                                <Building2 size={20}/>
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{company.name}</p>
                                <p className="text-xs text-gray-500">{company.email}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                        {company.rut}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={14}/>
                            <span>{company.phone || 'Sin teléfono'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                            company.isActive 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                            {company.isActive ? 'ACTIVA' : 'SUSPENDIDA'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button 
                            onClick={() => toggleStatus(company)}
                            title={company.isActive ? "Suspender Servicio" : "Reactivar Servicio"}
                            className={`p-2 rounded-full transition-colors ${
                                company.isActive 
                                ? 'text-gray-400 hover:bg-red-50 hover:text-red-600' 
                                : 'text-green-500 hover:bg-green-50'
                            }`}
                        >
                            <Power size={20} />
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