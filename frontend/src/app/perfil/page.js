import { Suspense } from 'react';
import PerfilClient from './PerfilClient';

export const dynamic = 'force-dynamic'; // evita prerender/SSR rígido

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Cargando perfil…</div>}>
      <PerfilClient />
    </Suspense>
  );
}
