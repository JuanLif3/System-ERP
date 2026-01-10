import axios from 'axios';

// 1. Detectamos si estamos en modo desarrollo (npm run dev / nx serve)
const isDev = import.meta.env.DEV; 

// 2. DEFINICIÓN DE LA URL BASE (Lógica Blindada)
// Si es desarrollo, FORZAMOS localhost:3000.
// Ignoramos el .env en desarrollo para evitar errores humanos.
const baseURL = isDev 
  ? 'http://localhost:3000/api' 
  : (import.meta.env.VITE_API_URL || 'https://api.nortedev.cl/api');

// --- LOGGER DE ARQUITECTURA ---
// Esto te confirmará visualmente en la consola qué está pasando.
if (isDev) {
  console.log(`%c 🔧 MODO DESARROLLO DETECTADO`, 'background: #f59e0b; color: black; padding: 4px; border-radius: 4px; font-weight: bold;');
  console.log(`%c 🎯 Backend Apuntado: ${baseURL}`, 'background: #10b981; color: white; padding: 4px; border-radius: 4px; font-weight: bold;');
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Interceptor de Request: "Antes de salir, ponte el carnet (Token)"
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response: Manejo de errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend no responde (Network Error)
    if (error.code === 'ERR_NETWORK') {
      console.error('🚨 Error Crítico: No se puede conectar al Backend en ' + baseURL);
      console.error('👉 Asegúrate de tener corriendo "npx nx serve api" en otra terminal.');
    }

    // Si el token venció (401)
    if (error.response?.status === 401) {
      console.warn('🔒 Sesión expirada, redirigiendo al login...');
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);