import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // la URL de tu backend Laravel
  withCredentials: true,            // importante para Sanctum
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;

