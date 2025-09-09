'use client';
import axios from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  
const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log(axios.defaults);
      // hacemos la petición para obtener la cookie CSRF de Laravel antes de registrar al usuario. 
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { withCredentials: true });
      
      // Registramos al usuario
      const response = await axios.post('http://127.0.0.1:8000/api/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirm
        },
        { withCredentials: true 
        } // No hace falta enviar headers manuales
      );
      const token = response.data.token;
      // Redirigir al usuario a la vista de inicio de sesión o a la vista principal
      router.push('/login');
    } catch (error) {
      if(error.response && error.response.status === 422){
        const apiErrors = error.response.data.errors;
        const formattedErrors = {};
        // recorremos todos los campos que tienen errores
        for (const field in apiErrors) {
          // Guardamos todos los mensajes como un string separado por comas 
          formattedErrors[field] = apiErrors[field][0];
        }
        setError(formattedErrors);
      }else{
        setError(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Registro de usuarios</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario:
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-red-500">{error?.response?.errors?.name?.[0]}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico:
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-red-500">{error?.response?.errors?.email?.[0]}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-red-500">{error?.response?.errors?.password?.[0]}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña:
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-red-500">{error?.response?.errors?.password?.[0]}</p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Registrar
          </button>
          {error?.response?.data?.message && (
            <p className="text-red-600 text-sm mt-2 text-center">{error.response.data.message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;