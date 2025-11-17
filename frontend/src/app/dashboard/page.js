'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import Header from '../../components/layout/Header';
import UserSessions from '../../components/admin/UserSessions';
import UsersList from '../../components/admin/UsersList';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdmin = ((user?.rol ?? '') === 'admin') || !!user?.is_admin;

  // 🚧 Guard de acceso
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [user, loading, isAdmin, router]);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [view, setView] = useState('users'); // 'users' | 'sessions'

  useEffect(() => {
    if (!loading && user && isAdmin) {
      loadUsers();
    }
  }, [loading, user, isAdmin]);

  // normaliza cualquier respuesta a array
  function normalizeArrayPayload(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.sessions)) return data.sessions;
    return [];
  }

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      const { data } = await api.get('/admin/users');
      const list = normalizeArrayPayload(data);
      setUsers(list);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadUserSessions(userId) {
    try {
      setSessionsLoading(true);
      const { data } = await api.get(`/admin/users/${userId}/sessions`);
      const list = normalizeArrayPayload(data);

      setSelectedUser(users.find((u) => u.id === userId) ?? null);
      setUserSessions(list);
      setView('sessions');
    } catch (error) {
      console.error('Error loading user sessions:', error);
      setUserSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }

  function handleBackToUsers() {
    setView('users');
    setSelectedUser(null);
    setUserSessions([]);
  }

  // mientras resuelve el guard no renderizamos nada
  if (loading || !user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-slate-100">
      <Header />

      <main className="mx-auto max-w-6xl p-6">
        <div className="border-[3px] border-cyan-300 bg-slate-900 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          {/* Header del panel */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black bg-slate-800 px-4 py-3">
            <div>
              <h1 className="font-pixel tracking-[0.15em] uppercase text-sm md:text-base">
                {view === 'users'
                  ? 'Gestión de usuarios'
                  : `Historial de ${selectedUser?.name ?? ''}`}
              </h1>
              <p className="mt-1 text-xs md:text-sm text-slate-300">
                {view === 'users'
                  ? 'Administra y visualiza la actividad de los usuarios.'
                  : `Sesiones y métricas de ${selectedUser?.name ?? ''}.`}
              </p>
            </div>

            {view === 'sessions' && (
              <button
                onClick={handleBackToUsers}
                className="
                  border-[2px] border-cyan-300 bg-slate-900 px-3 py-1
                  text-[10px] md:text-xs font-pixel uppercase tracking-[0.12em]
                  hover:bg-slate-800 hover:translate-x-[1px] hover:translate-y-[1px]
                  active:translate-x-[2px] active:translate-y-[2px]
                  shadow-[3px_3px_0_0_rgba(0,0,0,1)]
                "
              >
                ← Volver a usuarios
              </button>
            )}
          </div>

          {/* Contenido */}
          <div className="p-4 md:p-5">
            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="h-8 w-8 border-2 border-cyan-300 border-b-transparent rounded-full animate-spin" />
                <p className="text-xs md:text-sm text-slate-300">
                  Cargando usuarios…
                </p>
              </div>
            ) : view === 'users' ? (
              <UsersList
                users={users}
                onViewSessions={loadUserSessions}
                setSelectedUser={setSelectedUser}
              />
            ) : (
              <UserSessions
                user={selectedUser}
                sessions={userSessions}
                loading={sessionsLoading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
