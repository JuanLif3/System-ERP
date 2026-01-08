import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

// Tipos de notificaciones
type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  show: (message: string, type: NotificationType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de un NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Función para eliminar una notificación
  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Función para agregar una notificación
  const show = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
      remove(id);
    }, 4000);
  }, [remove]);

  // Atajos para tipos comunes
  const success = (msg: string) => show(msg, 'success');
  const error = (msg: string) => show(msg, 'error');
  const info = (msg: string) => show(msg, 'info');
  const warning = (msg: string) => show(msg, 'warning');

  return (
    <NotificationContext.Provider value={{ show, success, error, info, warning }}>
      {children}
      
      {/* --- CONTENEDOR DE TOASTS (UI) --- */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`
              pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border w-80 
              transform transition-all duration-300 animate-in fade-in slide-in-from-right
              ${n.type === 'success' ? 'bg-white border-green-200 text-green-800' : ''}
              ${n.type === 'error' ? 'bg-white border-red-200 text-red-800' : ''}
              ${n.type === 'info' ? 'bg-white border-blue-200 text-blue-800' : ''}
              ${n.type === 'warning' ? 'bg-white border-yellow-200 text-yellow-800' : ''}
            `}
          >
            {/* ÍCONO */}
            <div className="mt-0.5 shrink-0">
              {n.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
              {n.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
              {n.type === 'info' && <Info size={20} className="text-blue-500" />}
              {n.type === 'warning' && <AlertTriangle size={20} className="text-yellow-500" />}
            </div>

            {/* MENSAJE */}
            <p className="text-sm font-medium flex-1">{n.message}</p>

            {/* BOTÓN CERRAR */}
            <button onClick={() => remove(n.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};