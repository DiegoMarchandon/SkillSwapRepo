'use client';


import Link from 'next/link';
import Navbar from "./Navbar";
import { useAuth } from '../../context/AuthContext';

function Header(){
  const {user} = useAuth();
  return(
    <header className="w-full text-sm bg-slate-400">
      <div className="flex items-center justify-between px-4 py-2">
        <h1 style={{ fontFamily:'VT323' }} className="text-2xl font-bold">
          Bienvenido {user?.name || 'Usuario'} a SkillSwap!
        </h1>
        <nav className="flex gap-3">
          <Link className="hover:underline" href="/mi/disponibilidad">Mi disponibilidad</Link>
          <Link className="hover:underline" href="/mi/reservas">Mis reservas</Link>
        </nav>
      </div>
      <Navbar />
    </header>
  );
}

export default Header;
