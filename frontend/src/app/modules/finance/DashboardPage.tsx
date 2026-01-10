import { useEffect, useState } from 'react';
import { 
  DollarSign, ShoppingBag, CreditCard, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Calendar, RefreshCcw, 
  AlertTriangle, Clock, AlertOctagon,
  Check,
  Bell,
  X,
  PlayCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../../config/api';
import clsx from 'clsx';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../modules/auth/context/AuthContext';

interface DeletionRequest {
  id: string;
  reason: string;
  createdAt: string;
  order: { id: string; total: number };
  requestedBy: { fullName: string };
}
interface DashboardCardData {
  totalRevenue: number;
  totalSales: number;
  averageTicket: number;
  todaySales: number;
  revenueTrend: number;
}
interface ChartData {
  name: string;
  value: number;
  revenue: number;
}
interface ProductAlert {
  id: string;
  name: string;
  stock?: number;
  expiryDate?: string;
  sku: string;
}
interface DashboardData {
  cards: DashboardCardData;
  charts: {
    topProducts: ChartData[];
    categoriesSales: ChartData[];
    salesHistory?: { date: string; total: number }[];
  };
  alerts: {
    lowStock: ProductAlert[];
    expiring: ProductAlert[];
  }
}
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const DashboardPage = () => {
  // 1. Traemos al usuario (necesario si quisiéramos validar algo extra, aunque DemoTour lo maneja)
  const { user } = useAuth();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d'); 
  const [requests, setRequests] = useState<DeletionRequest[]>([]); // Estado para solicitudes
  const notify = useNotification();
  const startDemoTour = () => {
    // Despachamos el evento que escucha DemoTour.tsx
    window.dispatchEvent(new Event('start-demo-tour'));
  };

  // Función para cargar solicitudes
  const fetchRequests = async () => {
    try {
        const { data } = await api.get('/orders/requests/pending');
        setRequests(data);
    } catch (error) { console.error("Error cargando solicitudes", error); }
  }

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/finance/dashboard?range=${timeRange}&t=${new Date().getTime()}`);
      setData(data);
    } catch (err: any) {
      console.error("Error cargando dashboard:", err);
      setError("No se pudieron cargar las métricas. Intenta recargar.");
    } finally {
      setLoading(false);
    }
  };

  // Modificar el useEffect principal para cargar también las solicitudes
  useEffect(() => {
    fetchDashboardData();
    fetchRequests(); 
  }, [timeRange]);

  // Función para resolver (Aceptar/Rechazar)
  const handleResolve = async (id: string, action: 'APPROVE' | 'REJECT') => {
      if (!window.confirm(`¿Confirmar ${action === 'APPROVE' ? 'eliminación' : 'rechazo'}?`)) return;
      try {
          await api.patch(`/orders/requests/${id}/resolve`, { action });
          notify.success(action === 'APPROVE' ? 'Venta eliminada' : 'Solicitud rechazada');
          fetchRequests(); // Recargar lista
          fetchDashboardData(); // Recargar gráficas (si se borró una venta)
      } catch (error) {
          notify.error('Error al procesar solicitud');
      }
  }

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-indigo-600 font-medium animate-pulse">Cargando métricas...</p>
      </div>
    </div>
  );

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
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 animate-fade-in-up pb-10">
      
      {/* --- BOTÓN DE DEMO (SOLO VISIBLE PARA USUARIO DEMO) --- */}
      {user?.email === 'demo@nexus.cl' && (
        <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <button 
            onClick={startDemoTour}
            className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl px-6 py-4 flex items-center justify-center gap-3 text-white font-bold text-lg md:text-xl group"
          >
            <div className="bg-white text-indigo-600 rounded-full p-2 group-hover:scale-110 transition-transform shadow-lg">
              <PlayCircle size={24} fill="currentColor" className="text-white fill-indigo-600"/>
            </div>
            <span>¿No sabes por dónde empezar? <span className="underline decoration-2 underline-offset-4 decoration-yellow-400">Haz clic aquí para iniciar el Tutorial Interactivo</span> 🚀</span>
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Resumen Financiero</h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Panorama general de tu negocio hoy.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-sm font-medium text-slate-600 w-full md:w-auto justify-center md:justify-start">
          <Calendar size={16} className="text-indigo-500"/>
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* SOLICITUDES PENDIENTES */}
      {requests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden animate-in slide-in-from-top-4">
              <div className="bg-red-50/50 p-4 border-b border-red-100 flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 text-red-600 rounded-lg animate-pulse"><Bell size={18}/></div>
                  <h3 className="font-bold text-red-900 text-sm md:text-base">Solicitudes Pendientes ({requests.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                  {requests.map(req => (
                      <div key={req.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                              <p className="text-sm text-slate-800 font-medium">
                                  <span className="font-bold text-indigo-600">{req.requestedBy.fullName}</span> solicita borrar venta <span className="font-mono bg-slate-100 px-1 rounded">#{req.order.id.slice(-6)}</span>
                              </p>
                              <p className="text-xs text-slate-500 mt-1 italic">"{req.reason}"</p>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              <button 
                                onClick={() => handleResolve(req.id, 'REJECT')}
                                className="flex-1 sm:flex-none justify-center flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-medium"
                              >
                                  <X size={14}/> Rechazar
                              </button>
                              <button 
                                onClick={() => handleResolve(req.id, 'APPROVE')}
                                className="flex-1 sm:flex-none justify-center flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium shadow-md shadow-red-600/20"
                              >
                                  <Check size={14}/> Aprobar
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* TARJETAS KPI (Grid Responsivo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div id="tour-kpi-revenue">
          <KPICard title="Ingresos Totales" value={formatMoney(data.cards.totalRevenue)} icon={DollarSign} trend={data.cards.revenueTrend} color="indigo" />
        </div>
        <div id="tour-kpi-total-sales">
          <KPICard title="Ventas Totales" value={data.cards.totalSales.toString()} icon={ShoppingBag} trend="Historico" color="blue" />
        </div>
        <div id="tour-kpi-ticket">
          <KPICard title="Ticket Promedio" value={formatMoney(data.cards.averageTicket)} icon={CreditCard} trend="Promedio" color="emerald" />
        </div>
        <div id="tour-kpi-today">
          <KPICard title="Ventas Hoy" value={data.cards.todaySales.toString()} icon={TrendingUp} trend="Hoy" color="violet" />
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Gráfico Historial */}
        <div id="tour-chart-history" className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-soft relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="font-bold text-lg text-slate-800">Tendencia de Ingresos</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                {[ { label: '7D', value: '7d' }, { label: '30D', value: '30d' }, { label: '3M', value: '3m' }, { label: '1A', value: '1y' } ].map((opt) => (
                    <button key={opt.value} onClick={() => setTimeRange(opt.value)} className={clsx("flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap", timeRange === opt.value ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                        {opt.label}
                    </button>
                ))}
            </div>
          </div>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.salesHistory || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} tickFormatter={(value) => `$${value/1000}k`} width={35}/>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} formatter={(value: number | undefined) => [value !== undefined ? formatMoney(value) : '$0', 'Ingresos']} />
                <Area type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Categorías */}
        <div id="tour-chart-categories" className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col h-[400px] lg:h-auto">
          <h3 className="font-bold text-lg text-slate-800 mb-2">Categorías</h3>
          <div className="flex-1 min-h-[250px]">
            {data.charts.categoriesSales.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin datos</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data.charts.categoriesSales as any} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                            {data.charts.categoriesSales.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '11px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* LISTAS INFERIORES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Top Productos */}
        <div id="tour-list-top" className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col max-h-[400px]">
            <h3 className="font-bold text-lg text-slate-800 mb-4 sticky top-0 bg-white z-10">Top Productos</h3>
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {data.charts.topProducts.map((product: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 md:gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>#{index + 1}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{product.name}</p>
                            <p className="text-xs text-slate-400">{product.value} uds.</p>
                        </div>
                        <div className="text-right font-bold text-slate-800 text-sm">{formatMoney(product.revenue)}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Alerta Stock */}
        <div id="tour-list-low-stock" className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col max-h-[400px]">
            <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white z-10 pb-2">
                <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertOctagon size={20}/></div>
                <h3 className="font-bold text-lg text-slate-800">Stock Bajo</h3>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {data.alerts.lowStock.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">Todo OK ✅</p>
                ) : (
                    data.alerts.lowStock.map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100">
                            <div className="min-w-0 flex-1 pr-2">
                                <p className="font-medium text-slate-800 text-sm truncate">{p.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">{p.sku}</p>
                            </div>
                            <span className="shrink-0 px-2 py-1 bg-white text-red-600 font-bold text-xs rounded-md shadow-sm border border-red-100">
                                {p.stock} un.
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Alerta Vencimiento */}
        <div id="tour-list-expiring" className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col max-h-[400px]">
            <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white z-10 pb-2">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Clock size={20}/></div>
                <h3 className="font-bold text-lg text-slate-800">Vencen Pronto</h3>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {data.alerts.expiring.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">Nada por vencer</p>
                ) : (
                    data.alerts.expiring.map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-orange-50/50 rounded-xl border border-orange-100">
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="font-medium text-slate-800 text-sm truncate">{p.name}</p>
                                <p className="text-[10px] text-slate-500">Vence: {new Date(p.expiryDate!).toLocaleDateString('es-CL')}</p>
                            </div>
                            <AlertTriangle size={16} className="text-orange-500 shrink-0"/>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// ... (Componentes auxiliares KPICard, Tooltip y formatMoney se mantienen igual) ...
const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-sm">
          <p className="font-bold text-slate-800 mb-1">{data.name}</p>
          <div className="space-y-1">
            <p className="text-slate-500 flex justify-between gap-4">
                <span>Unidades:</span> <span className="font-medium text-slate-700">{data.value}</span>
            </p>
            <p className="text-slate-500 flex justify-between gap-4">
                <span>Generado:</span> <span className="font-medium text-emerald-600">{formatMoney(data.revenue)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
};

const KPICard = ({ title, value, icon: Icon, trend, color, isPercentage }: any) => {
  const colorClasses: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  // Lógica para detectar si el trend es número (del backend) o texto estático
  let trendValue = trend;
  let isPositive = true;
  let isNeutral = false;

  if (typeof trend === 'number') {
      isPositive = trend >= 0;
      isNeutral = trend === 0;
      trendValue = `${isPositive ? '+' : ''}${trend}%`;
  } else {
      // Para los casos estáticos como "Historico" o "Promedio"
      isNeutral = true;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        
        {/* BADGE DE TENDENCIA DINÁMICO */}
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full 
            ${isNeutral ? 'bg-slate-50 text-slate-500' : 
              isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
          
          {!isNeutral && (isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
          {trendValue}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};