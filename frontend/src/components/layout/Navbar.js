import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  if (loading) return <nav className="w-full bg-gray-900 text-white px-6 py-4">Loading…</nav>;

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4">
      <ul className="flex flex-wrap justify-end items-center gap-4">
        <li><Link href="/">Inicio</Link></li>
        <li><Link href="/search">Buscar</Link></li>
        {user && <li><Link href="/perfil/habilidades">Mis habilidades</Link></li>}
        <li><Link href="/faq">Preguntas frecuentes</Link></li>

        {user ? (
          <>
            <li><Link href="/perfil">Mi perfil</Link></li>
            <li>
              <button onClick={logout} className="rounded bg-red-600 px-3 py-1">
                Cerrar sesión
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link href="/login">Iniciar sesión</Link></li>
            <li><Link href="/register">Registrarse</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
