'use client';
// import axios from 'axios';
import api from '../../utils/axios';
import LoginForm from '../../components/forms/LoginForm';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
    

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

      const handleSubmit = async(event) => {
          event.preventDefault();
          try {
            console.log("hola desde login");
            // hacemos la petición para obtener la cookie CSRF de Laravel antes de registrar al usuario. 
            await api.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
            // Registramos al usuario
            const response = await api.post('http://localhost:8000/api/login', {
              email,
              password
              },
              { withCredentials: true 
              } // No hace falta enviar headers manuales
            );
            // guardo el token en localStorage
            const token = response.data.token;
            localStorage.setItem('token', token);

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
