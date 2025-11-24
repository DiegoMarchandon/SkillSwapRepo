'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/axios';
import { toast } from 'react-hot-toast'; // 👈 ajustá este import si usás otra lib

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// normaliza el usuario para que siempre tenga is_admin boolean
function normalizeUser(u) {
  if (!u) return null;
  return {
    ...u,
    is_admin: !!(u.is_admin ?? u.isAdmin ?? u.admin), // por si el backend usa otro nombre
  };
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t) => {
    if (t) {
      localStorage.setItem('token', t);
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  // Boot
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!t) {
      setLoading(false);
      return;
    }

    setToken(t);
    (async () => {
      try {
        let u = null;
        try {
          const { data } = await api.get('/me');
          u = data?.user ?? data ?? null;
        } catch {
          const { data } = await api.get('/user');
          u = data?.user ?? data ?? null;
        }
        setUser(normalizeUser(u));
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [setToken]);

  /**
   * login(user, token, { redirect, message, showWelcome })
   * También soporta:
   *   login(user)
   *   login(user, { redirect, ...opts })
   */
  const login = useCallback(
    (u, tokenOrOpts, maybeOpts) => {
      let token = null;
      let opts = {};

      // Soportar tanto login(user, token, opts) como login(user, opts)
      if (typeof tokenOrOpts === 'string' || tokenOrOpts == null) {
        token = tokenOrOpts ?? null;
        opts = maybeOpts ?? {};
      } else {
        token = null;
        opts = tokenOrOpts ?? {};
      }

      if (token) setToken(token);

      const normalized = normalizeUser(u);
      setUser(normalized);

      // 🔔 Toast de bienvenida (se puede apagar con showWelcome: false)
      const nombre =
        normalized?.name ||
        normalized?.nombre ||
        normalized?.email ||
        '';

      if (opts.showWelcome !== false) {
        toast.success(
          opts.message ?? `¡Bienvenido/a ${nombre || 'a SkillSwap'}!`
        );
      }

      const mustRedirect = opts.redirect ?? false;
      const to = typeof mustRedirect === 'string' ? mustRedirect : '/';

      if (mustRedirect) {
        router.replace(to);
        router.refresh();
      }
    },
    [router, setToken]
  );

  // logout({ redirect })
  const logout = useCallback(
    async (opts = {}) => {
      try {
        await api.post('/logout');
      } catch {
        // ignoramos error de logout, igual limpiamos
      }
      setToken(null);
      setUser(null);

      const to = typeof opts.redirect === 'string' ? opts.redirect : '/';
      router.replace(to);
      router.refresh();
    },
    [router, setToken]
  );

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
