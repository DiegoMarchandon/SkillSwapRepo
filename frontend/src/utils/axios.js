'use client';
import axios from 'axios';

// Acepta NEXT_PUBLIC_API o NEXT_PUBLIC_API_URL, sino usa 127.0.0.1:8000
const raw = process.env.NEXT_PUBLIC_API ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
const baseURL = raw.endsWith('/api') ? raw : `${raw.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export default api;
