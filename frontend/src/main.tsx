import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

console.log(
  '%c ¡Alto ahí, vaquero! Este sistema (Nexus ERP) fue desarrollado con ❤️ y ☕ por Juan Riveros.',
  'font-size: 40px; font-weight: bold; color: #4F46E5; text-shadow: 2px 2px 0px #E0E7FF;'
);


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
