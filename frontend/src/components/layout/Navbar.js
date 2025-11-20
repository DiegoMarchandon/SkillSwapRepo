// 'use client';
// import Link from 'next/link';
// import { useAuth } from '../../context/AuthContext';
// import { useNotifications } from '../../context/NotificacionesContext';

// function Bell() {
//   const { unread = 0 } = useNotifications() ?? {};
//   const count = Math.min(unread, 99);
//   return (
//     <Link
//       href="/mi/notificaciones"
//       className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10"
//       aria-label="Notificaciones"
//     >
//       <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
//         <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
//         <path d="M9 17a3 3 0 0 0 6 0" />
//       </svg>
//       {count > 0 && (
//         <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-[18px] text-center">
//           {count}
//         </span>
//       )}
//     </Link>
//   );
// }

// export default function Navbar() {
//   const { user, logout, loading } = useAuth();
//   if (loading) return <nav className="w-full bg-gray-900 text-white px-6 py-4">Loading…</nav>;

//   return (
//     <nav className="w-full bg-gray-900 text-white px-6 py-4">
//       <ul className="flex justify-center items-center gap-4">
//         <li><Link href="/">Inicio</Link></li>
//         <li><Link href="/search">Aprender Habilidad</Link></li>
//         {user && <li><Link href="/perfil/habilidades">Mis habilidades</Link></li>}
 
//         {user ? (
//           <>
//             <li><Bell /></li>
//             <li><Link href="/perfil">Mi perfil</Link></li>
//             <li>
//               <button onClick={logout} className="rounded bg-red-600 px-3 py-1">
//                 Cerrar sesión
//               </button>
//             </li>
//           </>
//         ) : (
//           <>
//             <li><Link href="/login">Iniciar sesión</Link></li>
//             <li><Link href="/register">Registrarse</Link></li>
//           </>
//         )}
//       </ul>
//     </nav>
//   );
// }
