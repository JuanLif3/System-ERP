import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { api } from '../../config/api'; // Importamos nuestra instancia de Axios configurada
import { useAuth } from './contexts/AuthContext';

export const LoginPage = () => {

  
  const navigate = useNavigate();
  
  // Estados para manejar el formulario y la UI
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Petición al Backend
      const { data } = await api.post('/auth/login', {
        email,
        password
      });

      // 2. Guardar Token (La llave maestra)
      localStorage.setItem('token', data.token);
      
      // 3. Guardar datos básicos del usuario (Opcional, útil para mostrar el nombre en el sidebar)
      localStorage.setItem('user', JSON.stringify(data.user));

      // 4. Redirigir al Dashboard
      navigate('/dashboard');

    } catch (err: any) {
      // Manejo de errores profesional
      console.error(err);
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas. Verifique su correo o contraseña.');
      } else {
        setError('Error de conexión con el servidor. Intente más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // <--- USAR HOOK
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // USAR LA FUNCIÓN DEL CONTEXTO PARA GUARDAR SESIÓN GLOBAL
      login(data.token, data.user); 
      
      navigate('/dashboard');
    } catch (error) {
      alert('Credenciales incorrectas'); // O usa notify.error si ya lo tienes aquí
    }
  };
  

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Encabezado */}
        <div className="bg-primary p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Bienvenido</h2>
          <p className="text-blue-100">Ingresa a tu ERP System</p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Mensaje de Error */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              ¿Olvidaste tu contraseña? Contacta al Super Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};