'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const isAdmin = !!user?.is_admin;

  const userLeftLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/search', label: 'Aprender' },
  ];

  const userRightLinks = [
    { href: '/disponibilidad', label: 'Mi disponibilidad' },
    { href: '/reservas', label: 'Mis reservas' },
    { href: '/perfil', label: 'Mi perfil' },
  ];

  const adminLinks = [
    { href: '/admin/usuarios', label: 'Historial usuarios' },
    { href: '/admin/categorias', label: 'Categorías' },
    { href: '/admin/bloqueos', label: 'Bloquear perfil' },
  ];

  const linkBase =
    'px-1.5 py-0.5 text-[10px] md:text-xs tracking-[0.12em] uppercase hover:text-[#67e8f9] transition-colors';

  const linkClasses = (href) =>
    `${linkBase} ${
      pathname === href ? 'text-[#67e8f9] border-b border-[#67e8f9]' : 'text-[#e6f3ff]'
    }`;

  return (
    <header className="w-full sticky top-0 z-40">
      {/* barra superior */}
      <div className="full-bleed bg-[#9aaac1] text-[#0b0c10] border-b border-[#0f172a]">
        <div className="mx-auto max-w-6xl px-4 py-1 font-pixel text-[10px] md:text-xs tracking-[0.15em] uppercase">
          {user ? `Bienvenido ${user.name} a SkillSwap!` : 'Bienvenido a SkillSwap!'}
        </div>
      </div>

      {/* navbar */}
      <div className="full-bleed bg-[#0d1220] border-b-2 border-[#0f172a]">
        <nav
          className="
            mx-auto max-w-6xl px-4 py-1.5
            flex flex-wrap items-center justify-between gap-y-2
            font-pixel
          "
        >
          {/* IZQUIERDA */}
          <div className="flex items-center gap-3 md:gap-5">
            {loading ? (
              <span className="text-[#a7c6ec] text-[10px] md:text-xs">Cargando…</span>
            ) : user ? (
              isAdmin ? (
                adminLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                    {item.label}
                  </Link>
                ))
              ) : (
                userLeftLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                    {item.label}
                  </Link>
                ))
              )
            ) : (
              <>
                <Link href="/" className={linkClasses('/')}>
                  Inicio
                </Link>
                <Link href="/search" className={linkClasses('/search')}>
                  Aprender
                </Link>
              </>
            )}
          </div>

          {/* DERECHA */}
          <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto justify-end">
            {loading ? null : user ? (
              <>
                {!isAdmin &&
                  userRightLinks.map((item) => (
                    <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                      {item.label}
                    </Link>
                  ))}

                <button
                  onClick={() => logout({ redirect: '/' })}
                  className="
                    border-2 border-[#0f172a] bg-[#cde8ff] text-[#0b0c10]
                    px-2 py-[2px] text-[10px] md:text-xs tracking-[0.12em] uppercase
                    rounded-none
                    shadow-[2px_2px_0_0_rgba(15,23,42,1)]
                    hover:bg-[#bfe0ff] hover:translate-x-[1px] hover:translate-y-[1px]
                    active:translate-x-[2px] active:translate-y-[2px]
                  "
                  aria-label="Cerrar sesión"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href={{ pathname: '/auth/login', query: { next: pathname } }}
                  className={linkClasses('/auth/login')}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href={{ pathname: '/register', query: { next: pathname } }}
                  className={linkClasses('/register')}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
