import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
// import axios from 'axios';
import api from '../../utils/axios';

export default function Navbar(){

  
  const router = useRouter();
  const {user,logout,loading} = useAuth();

  if(loading){
    return <nav>Loading...</nav>;
  }

    return(
      <nav className="w-full bg-gray-900 text-white px-6 py-4">
        <ul className="flex flex-wrap justify-end gap-4">
          <li><a href="/">Inicio</a></li>
          {
            user ? (
              <li>
                <button onClick={logout}>
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