'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import UserSessions from '../../components/admin/UserSessions';
import UsersList from '../../components/admin/UsersList';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 🚧 Guard de acceso
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login');
      else if ((user.rol ?? '') !== 'admin') router.replace('/');
    }
  }, [user, loading, router]);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [view, setView] = useState('users'); // 'users' | 'sessions'

  useEffect(() => {
    if (!loading && user && (user.rol ?? '') === 'admin') loadUsers();
  }, [loading, user]);

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadUserSessions(userId) {
    try {
      setSessionsLoading(true);
      const { data } = await api.get(`/admin/users/${userId}/sessions`);
      setSelectedUser(users.find(u => u.id === userId) ?? null);
      setUserSessions(data);
      setView('sessions');
    } catch (error) {
      console.error('Error loading user sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  }

  function handleBackToUsers() {
    setView('users');
    setSelectedUser(null);
    setUserSessions([]);
  }

  if (loading || !user || (user.rol ?? '') !== 'admin') return null;

  if (loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {view === 'users' ? 'Gestión de Usuarios' : `Historial de ${selectedUser?.name ?? ''}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {view === 'users'
                ? 'Administra y visualiza la actividad de los usuarios'
                : `Sesiones y métricas de ${selectedUser?.name ?? ''}`}
            </p>
          </div>

          {view === 'sessions' && (
            <button
              onClick={handleBackToUsers}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              ← Volver a usuarios
            </button>
          )}
        </div>
      </div>

      {view === 'users' ? (
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
  );
}
