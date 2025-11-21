'use client';

import { useState } from 'react';
import api from '@/utils/axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ContactoPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre || !email || !mensaje) {
      toast.error('Completá nombre, email y mensaje.');
      return;
    }

    setSending(true);
    try {
      await api.post('/contact', {
        nombre,
        email,
        asunto,
        mensaje,
      });

      toast.success('Mensaje enviado. ¡Gracias por contactarnos!');
      setNombre('');
      setEmail('');
      setAsunto('');
      setMensaje('');
    } catch (err) {
      console.log('Error contacto', err?.response?.status, err?.response?.data);
      toast.error(
        err?.response?.data?.message || 'No se pudo enviar el mensaje. Probá de nuevo.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* volver / título */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-sans"
        >
          <span className="text-sm">←</span>
          Volver al inicio
        </Link>

        <h1 className="mt-4 font-pixel text-2xl md:text-3xl tracking-[0.18em] uppercase text-slate-50">
          Contacto
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-300 font-sans">
          ¿Tenés consultas sobre SkillSwap, sugerencias o encontraste algún error? Escribinos y
          te respondemos a la brevedad.
        </p>
      </div>

      {/* formulario */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-slate-900/80 border border-slate-800 px-4 py-5 md:px-6 md:py-6 rounded-lg shadow-[4px_4px_0_#020617]"
      >
        <div>
          <label className="block text-xs text-slate-300 mb-1 font-pixel tracking-[0.14em] uppercase">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-50 text-sm rounded-md focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-pixel tracking-[0.14em] uppercase">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-50 text-sm rounded-md focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-pixel tracking-[0.14em] uppercase">
            Asunto (opcional)
          </label>
          <input
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-50 text-sm rounded-md focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1 font-pixel tracking-[0.14em] uppercase">
            Mensaje
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-slate-50 text-sm rounded-md focus:outline-none focus:border-cyan-400 resize-y"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={sending}
            className="
              font-pixel
              border-2 border-[#0f172a] bg-[#cde8ff] text-[#0b0c10]
              px-4 py-[6px] text-[11px] md:text-xs tracking-[0.16em] uppercase
              rounded-none
              shadow-[3px_3px_0_0_rgba(15,23,42,1)]
              hover:bg-[#bfe0ff] hover:translate-x-[1px] hover:translate-y-[1px]
              active:translate-x-[2px] active:translate-y-[2px]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {sending ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </div>
      </form>
    </main>
  );
}
