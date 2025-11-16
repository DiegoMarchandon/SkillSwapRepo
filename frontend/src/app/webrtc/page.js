import { Suspense } from 'react';
import WebrtcClient from './WebrtcClient';

export const dynamic = 'force-dynamic'; // evita prerender en build

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Cargando sala…</div>}>
      <WebrtcClient />
    </Suspense>
  );
}
