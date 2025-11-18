'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PixelCornerButtons from './PixelCornerButtons';

const tabs = [
  { href: '/perfil', label: 'Datos' },
  { href: '/perfil/habilidades', label: 'Habilidades' },
  { href: '/perfil/preferencias', label: 'Preferencias' },
];

export default function Subnavbar({actualTab}) {
  const pathname = usePathname();
  return (
    <div className="relative sticky top-15 z-40 mx-auto w-full backdrop-blur-md bg-white/20 border border-white/30  shadow-lg">
        <p className="perfil-title relative text-xl top-5 select-none font-semibold">
            Perfil &nbsp; &nbsp; 
            <span className="vertical-line">|</span>
        </p>
      <nav className="mb-4 flex flex-wrap justify-center gap-3">
        {tabs.map((t) => {
        const active = pathname === t.href;
        return (
            <PixelCornerButtons
              key={t.href}
              href={t.href}
              active={active}
              label={t.label}
              actualTab={actualTab}
            />
          );
        })}
      </nav>
    </div>
  );
}
