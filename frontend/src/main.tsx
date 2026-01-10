import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';
import { AuthProvider } from './app/modules/auth/context/AuthContext'; // 👈 VITAL
import { NotificationProvider } from './app/context/NotificationContext'; // 👈 Para las alertas

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      {/* El AuthProvider debe envolver a la App para que el Login funcione */}
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);