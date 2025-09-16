import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:8000', //mi backend
  withCredentials: true, //para enviar cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para inyectar CRSF (Sanctum lo requiere para POST/PUT/DELETE)
api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('XSRF-TOKEN');
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
});

export default api;
