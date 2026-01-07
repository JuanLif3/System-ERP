import axios from 'axios';

// URL base del backend
export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor de Request: "Antes de salir, ponte el carnet"
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response: "Si el carnet venció, pa' fuera"
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Redirigir forzadamente
    }
    return Promise.reject(error);
  }
);