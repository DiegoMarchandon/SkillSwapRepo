'use client';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full bg-[#0d1220] text-[#e6f3ff]">
      {/* marco pixel */}
      <div className="mx-auto max-w-6xl px-4 py-8 pixel-shadow">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="font-pixel text-lg text-[#cde8ff]">SkillSwap</div>
            <p className="mt-3 text-sm text-[#a7c6ec]">
              Intercambiá habilidades por <span className="text-[#67e8f9]">tiempo</span>, no por dinero.
            </p>
          </div>

          {/* Navegación */}
          <nav className="grid grid-cols-2 gap-4 text-sm md:grid-cols-1">
            <div>
              <div className="mb-2 font-pixel text-xs uppercase text-[#cde8ff] tracking-wide">Explorar</div>
              <ul className="space-y-1">
                <li><Link href="/" className="hover:underline underline-offset-4 text-[#9ae6ff]">Inicio</Link></li>
                <li><Link href="/search" className="hover:underline underline-offset-4 text-[#9ae6ff]">Aprender Habilidad</Link></li>
                <li><Link href="/skills" className="hover:underline underline-offset-4 text-[#9ae6ff]">Mis habilidades</Link></li>
              </ul>
            </div>
            <div>
              <div className="mb-2 font-pixel text-xs uppercase text-[#cde8ff] tracking-wide">Cuenta</div>
              <ul className="space-y-1">
                <li><Link href="/perfil" className="hover:underline underline-offset-4 text-[#9ae6ff]">Mi perfil</Link></li>
                <li><Link href="/disponibilidad" className="hover:underline underline-offset-4 text-[#9ae6ff]">Mi disponibilidad</Link></li>
                <li><Link href="/reservas" className="hover:underline underline-offset-4 text-[#9ae6ff]">Mis reservas</Link></li>
              </ul>
            </div>
          </nav>

          {/* Info / Soporte */}
          <div className="text-sm">
            <div className="mb-2 font-pixel text-xs uppercase text-[#cde8ff] tracking-wide">Soporte</div>
            <ul className="space-y-1">
              <li><Link href="/faq" className="hover:underline underline-offset-4 text-[#9ae6ff]">Preguntas frecuentes</Link></li>
              <li><Link href="/contacto" className="hover:underline underline-offset-4 text-[#9ae6ff]">Contacto</Link></li>
              <li><Link href="/terminos" className="hover:underline underline-offset-4 text-[#9ae6ff]">Términos y privacidad</Link></li>
            </ul>

            {/* Social (opcional) */}
            <div className="mt-4 flex gap-3 text-[#9ae6ff]">
              <a href="#" aria-label="Twitter" className="hover:underline underline-offset-4">🐦</a>
              <a href="#" aria-label="GitHub" className="hover:underline underline-offset-4">💻</a>
              <a href="#" aria-label="LinkedIn" className="hover:underline underline-offset-4">💼</a>
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="mt-8 border-t-2 border-[#0f172a] pt-4 text-xs text-[#a7c6ec]">
          © {year} SkillSwap · Hecho con <span aria-hidden>💙</span>
        </div>
      </div>
    </footer>
  );
}
