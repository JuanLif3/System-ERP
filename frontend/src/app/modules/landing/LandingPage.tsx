import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Box, 
  CheckCircle2, 
  CreditCard, 
  LayoutDashboard, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <Box size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Nexus ERP</span>
            </div>
            <button 
              onClick={handleLogin}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (La venta principal) --- */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-6">
            <Zap size={14} /> Nuevo: Facturación Simplificada
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            El Sistema Operativo para tu <span className="text-indigo-600">Pyme</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Controla tu inventario, gestiona ventas y visualiza tus ganancias en tiempo real. 
            Sin complicaciones, sin instalaciones complejas. Todo en la nube.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleLogin}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-1 flex items-center gap-2"
            >
              PRUÉBALO YA <ArrowRight size={20} />
            </button>
            <p className="text-sm text-slate-500 mt-2 sm:mt-0">
              * No requiere tarjeta de crédito para ver la demo.
            </p>
          </div>
        </div>
      </section>

      {/* --- FEATURES (Ventajas) --- */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Todo lo que necesitas para crecer</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Dejamos lo complicado fuera. Nexus ERP está diseñado para que lo uses desde el primer día.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Box size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Inventario Inteligente</h3>
              <p className="text-slate-600 leading-relaxed">
                Control total de stock. Alertas de bajo stock, categorías, y soporte para imágenes. Nunca más pierdas una venta por falta de producto.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Panel de Control</h3>
              <p className="text-slate-600 leading-relaxed">
                Visualiza tus ventas diarias, mensuales y anuales con gráficos claros. Toma decisiones basadas en datos reales, no en intuición.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Reportes PDF</h3>
              <p className="text-slate-600 leading-relaxed">
                Genera reportes de ventas e inventario listos para imprimir o enviar por correo con un solo clic. Ideal para tu contabilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING (Cuánto cuesta) --- */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Un precio simple, todo incluido</h2>
          <p className="text-slate-400 mb-12">Sin costos ocultos ni comisiones por venta.</p>

          <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-12 max-w-md mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              MÁS POPULAR
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Plan Pyme Pro</h3>
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-5xl font-extrabold tracking-tight">$25.000</span>
              <span className="text-slate-500 font-medium">/mes</span>
            </div>

            <ul className="space-y-4 mb-8 text-left">
              {[
                'Usuarios ilimitados',
                'Productos ilimitados',
                'Soporte prioritario por WhatsApp',
                'Actualizaciones semanales',
                'Backups diarios automáticos'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-indigo-600 shrink-0" size={20} />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleLogin}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30"
            >
              Comenzar Ahora
            </button>
            <p className="text-xs text-slate-400 mt-4">Garantía de devolución de 7 días.</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Box size={20} className="text-indigo-600" /> Nexus ERP
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} NorteDev Solutions. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-slate-400">
             <ShieldCheck size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
             <CreditCard size={20} className="hover:text-indigo-600 cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};