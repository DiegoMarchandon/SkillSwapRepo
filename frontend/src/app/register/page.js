'use client';
// import axios from 'axios';
import api from '../../utils/axios';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import Register from '../pages/register';
import RegisterForm from '../../components/forms/RegisterForm';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const {login} = useAuth();

  const handleSubmit = async (event) => {
      event.preventDefault();
      try {
        // 1. hacemos la petición para obtener la cookie CSRF de Laravel antes de registrar al usuario. 
        await api.get('/sanctum/csrf-cookie', { withCredentials: true });
        
        // 2. Registramos al usuario
        const response = await api.post('/api/register', {
          name,
          email,
          password,
          password_confirmation: passwordConfirm
          },
          { withCredentials: true});

          // 3. Laravel debería devolver los datos del usuario recién creado
          const user = response.data.user;

        // localStorage.setItem('token', token);
        login(user);
        // Redirigir al usuario a la vista principal
        router.push('/');
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
      <RegisterForm 
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        passwordConfirm={passwordConfirm}
        setPasswordConfirm={setPasswordConfirm}
        error={error}
        setError={setError}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
