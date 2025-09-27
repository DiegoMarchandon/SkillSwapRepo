'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user: userCtx, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [u, setU] = useState({ name: '', email: '' });
  const [initialU, setInitialU] = useState({ name: '', email: '' });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [fieldErrs, setFieldErrs] = useState({});

  const [pwd, setPwd] = useState({ current_password:'', password:'', password_confirmation:'' });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdErr, setPwdErr] = useState(null);

  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Mostrar aviso cuando se llega con ?ok=registro
  const [showReg, setShowReg] = useState(false);

  const loadMe = async () => {
    try {
      const { data } = await api.get('/api/user');
      const next = { name: data.name || '', email: data.email || '' };
      setU(next);
      setInitialU(next);
      // if (data.avatar_url) setAvatarPreview(data.avatar_url);
    } catch (e) {
      if (e.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMe(); }, [router]);

  useEffect(() => {
    if (userCtx && (userCtx.name || userCtx.email)) {
      const next = { name: userCtx.name ?? '', email: userCtx.email ?? '' };
      setU(next);
      setInitialU(next);
    }
  }, [userCtx]);

  // Detecta ?ok=registro, limpia la URL y auto-oculta el banner
  useEffect(() => {
    if (searchParams.get('ok') === 'registro') {
      setShowReg(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('ok');
      router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`, { scroll: false });
      const t = setTimeout(() => setShowReg(false), 4000);
      return () => clearTimeout(t);
    }
  }, [searchParams, pathname, router]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const onRestore = () => {
    setU(initialU);
    setAvatarFile(null);
    setAvatarPreview(null);
    setFieldErrs({});
    setErr(null);
    setMsg(null);
  };

  const onSubmitProfile = async (e) => {
    e.preventDefault();
    setMsg(null); setErr(null); setFieldErrs({});

    if (!u.name.trim()) { setFieldErrs({ name: ['El nombre es obligatorio'] }); return; }
    if (!/^\S+@\S+\.\S+$/.test(u.email)) { setFieldErrs({ email: ['Email inválido'] }); return; }

    setSaving(true);
    try {
      let res;
      if (avatarFile) {
        const form = new FormData();
        form.append('name', u.name);
        form.append('email', u.email);
        form.append('avatar', avatarFile);
        res = await api.put('/api/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.put('/api/profile', { name: u.name, email: u.email });
      }

      setMsg('Perfil actualizado');
      toast.success('Perfil actualizado');
      setUser(prev => ({ ...(prev ?? {}), name: res.data.user.name, email: res.data.user.email }));
      setAvatarFile(null);
      // if (res.data.avatar_url) setAvatarPreview(res.data.avatar_url);
    } catch (e) {
      if (e.response?.status === 422) {
        const er = e.response.data.errors || {};
        setFieldErrs(er);
        setErr(null);
      } else {
        setErr('No se pudo actualizar el perfil');
        toast.error('No se pudo actualizar el perfil');
      }
    } finally {
      setSaving(false);
    }
  };

  const onSubmitPassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null); setPwdErr(null);

    if (!pwd.current_password || !pwd.password || !pwd.password_confirmation) {
      setPwdErr('Completá todos los campos');
      return;
    }
    if (pwd.password !== pwd.password_confirmation) {
      setPwdErr('La confirmación no coincide');
      return;
    }

    setSavingPwd(true);
    try {
      const { data } = await api.put('/api/password', pwd);
      setPwdMsg('Contraseña actualizada');
      toast.success('Contraseña actualizada');
      setPwd({ current_password:'', password:'', password_confirmation:'' });

      if (data?.relogin) {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
      }
    } catch (e) {
      if (e.response?.status === 422) {
        const er = e.response.data.errors || {};
        setPwdErr(Object.values(er)[0]?.[0] || 'Datos inválidos');
      } else if (e.response?.status === 403) {
        setPwdErr('Contraseña actual incorrecta');
      } else {
        setPwdErr('No se pudo actualizar la contraseña');
      }
      toast.error('No se pudo actualizar la contraseña');
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) return <div className="p-6">Cargando…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-gray-900 rounded-2xl shadow">
      <section className="rounded-2xl bg-white p-6 shadow">
        {showReg && (
          <div className="mb-3 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-green-800 text-sm">
            Registro exitoso. ¡Bienvenido!
          </div>
        )}

        <h2 className="mb-4 text-xl font-semibold">Perfil</h2>

        {msg && <div className="mb-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}
        {err && <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

        <form onSubmit={onSubmitProfile} className="grid gap-3">
          <label className="text-sm">Nombre</label>
          <input
            className="rounded border p-2"
            value={u.name}
            onChange={(e) => setU(s => ({ ...s, name: e.target.value }))}
          />
          {fieldErrs.name && <p className="text-xs text-red-600">{fieldErrs.name[0]}</p>}

          <label className="text-sm">Email</label>
          <input
            className="rounded border p-2"
            value={u.email}
            onChange={(e) => setU(s => ({ ...s, email: e.target.value }))}
          />
          {fieldErrs.email && <p className="text-xs text-red-600">{fieldErrs.email[0]}</p>}

          <label className="text-sm">Avatar (opcional)</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {avatarPreview && (
            <img src={avatarPreview} alt="preview" className="mt-2 h-20 w-20 rounded-full object-cover border" />
          )}
          {fieldErrs.avatar && <p className="text-xs text-red-600">{fieldErrs.avatar[0]}</p>}

          <div className="mt-2 flex gap-2">
            <button
              disabled={saving}
              className={`rounded bg-blue-600 px-4 py-2 text-white ${saving ? 'opacity-60' : ''}`}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={onRestore}
              className="rounded bg-gray-200 px-4 py-2"
            >
              Restaurar
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Cambiar contraseña</h2>

        {pwdMsg && <div className="mb-3 rounded bg-green-50 px-3 py-2 text-sm text-green-700">{pwdMsg}</div>}
        {pwdErr && <div className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{pwdErr}</div>}

        <form onSubmit={onSubmitPassword} className="grid gap-3">
          <label className="text-sm">Contraseña actual</label>
          <input
            type="password"
            className="rounded border p-2"
            value={pwd.current_password}
            onChange={(e) => setPwd(s => ({ ...s, current_password: e.target.value }))}
          />

          <label className="text-sm">Nueva contraseña</label>
          <input
            type="password"
            className="rounded border p-2"
            value={pwd.password}
            onChange={(e) => setPwd(s => ({ ...s, password: e.target.value }))}
          />

          <label className="text-sm">Confirmar nueva contraseña</label>
          <input
            type="password"
            className="rounded border p-2"
            value={pwd.password_confirmation}
            onChange={(e) => setPwd(s => ({ ...s, password_confirmation: e.target.value }))}
          />

          <button
            disabled={savingPwd}
            className={`mt-2 rounded bg-blue-600 px-4 py-2 text-white ${savingPwd ? 'opacity-60' : ''}`}
          >
            {savingPwd ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>
    </div>
  );
}
