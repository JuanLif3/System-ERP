import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Box, 
  CheckCircle2, 
  Zap,
  ShoppingCart,
  Star,
  X,
  Send,
  User,
  Mail,
  MessageSquare,
  Code,
  Lock,
  ShieldCheck,
  EyeOff,
  GraduationCap, // 👈 Nuevo icono para estudios
  Award,         // 👈 Nuevo icono para certificados
  BookOpen       // 👈 Nuevo icono para estudios en curso
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Datos del formulario
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleLogin = () => navigate('/login');
  const openContact = () => setIsContactOpen(true);
  const closeContact = () => setIsContactOpen(false);

  // --- LÓGICA DE ENVÍO DE CORREO (MAILTO) ---
  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Creamos un link "mailto" con los datos del formulario
    const subject = `Consulta Nexus ERP de ${contactForm.name}`;
    const body = `Nombre: ${contactForm.name}%0D%0ACorreo: ${contactForm.email}%0D%0A%0D%0AMensaje:%0D%0A${contactForm.message}`;
    
    // Esto abrirá el Gmail o Outlook del usuario listo para enviar
    window.location.href = `mailto:contacto@nortedev.cl?subject=${subject}&body=${body}`;
    
    setIsContactOpen(false);
    alert('Se abrirá tu gestor de correo para enviar el mensaje. ¡Gracias!');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden relative">
      
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
            <div className="flex items-center gap-4">
                <button 
                  onClick={handleLogin}
                  className="hidden md:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Acceso Clientes
                </button>
                <button 
                  onClick={openContact}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  Contacto
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-indigo-50/50 to-white relative">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-6">
            <Zap size={14} /> Oferta Limitada: Nuevos Cupos Disponibles
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            El Sistema Operativo para tu <span className="text-indigo-600">Pyme</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Controla tu inventario, gestiona ventas y visualiza tus ganancias en tiempo real. 
            <b>Seguridad, privacidad y respaldo garantizado.</b>
          </p>

          {/* --- TARJETA DE CREDENCIALES DEMO --- */}
          <div className="max-w-md mx-auto bg-white border border-indigo-100 shadow-lg rounded-xl p-4 mb-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
             <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">👇 Credenciales de Acceso Demo 👇</p>
             <div className="flex gap-4 text-sm">
                <div className="bg-slate-50 px-3 py-1 rounded border border-slate-200">
                    <span className="text-slate-500 mr-2">Usuario:</span>
                    <code className="font-mono font-bold text-slate-800 select-all">demo@nexus.cl</code>
                </div>
                <div className="bg-slate-50 px-3 py-1 rounded border border-slate-200">
                    <span className="text-slate-500 mr-2">Pass:</span>
                    <code className="font-mono font-bold text-slate-800 select-all">123456</code>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={handleLogin} 
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-1 flex items-center gap-2"
            >
              PRUÉBALO YA <ArrowRight size={20} />
            </button>
            <p className="text-sm text-slate-500 mt-2 sm:mt-0 flex items-center gap-1">
              <ShieldCheck size={16} className="text-green-600"/> Datos 100% Seguros
            </p>
          </div>

          {/* --- HERO IMAGE --- */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-slate-100/50 p-2 shadow-2xl">
            <div className="rounded-xl overflow-hidden bg-white aspect-[16/9] flex items-center justify-center relative">
                <img 
                    src="/screenshots/Dashboard.png" 
                    alt="Nexus ERP Dashboard" 
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('bg-slate-100');
                        e.currentTarget.parentElement!.innerHTML = '<p class="text-slate-400 font-medium">📸 Falta imagen: public/screenshots/Dashboard.png</p>';
                    }}
                />
            </div>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
                  Ya hay pymes que trabajan conmigo
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-xl"><Star className="fill-slate-700 text-slate-700"/> Minimarket Don Pepe</div>
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-xl"><Star className="fill-slate-700 text-slate-700"/> Ferretería Central</div>
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-xl"><Star className="fill-slate-700 text-slate-700"/> Botillería El Paso</div>
              </div>
          </div>
      </section>

      {/* --- SEGURIDAD & FEATURES --- */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* FEATURE 1: INVENTARIO */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
            <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Box size={24} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Inventario bajo control</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Gestiona productos, categorías y stock en segundos. Alertas visuales de vencimiento y bajo stock.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-slate-700"><CheckCircle2 size={18} className="text-blue-600"/> Alertas automáticas</li>
                    <li className="flex items-center gap-2 text-slate-700"><CheckCircle2 size={18} className="text-blue-600"/> Catálogo con imágenes</li>
                </ul>
            </div>
            <div className="flex-1 w-full relative">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl hover:shadow-2xl transition-shadow duration-500 transform hover:-rotate-1">
                    <img src="/screenshots/Inventario.png" alt="Inventario" className="rounded-xl w-full h-auto shadow-sm" />
                </div>
            </div>
          </div>

          {/* FEATURE 2: PRIVACIDAD Y SEGURIDAD */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 mb-24">
            <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Lock size={24} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Tu privacidad es prioridad</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Sabemos que los datos de tu negocio son sagrados. Implementamos estándares de seguridad para que solo tú tengas acceso.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-slate-700"><ShieldCheck size={18} className="text-emerald-600"/> Encriptación de contraseñas</li>
                    <li className="flex items-center gap-2 text-slate-700"><EyeOff size={18} className="text-emerald-600"/> Backups diarios automáticos</li>
                    <li className="flex items-center gap-2 text-slate-700"><CheckCircle2 size={18} className="text-emerald-600"/> Datos aislados por empresa</li>
                </ul>
            </div>
            <div className="flex-1 w-full relative">
                 <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl hover:shadow-2xl transition-shadow duration-500 transform hover:rotate-1">
                    <img src="/screenshots/Venta.png" alt="Seguridad" className="rounded-xl w-full h-auto shadow-sm" />
                </div>
            </div>
          </div>

           {/* FEATURE 3: REPORTES */}
           <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <BarChart3 size={24} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Toma decisiones reales</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Gráficos claros de ventas y ganancias. Exporta tus reportes a PDF para contabilidad.
                </p>
            </div>
            <div className="flex-1 w-full relative">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl hover:shadow-2xl transition-shadow duration-500 transform hover:-rotate-1">
                    <img src="/screenshots/pdf.png" alt="Reportes" className="rounded-xl w-full h-auto shadow-sm" />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING --- */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Planes Transparentes</h2>
          <p className="text-slate-400 mb-12">Elige el que mejor se adapte al flujo de tu caja.</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* PLAN MENSUAL */}
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-indigo-500 transition-colors">
               <div className="absolute top-4 right-4 bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  ¡Solo 4 cupos!
               </div>
               <h3 className="text-xl font-bold text-slate-200 text-left mb-2">Plan Mensual</h3>
               <div className="text-left mb-6">
                   <div className="text-slate-500 text-sm line-through font-medium">Normal: $28.990</div>
                   <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight">$22.990</span>
                        <span className="text-slate-400">/mes</span>
                   </div>
               </div>
               <ul className="space-y-4 mb-8 text-left flex-1">
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400" size={18}/> <span>Todo el sistema incluido</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-indigo-400" size={18}/> <span>Soporte por WhatsApp</span></li>
                    <li className="flex items-center gap-3"><ShieldCheck className="text-indigo-400" size={18}/> <span>Seguridad Garantizada</span></li>
               </ul>
               <button onClick={openContact} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                   Cotizar Mensual
               </button>
            </div>

            {/* PLAN ANUAL */}
            <div className="bg-indigo-600 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl transform md:scale-105 z-10">
               <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
                  MEJOR VALOR
               </div>
               <h3 className="text-xl font-bold text-white text-left mb-2">Plan Anual</h3>
               <div className="text-left mb-6">
                   <div className="text-indigo-200 text-sm font-medium">Ahorras $45.000 al año</div>
                   <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight text-white">$229.900</span>
                        <span className="text-indigo-200">/año</span>
                   </div>
               </div>
               <ul className="space-y-4 mb-8 text-left flex-1 text-indigo-50">
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-white" size={18}/> <span><b>2 Meses GRATIS</b></span></li>
                    <li className="flex items-center gap-3"><ShieldCheck className="text-white" size={18}/> <span>Privacidad Total</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-white" size={18}/> <span>Capacitación inicial incluida</span></li>
                    <li className="flex items-center gap-3"><CheckCircle2 className="text-white" size={18}/> <span>Configuración de cuenta gratis</span></li>
               </ul>
               <button onClick={openContact} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
                   Cotizar Anual
               </button>
            </div>

          </div>
        </div>
      </section>

      {/* --- QUIÉN SOY (ABOUT ME) - ACTUALIZADO CON CREDENCIALES --- */}
      <section className="py-24 px-4 bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start gap-12">
              <div className="w-48 h-48 shrink-0 relative mx-auto md:mx-0">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-indigo-100 shadow-xl bg-slate-200 flex items-center justify-center">
                     <User size={64} className="text-slate-400" /> 
                  </div>
                  <div className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full border-4 border-white">
                      <Code size={20} />
                  </div>
              </div>
              <div className="text-center md:text-left flex-1">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Hola, soy Juan Riveros 👋</h2>
                  <h3 className="text-indigo-600 font-semibold mb-6">Fundador & Desarrollador Full Stack</h3>
                  
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                      Desarrollé <b>Nexus ERP</b> con una misión clara: democratizar la tecnología para las Pymes en Chile. 
                      Sé lo difícil que es emprender, por eso creé una herramienta que no solo ordena tu negocio, 
                      sino que te devuelve tiempo para que te enfoques en lo importante: vender más.
                  </p>
                  
                  {/* --- NUEVA SECCIÓN DE CREDENCIALES --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                     {/* Credencial 1 */}
                     <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4 hover:border-indigo-200 transition-colors">
                        <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-700">
                           <GraduationCap size={24} />
                        </div>
                        <div className="text-left">
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Titulado</p>
                           <p className="font-semibold text-slate-800 text-sm">Técnico en Programación y Análisis de Sistemas</p>
                        </div>
                     </div>

                     {/* Credencial 2 */}
                     <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4 hover:border-indigo-200 transition-colors">
                        <div className="bg-blue-100 p-2.5 rounded-lg text-blue-700">
                           <BookOpen size={24} />
                        </div>
                        <div className="text-left">
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cursando Actualmente</p>
                           <p className="font-semibold text-slate-800 text-sm">Ingeniería de Ejecución en Informática, Mención Desarrollo</p>
                        </div>
                     </div>

                     {/* Credencial 3 */}
                     <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-4 hover:border-indigo-200 transition-colors md:col-span-2">
                        <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
                           <Award size={24} />
                        </div>
                        <div className="text-left">
                           <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Experiencia Comprobada</p>
                           <p className="font-semibold text-slate-800 text-sm">Certificado de trabajo colaborativo con Pymes Chilenas</p>
                        </div>
                     </div>
                  </div>

                  <p className="text-slate-500 italic border-l-4 border-indigo-500 pl-4 py-2 bg-slate-50 rounded-r-lg">
                      "Ofrezco seguridad, privacidad y un trato personalizado. Aquí no eres un número, eres un socio."
                  </p>
              </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Box size={20} className="text-indigo-600" /> Nexus ERP
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} NorteDev Solutions. Hecho con ❤️ en Chile.
          </p>
        </div>
      </footer>

      {/* --- MODAL DE CONTACTO --- */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeContact}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl scale-100 transition-all overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <h3 className="text-2xl font-bold mb-1">¡Hablemos!</h3>
                    <p className="text-indigo-100 text-sm">Cotiza tu plan o resuelve dudas.</p>
                    <button onClick={closeContact} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSendContact} className="p-8 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tu Nombre</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input 
                                required 
                                type="text" 
                                placeholder="Ej: Juan Pérez" 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={contactForm.name}
                                onChange={e => setContactForm({...contactForm, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                            <input 
                                required 
                                type="email" 
                                placeholder="juan@tuempresa.cl" 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={contactForm.email}
                                onChange={e => setContactForm({...contactForm, email: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje (Obligatorio)</label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 text-slate-400" size={18}/>
                            <textarea 
                                required 
                                placeholder="Hola, me interesa el plan mensual..." 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
                                value={contactForm.message}
                                onChange={e => setContactForm({...contactForm, message: e.target.value})}
                            ></textarea>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 mt-4">
                        Enviar Mensaje <Send size={18} />
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-2">Te responderé a la brevedad.</p>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};