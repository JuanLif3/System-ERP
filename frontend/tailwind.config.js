const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // Paleta semántica para el ERP
        primary: {
          DEFAULT: '#2563EB', // Azul profesional (Blue-600)
          hover: '#1D4ED8',   // Azul más oscuro para hovers (Blue-700)
        },
        slate: {
          850: '#1e293b', // Fondo Sidebar oscuro
          900: '#0f172a', // Fondo Sidebar más oscuro
        }
      },
    },
  },
  plugins: [],
};