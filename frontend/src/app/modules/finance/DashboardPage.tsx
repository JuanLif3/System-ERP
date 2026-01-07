import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { api } from '../../config/api';

// --- Tipos de Datos (Interfaces) ---
// Deben coincidir con lo que envía tu Backend NestJS
interface DashboardData {
  cards: {
    totalRevenue: number;
    totalSales: number;
    averageTicket: number;
    todaySales: number;
  };
  charts: {
    topProducts: { name: string; value: string }[];
    categoriesSales: { name: string; value: string }[];
  };
}

// --- Utilidad para Formatear Dinero (CLP) ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};

// --- Colores para los gráficos ---
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/finance/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return <div>No hay datos disponibles</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Resumen Financiero</h1>
        <span className="text-sm text-gray-500">Última actualización: Hoy</span>
      </div>

      {/* --- SECCIÓN 1: KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingresos Totales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(data.cards.totalRevenue)}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Card 2: Ventas Totales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
            <p className="text-2xl font-bold text-slate-800">{data.cards.totalSales}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Card 3: Ticket Promedio */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(data.cards.averageTicket)}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <CreditCard size={24} />
          </div>
        </div>

        {/* Card 4: Ventas de Hoy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Ventas de Hoy</p>
            <p className="text-2xl font-bold text-slate-800">{data.cards.todaySales}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 2: GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Top Productos (Barras) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-400"/>
            Top 5 Productos Más Vendidos
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip 
                  formatter={(value) => [`${value} Unidades`, 'Ventas']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Categorías (Circular) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Ventas por Categoría</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.categoriesSales}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.charts.categoriesSales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};