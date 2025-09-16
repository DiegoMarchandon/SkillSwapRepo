'use client';
// import axios from 'axios';
import api from '../../utils/axios';
import LoginForm from '../../components/forms/LoginForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const { login } = useAuth();

      const handleSubmit = async(event) => {
          event.preventDefault();
          try {
            // 1. hacemos la petición para obtener la cookie CSRF de Laravel antes de registrar al usuario. 
            await api.get('/sanctum/csrf-cookie',{ withCredentials: true });
            
            // 2. Logueamos al usuario
            const response = await api.post('/api/login', {
              email,
              password
              },
              { withCredentials: true 
              } // No hace falta enviar headers manuales
            );
            // 3. Laravel debería devolver los datos del usuario recién creado
            const user = response.data.user;
            // localStorage.setItem('token', token);
            login(user);
            // Redirigir al usuario a la vista principal
            router.push('/');
          } catch (error) {
            if(error.response && error.response.status === 422){
              setError(error.response.data.errors);
            }
      }}

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <LoginForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                error={error} 
                handleSubmit={handleSubmit}
            />
        </div>
    );
}
