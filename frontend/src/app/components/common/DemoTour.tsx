import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from '../../modules/auth/context/AuthContext';

export const DemoTour = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. ESCUCHAR EL EVENTO DEL BOTÓN (Inicio Manual)
  useEffect(() => {
    const handleStartTour = () => {
      // Limpiamos todo el progreso anterior para empezar de cero
      localStorage.removeItem('tour_phase_1_done');
      localStorage.removeItem('tour_phase_2_done');
      localStorage.removeItem('tour_phase_3_done');
      localStorage.removeItem('tour_phase_4_done');
      localStorage.removeItem('tour_phase_5_done');
      localStorage.removeItem('tour_phase_6_done');
      
      // Iniciamos Fase 1
      runDashboardTour();
    };

    window.addEventListener('start-demo-tour', handleStartTour);
    return () => window.removeEventListener('start-demo-tour', handleStartTour);
  }, []);

  // 2. ESCUCHAR CAMBIOS DE RUTA (Continuación Automática Fases 2-6)
  useEffect(() => {
    if (user?.email !== 'demo@nexus.cl') return;
    
    // Pequeño delay para dar tiempo al renderizado
    const timer = setTimeout(() => {
        checkAutoPhases();
    }, 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);


  // --- CONFIGURACIÓN COMÚN ---
  const driverConfig = {
    showProgress: true,
    animate: true,
    allowClose: true,
    doneBtnText: 'Siguiente Módulo ➡',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Atrás',
  };

  // --- FASE 1: DASHBOARD (Solo se llama manualmente) ---
  const runDashboardTour = () => {
    const d = driver({
      ...driverConfig,
      steps: [
        { element: '#tour-sidebar', popover: { title: '👋 ¡Bienvenido a Nexus!', description: 'Este es el menú principal. Desde aquí controlas todo el negocio.' } },
        { element: '#tour-kpi-revenue', popover: { title: '1. Ingresos', description: 'Dinero real recaudado hoy.' } },
        { element: '#tour-kpi-total-sales', popover: { title: '2. Ventas', description: 'Cantidad de ventas realizadas.' } },
        { element: '#tour-kpi-ticket', popover: { title: '3. Ticket Promedio', description: 'Lo que gasta un cliente promedio.' } },
        { element: '#tour-kpi-today', popover: { title: '4. Hoy', description: 'Ventas del día actual.' } },
        { element: '#tour-chart-history', popover: { title: '5. Tendencia', description: 'Gráfico de tus ingresos.' } },
        { element: '#tour-chart-categories', popover: { title: '6. Categorías', description: 'Qué categorías vendes más.' } },
        { element: '#tour-list-top', popover: { title: '7. Top Productos', description: 'Lo que más sale de tu tienda.' } },
        { element: '#tour-list-low-stock', popover: { title: '8. Stock Bajo', description: '¡Alerta! Se están acabando.' } },
        { element: '#tour-list-expiring', popover: { title: '9. Vencimientos', description: 'Productos por vencer pronto.' } },
      ],
      onDestroyStarted: () => {
        // eslint-disable-next-line no-restricted-globals
        if (!d.hasNextStep() || confirm("¿Ir a Inventario?")) {
          localStorage.setItem('tour_phase_1_done', 'true');
          d.destroy();
          navigate('/inventory');
        } else {
            d.destroy(); // Si cierra con X, solo destruye
        }
      }
    });
    d.drive();
  };

  // --- FASES AUTOMÁTICAS (2 a 6) ---
  const checkAutoPhases = () => {
    const path = location.pathname;
    
    // Si ya hay un driver corriendo, no hacemos nada
    const isDriverRunning = document.body.classList.contains('driver-active');
    if (isDriverRunning) return;

    // FASE 2: INVENTARIO
    if (path === '/inventory') {
        if (!localStorage.getItem('tour_phase_1_done')) return;
        if (localStorage.getItem('tour_phase_2_done')) return;

        const d = driver({
            ...driverConfig,
            steps: [
                { element: '#tour-inv-tab-categories', popover: { title: '1. Categorías', description: 'Crea grupos (Bebidas, Aseo) aquí.' } },
                { element: '#tour-inv-tab-products', popover: { title: '2. Productos', description: 'Gestiona tu catálogo completo aquí.' } },
            ],
            onDestroyStarted: () => {
                // eslint-disable-next-line no-restricted-globals
                if (!d.hasNextStep() || confirm("¿Ir a Ventas?")) {
                    localStorage.setItem('tour_phase_2_done', 'true');
                    d.destroy();
                    navigate('/sales');
                } else d.destroy();
            }
        });
        d.drive();
    }

    // FASE 3: VENTAS
    else if (path === '/sales') {
        if (!localStorage.getItem('tour_phase_2_done')) return;
        if (localStorage.getItem('tour_phase_3_done')) return;

        const d = driver({
            ...driverConfig,
            steps: [
                { element: '#tour-sales-products', popover: { title: '1. Selecciona', description: 'Toca o escanea productos.' } },
                { element: '#tour-sales-pay-btn', popover: { title: '2. Cobra', description: 'Confirma venta y medio de pago.' } },
                { element: '#tour-sales-tab-history', popover: { title: '3. Historial', description: 'Revisa y gestiona ventas pasadas.' } },
            ],
            onDestroyStarted: () => {
                // eslint-disable-next-line no-restricted-globals
                if (!d.hasNextStep() || confirm("¿Ir a Gastos?")) {
                    localStorage.setItem('tour_phase_3_done', 'true');
                    d.destroy();
                    navigate('/expenses');
                } else d.destroy();
            }
        });
        d.drive();
    }

    // FASE 4: GASTOS
    else if (path === '/expenses') {
        if (!localStorage.getItem('tour_phase_3_done')) return;
        if (localStorage.getItem('tour_phase_4_done')) return;

        const d = driver({
            ...driverConfig,
            steps: [{ element: '#tour-expenses-create', popover: { title: '1. Registrar Gasto', description: 'Anota pagos de luz, agua, arriendo, etc.' } }],
            onDestroyStarted: () => {
                // eslint-disable-next-line no-restricted-globals
                if (!d.hasNextStep() || confirm("¿Ir a Reportes?")) {
                    localStorage.setItem('tour_phase_4_done', 'true');
                    d.destroy();
                    navigate('/reports'); 
                } else d.destroy();
            }
        });
        d.drive();
    }

    // FASE 5: REPORTES
    else if (path === '/reports') {
        if (!localStorage.getItem('tour_phase_4_done')) return;
        if (localStorage.getItem('tour_phase_5_done')) return;

        const d = driver({
            ...driverConfig,
            steps: [{ element: '#tour-reports-download', popover: { title: '1. Descargar PDF', description: 'Genera informes profesionales al instante.' } }],
            onDestroyStarted: () => {
                // eslint-disable-next-line no-restricted-globals
                if (!d.hasNextStep() || confirm("¿Ir a Usuarios?")) {
                    localStorage.setItem('tour_phase_5_done', 'true');
                    d.destroy();
                    navigate('/users');
                } else d.destroy();
            }
        });
        d.drive();
    }

    // FASE 6: USUARIOS
    else if (path === '/users') {
        if (!localStorage.getItem('tour_phase_5_done')) return;
        if (localStorage.getItem('tour_phase_6_done')) return;

        const d = driver({
            ...driverConfig,
            doneBtnText: '¡Finalizar Demo! 🎉',
            steps: [
                { element: '#tour-users-create', popover: { title: '1. Crear Usuarios', description: 'Define roles: Cajero, Vendedor o Admin.' } },
                { popover: { title: '¡Eres un experto!', description: 'Has completado el recorrido. Ahora prueba el sistema libremente.' } }
            ],
            onDestroyStarted: () => {
                localStorage.setItem('tour_phase_6_done', 'true');
                d.destroy();
                navigate('/dashboard');
            }
        });
        d.drive();
    }
  };

  return null;
};