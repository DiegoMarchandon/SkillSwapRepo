import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Navbar(){

  
  const router = useRouter();
  const {user} = useAuth();

    const handleLogout = async() => {
      console.log("hola desde fuera del try");
      try{
        console.log("hola desde logout");
        // antes de desloguearme, pido el token CSRF a Laravel:
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });

        await axios.post(
          'http://localhost:8000/api/logout', 
          {}, 
          { withCredentials: true }
        );
        router.push('/');
      }catch(error){
        console.error('Error al cerrar sesión: ', error);
      }
    }

    return(
      <nav>
        <ul className="flex gap-4">
          <li><a href="/">Inicio</a></li>
          {
            user ? (
              <li>
                <button onClick={handleLogout}>
                Cerrar Sesion
                </button>
              </li>
            ): (
              <>
              <li><a href="/register">Registrarse</a></li>
              <li><a href="/login">Iniciar Sesion</a></li>
              </>
            )
          }
          <li><a href="/faq">Preguntas frecuentes</a></li>
          <li><a href="/perfil">Mi perfil</a></li>
        </ul>
      </nav>
    );
}