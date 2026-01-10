import { useState } from 'react';
import { FileText, Download, Calendar, CheckSquare, Square } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../../config/api';
import { useNotification } from '../../context/NotificationContext';

export const ReportsPage = () => {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  
  // Fechas por defecto: Primer día del mes actual hasta hoy
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [dates, setDates] = useState({
    start: firstDay.toISOString().split('T')[0],
    end: today.toISOString().split('T')[0]
  });

  // Opciones del Reporte (Checklist)
  const [options, setOptions] = useState({
    summary: true,      // Ingresos, Ventas, Ticket
    topCategory: true,  // Categoria mas vendida
    topProducts: true,  // Top 5 productos
    topUser: true,      // Mejor vendedor
    salesLog: true,     // Detalle de todas las ventas
    expenses: true      // Gastos
  });

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      // 1. Obtener Datos del Backend
      const { data } = await api.get(`/finance/report?startDate=${dates.start}&endDate=${dates.end}`);
      
      // 2. Configurar PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPos = 20; // Posición vertical cursor

      // TÍTULO
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text('Reporte Financiero', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Desde: ${dates.start}  |  Hasta: ${dates.end}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 20;

      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos - 5, pageWidth - 15, yPos - 5);

      // --- SECCIÓN 1: RESUMEN GENERAL ---
      if (options.summary) {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Resumen General', 15, yPos);
        yPos += 10;

        const headers = [['Ingresos Totales', 'Ventas Totales', 'Ticket Promedio']];
        const body = [[
            `$${Number(data.stats.totalRevenue).toLocaleString('es-CL')}`,
            data.stats.totalSales,
            `$${Number(data.stats.averageTicket).toLocaleString('es-CL')}`
        ]];

        autoTable(doc, {
            startY: yPos,
            head: headers,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] } // Indigo
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // --- SECCIÓN 2: HIGHLIGHTS (Categoría, Top User) ---
      if (options.topCategory || options.topUser) {
          const highlights = [];
          if (options.topCategory && data.topCategory) {
              highlights.push(['Categoría Top', data.topCategory.name, `${data.topCategory.units} uds.`]);
          } else if(options.topCategory) {
            highlights.push(['Categoría Top', 'Sin datos', '-']);
          }

          if (options.topUser && data.topUser) {
              highlights.push(['Mejor Vendedor', data.topUser.name, `$${Number(data.topUser.total).toLocaleString('es-CL')}`]);
          }

          if (highlights.length > 0) {
            doc.text('Destacados', 15, yPos);
            yPos += 8;
            autoTable(doc, {
                startY: yPos,
                head: [['Métrica', 'Nombre', 'Valor']],
                body: highlights,
                theme: 'striped',
            });
            yPos = (doc as any).lastAutoTable.finalY + 15;
          }
      }

      // --- SECCIÓN 3: TOP 5 PRODUCTOS ---
      if (options.topProducts && data.topProducts.length > 0) {
          doc.text('Top 5 Productos Más Vendidos', 15, yPos);
          yPos += 8;
          autoTable(doc, {
              startY: yPos,
              head: [['Producto', 'Unidades Vendidas']],
              body: data.topProducts.map((p: any) => [p.name, p.quantity]),
              theme: 'striped'
          });
          yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // --- SECCIÓN 4: DETALLE DE VENTAS ---
      if (options.salesLog && data.salesLog.length > 0) {
          // Si queda poco espacio, saltar página
          if (yPos > 250) { doc.addPage(); yPos = 20; }

          doc.text('Historial de Ventas Detallado', 15, yPos);
          yPos += 8;
          autoTable(doc, {
              startY: yPos,
              head: [['ID', 'Fecha', 'Items', 'Total']],
              body: data.salesLog.map((s: any) => [
                  s.id.slice(-8),
                  new Date(s.date).toLocaleDateString('es-CL'),
                  s.itemsCount,
                  `$${Number(s.total).toLocaleString('es-CL')}`
              ]),
              theme: 'grid',
              headStyles: { fillColor: [50, 50, 50] }
          });
          yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // --- SECCIÓN 5: GASTOS ---
      if (options.expenses) {
         // Verificar si necesitamos nueva página
         if (yPos > 240) { doc.addPage(); yPos = 20; }
         
         doc.setFontSize(14);
         doc.setTextColor(185, 28, 28); // Rojo oscuro
         doc.text('Registro de Gastos', 15, yPos);
         yPos += 8;
         
         if (data.expenses.length === 0) {
             doc.setFontSize(10);
             doc.setTextColor(100, 100, 100);
             doc.text('No hay gastos registrados en este periodo.', 15, yPos);
             yPos += 15;
         } else {
             // TABLA DE GASTOS
             autoTable(doc, {
                startY: yPos,
                head: [['Fecha', 'Descripción', 'Registrado Por', 'Monto']],
                body: data.expenses.map((e: any) => [
                    new Date(e.date).toLocaleDateString('es-CL'),
                    e.description,
                    e.user,
                    `$${Number(e.amount).toLocaleString('es-CL')}`
                ]),
                theme: 'grid',
                headStyles: { fillColor: [220, 38, 38] }, // Rojo Cabecera
                styles: { fontSize: 9 }
             });
             
             yPos = (doc as any).lastAutoTable.finalY + 10;

             // TOTAL GASTOS AL PIE DE LA TABLA
             doc.setFontSize(11);
             doc.setTextColor(0, 0, 0);
             doc.text(`Total Gastos: $${Number(data.totalExpenses).toLocaleString('es-CL')}`, 195, yPos, { align: 'right' });
             
             // TOTAL NETO (Ingresos - Gastos)
             yPos += 8;
             const netResult = Number(data.stats.totalRevenue) - Number(data.totalExpenses);
             doc.setFontSize(12);
             doc.setTextColor(netResult >= 0 ? 22 : 220, netResult >= 0 ? 163 : 38, netResult >= 0 ? 74 : 38); // Verde o Rojo
             doc.setFont('helvetica', 'bold');
             doc.text(`Resultado del Periodo: $${netResult.toLocaleString('es-CL')}`, 195, yPos, { align: 'right' });
         }
      }

      // Guardar PDF
      doc.save(`Reporte_Financiero_${dates.start}_${dates.end}.pdf`);
      notify.success('PDF descargado correctamente');

    } catch (error) {
      console.error(error);
      notify.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <FileText size={32} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Generador de Reportes</h1>
            <p className="text-slate-500">Selecciona el periodo y el contenido de tu informe.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-200 p-8">
        
        {/* 1. SELECCIÓN DE FECHAS */}
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500"/> 1. Rango de Fechas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                <input type="date" className="input-modern w-full" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin</label>
                <input type="date" className="input-modern w-full" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} />
            </div>
        </div>

        {/* 2. CONTENIDO DEL REPORTE (CHECKLIST) */}
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <CheckSquare size={20} className="text-indigo-500"/> 2. Contenido del PDF
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <CheckboxOption label="Resumen Financiero (Ingresos/Ventas)" checked={options.summary} onChange={() => toggleOption('summary')} />
            <CheckboxOption label="Categoría Más Vendida" checked={options.topCategory} onChange={() => toggleOption('topCategory')} />
            <CheckboxOption label="Top 5 Productos" checked={options.topProducts} onChange={() => toggleOption('topProducts')} />
            <CheckboxOption label="Mejor Vendedor (Usuario)" checked={options.topUser} onChange={() => toggleOption('topUser')} />
            <CheckboxOption label="Historial Detallado de Ventas" checked={options.salesLog} onChange={() => toggleOption('salesLog')} />
            <CheckboxOption label="Registro de Gastos" checked={options.expenses} onChange={() => toggleOption('expenses')} />
        </div>

        {/* 3. BOTÓN DE ACCIÓN */}
        <div className="border-t border-slate-100 pt-6 flex justify-end">
            <button 
                id="tour-reports-download"
                onClick={generatePDF}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>Generando...</>
                ) : (
                    <>
                        <Download size={20} /> Descargar PDF
                    </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
};

// Componente auxiliar para el Checkbox bonito
const CheckboxOption = ({ label, checked, onChange }: any) => (
    <div 
        onClick={onChange}
        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
    >
        <div className={`text-indigo-600 transition-transform ${checked ? 'scale-110' : 'text-slate-300'}`}>
            {checked ? <CheckSquare size={24} fill="currentColor" className="text-indigo-100"/> : <Square size={24} />}
        </div>
        <span className={`font-medium ${checked ? 'text-indigo-900' : 'text-slate-600'}`}>{label}</span>
    </div>
);