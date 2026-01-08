import { useEffect, useState } from 'react';
import { 
  DollarSign, ShoppingBag, CreditCard, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Calendar, RefreshCcw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { api } from '../../config/api';

// --- INTERFACES ---
interface DashboardCardData {
  totalRevenue: number;
  totalSales: number;
  averageTicket: number;
  todaySales: number;
}

interface ChartData {
  name: string;
  value: number;
  revenue: number;
}

interface SalesHistoryData {
  date: string;
  total: number;
}

interface DashboardData {
  cards: DashboardCardData;
  charts: {
    topProducts: ChartData[];
    categoriesSales: ChartData[];
    salesHistory?: SalesHistoryData[]; // Opcional por si el backend no lo envía
  };
}

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Agregamos un timestamp para evitar caché del navegador
      const { data } = await api.get(`/finance/dashboard?t=${new Date().getTime()}`);
      setData(data);
    } catch (err: any) {
      console.error("Error cargando dashboard:", err);
      setError("No se pudieron cargar las métricas. Intenta recargar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- ESTADO DE CARGA ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-indigo-600 font-medium animate-pulse">Cargando métricas en tiempo real...</p>
      </div>
    </div>
  );

  // --- ESTADO DE ERROR ---
  if (error) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={fetchDashboardData} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        <RefreshCcw size={18} /> Reintentar
      </button>
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Resumen Financiero</h2>
          <p className="text-slate-500 mt-1">Panorama general de tu negocio hoy.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-sm font-medium text-slate-600">
          <Calendar size={16} className="text-indigo-500"/>
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Ingresos Totales" 
          value={formatMoney(data.cards.totalRevenue)} 
          icon={DollarSign} 
          trend="+0%" 
          color="indigo"
        />
        <KPICard 
          title="Ventas Totales" 
          value={data.cards.totalSales.toString()} 
          icon={ShoppingBag} 
          trend="Historico" 
          color="blue"
        />
        <KPICard 
          title="Ticket Promedio" 
          value={formatMoney(data.cards.averageTicket)} 
          icon={CreditCard} 
          trend="Promedio" 
          color="emerald"
        />
        <KPICard 
          title="Ventas Hoy" 
          value={data.cards.todaySales.toString()} 
          icon={TrendingUp} 
          trend="Hoy" 
          color="violet"
        />
      </div>

      {/* GRÁFICOS PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICO DE HISTORIAL */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Tendencia de Ingresos</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.salesHistory || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                  formatter={(value: number | undefined) => [formatMoney(value || 0), 'Ingresos']}
                />
                <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP PRODUCTOS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Top Productos</h3>
          <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            {data.charts.topProducts.length === 0 ? (
                <p className="text-slate-400 text-sm text-center mt-10">No hay ventas registradas aún.</p>
            ) : (
                data.charts.topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-4 group cursor-default">
                    <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        index === 1 ? 'bg-slate-100 text-slate-700' : 
                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}
                    `}>
                    #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 font-medium">{product.value} u.</span>
                    </div>
                    </div>
                    <div className="text-right">
                    <p className="font-bold text-slate-800 text-sm">{formatMoney(product.revenue)}</p>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Auxiliar para Tarjetas KPI
const KPICard = ({ title, value, icon: Icon, trend, color, trendNegative }: any) => {
  const colorClasses: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendNegative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {trendNegative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};