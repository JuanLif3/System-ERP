import { useEffect, useState, useCallback } from 'react'; // Agregamos useCallback
import { DollarSign, ShoppingBag, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { api } from '../../config/api';
import clsx from 'clsx'; 

interface DashboardData {
  cards: {
    totalRevenue: number;
    totalSales: number;
    averageTicket: number;
    todaySales: number;
  };
  charts: {
    topProducts: { name: string; value: number; revenue: number }[];
    categoriesSales: { name: string; value: number }[];
    salesHistory: { date: string; total: number }[]; // Nuevo
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [historyData, setHistoryData] = useState<{ date: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Nuevo Estado para el Rango
  const [range, setRange] = useState<'7d' | '30d' | '3m' | '1y'>('7d');
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 1. Carga inicial del Dashboard (Tarjetas y otros gráficos)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/finance/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // 2. Carga del Historial (Se ejecuta al cambiar 'range')
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get(`/finance/history?range=${range}`);
      setHistoryData(response.data);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [range]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <div className="p-10 text-center">Cargando métricas...</div>;
  if (!data) return <div>No hay datos disponibles</div>;

  // Renderizador personalizado para el Tooltip de Top Productos (Punto 3)
  const CustomTooltipTopProducts = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const unitData = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          <p className="text-blue-600">Ventas: <span className="font-bold">{unitData.value} un.</span></p>
          <p className="text-green-600">Ganancia: <span className="font-bold">{formatCurrency(unitData.revenue)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header y Hora */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Resumen Financiero</h1>
        <span className="text-sm text-gray-500">Hora Chile: {new Date().toLocaleTimeString('es-CL')}</span>
      </div>

      {/* --- SECCIÓN 1: KPI CARDS (Sin cambios) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ... Copia tus tarjetas aquí tal cual las tenías ... */}
          {/* Ingresos Totales */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(data.cards.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><DollarSign size={24} /></div>
          </div>
          {/* Ventas Hoy */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ventas de Hoy</p>
              <p className="text-2xl font-bold text-slate-800">{data.cards.todaySales}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><Calendar size={24} /></div>
          </div>
          {/* Ventas Totales */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
              <p className="text-2xl font-bold text-slate-800">{data.cards.totalSales}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><ShoppingBag size={24} /></div>
          </div>
          {/* Ticket Promedio */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(data.cards.averageTicket)}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><CreditCard size={24} /></div>
          </div>
      </div>

      {/* --- SECCIÓN 2: GRÁFICO DE LÍNEA INTERACTIVO --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500"/>
            Tendencia de Ingresos
          </h3>
          
          {/* SELECTOR DE RANGO */}
          <div className="bg-slate-100 p-1 rounded-lg flex text-sm">
            {[
              { id: '7d', label: '7 Días' },
              { id: '30d', label: '30 Días' },
              { id: '3m', label: '3 Meses' },
              { id: '1y', label: '1 Año' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setRange(option.id as any)}
                className={clsx(
                  "px-3 py-1.5 rounded-md transition-all font-medium",
                  range === option.id 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico con estado de carga */}
        <div className="h-64 w-full relative">
          {loadingHistory && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#64748b" />
              <YAxis tick={{fontSize: 12}} stroke="#64748b" tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                formatter={(value: number | undefined) => [value !== undefined ? formatCurrency(value) : 'N/A', 'Ingresos']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#2563EB" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }} 
                activeDot={{ r: 6 }} 
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- SECCIÓN 3: GRÁFICOS INFERIORES (Top y Categorías) --- */}
      {/* ... Mantén tus otros gráficos igual que antes ... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            {/* ... Gráfico de Barras ... */}
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 5 Productos Más Vendidos</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.topProducts} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    {/* Asegúrate de pasar CustomTooltipTopProducts definido antes del return */}
                    {/* <Tooltip content={<CustomTooltipTopProducts />} /> */} 
                    <Tooltip 
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                            const unitData = payload[0].payload;
                            return (
                                <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
                                <p className="font-bold text-slate-800 mb-1">{label}</p>
                                <p className="text-blue-600">Ventas: <span className="font-bold">{unitData.value} un.</span></p>
                                <p className="text-green-600">Ganancia: <span className="font-bold">{formatCurrency(unitData.revenue)}</span></p>
                                </div>
                            );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             {/* ... Gráfico Circular ... */}
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