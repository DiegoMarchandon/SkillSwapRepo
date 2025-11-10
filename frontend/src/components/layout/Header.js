'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  return (
    <header className="w-full sticky top-0 z-40">
      {/* barra superior */}
      <div className="full-bleed bg-[#9aaac1] text-[#0b0c10]">
        <div className="mx-auto max-w-6xl px-4 py-2 font-pixel">
          {user ? `Bienvenido ${user.name} a SkillSwap!` : 'Bienvenido Usuario a SkillSwap!'}
        </div>
      </div>

      {/* navbar */}
      <div className="full-bleed bg-[#0d1220] border-b-2 border-[#0f172a]">
        <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 text-[#e6f3ff]">
          <div className="flex gap-6">
            <Link href="/">Inicio</Link>
            <Link href="/search">Aprender Habilidad</Link>
          </div>

          {/* derecha */}
          <div className="flex items-center gap-6">
            {loading ? (
              <span className="text-[#a7c6ec] text-sm">Cargando…</span>
            ) : user ? (
              <>
                <Link href="/disponibilidad">Mi disponibilidad</Link>
                <Link href="/reservas">Mis reservas</Link>
                <Link href="/perfil">Mi perfil</Link>
                <button
                  onClick={() => logout({ redirect: '/' })}
                  className="pixel-btn border-2 border-[#0f172a] bg-[#cde8ff] text-[#0b0c10] px-3 py-1 font-pixel rounded-none hover:bg-[#bfe0ff]"
                  aria-label="Cerrar sesión"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href={{ pathname: '/auth/login', query: { next: pathname } }}>Iniciar sesión</Link>
                <Link href={{ pathname: '/register',   query: { next: pathname } }}>Registrarse</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
