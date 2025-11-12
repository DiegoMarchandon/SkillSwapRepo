'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/perfil', label: 'Datos' },
  { href: '/perfil/habilidades', label: 'Habilidades' },
  { href: '/perfil/preferencias', label: 'Preferencias' },
];

export default function PerfilLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="relative z-30 mx-auto max-w-5xl p-6">
      <nav className="mb-6 flex gap-2">
        {tabs.map(t => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-full px-4 py-2 border ${
                active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-300'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
