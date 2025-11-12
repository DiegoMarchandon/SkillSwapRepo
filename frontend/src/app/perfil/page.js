'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import PixelDNI from '../../components/perfil/PixelDNI';
import PasswordDialog from '../../components/perfil/PasswordDialog';
import LavaLampBackground from '../../components/perfil/LavaLampBackground';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user: userCtx, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [u, setU] = useState({ name: '', email: '', id: '' });
  const [initialU, setInitialU] = useState({ name: '', email: '',id:'' });

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
      const { data } = await api.get('/user');
      const next = { name: data.name || '', email: data.email || '', id: data.id };
      setU(next);
      setInitialU(next);
      if (data.avatar_path){
        setAvatarPreview(`${process.env.NEXT_PUBLIC_API_URL}${data.avatar_path}`);
      } else {
        // Si no tiene avatar, podemos mostrar uno por defecto
        setAvatarPreview('/default-avatar.svg');
      }

    } catch (e) {
      if (e.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMe(); }, [router]);

  useEffect(() => {
    if (userCtx && (userCtx.name || userCtx.email)) {
      const next = { name: userCtx.name ?? '', email: userCtx.email ?? '', id: userCtx.id ?? '' };
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
        // si hay un archivo, lo enviamos como formData
        const form = new FormData();
        form.append('name', u.name);
        form.append('email', u.email);
        form.append('avatar', avatarFile);
        form.append('id',u.id);
        res = await api.put('/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.put('/profile', { name: u.name, email: u.email });
      }

      setMsg('Perfil actualizado');
      toast.success('Perfil actualizado');
      setUser(prev => ({ ...(prev ?? {}), name: res.data.user.name, email: res.data.user.email, id: res.data.user.id }));
      
      // actualizamos el preview del nuevo avatar si se devolvió en la respuesta
      if(res.data.user.avatar_path){
        setAvatarPreview(`${process.env.NEXT_PUBLIC_API_URL}${res.data.user.avatar_path}`);
      }
      
      setAvatarFile(null);
      // console.log("SUCCESS", res.status, res.data);

    } catch (e) {
      console.log("ERROR", e, e);
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
    if ((pwd.password === pwd.password_confirmation) && pwd.password.length < 8) {
      setPwdErr('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSavingPwd(true);
    try {
      const { data } = await api.put('/password', pwd);
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
    <div className="relative min-h-screen flex flex-col bg-gray-900">
      <Header />
      <div className="relative z-20 max-w-4xl mx-auto p-6 w-full">
        {/* LavaLampBackground dentro del contenedor pero posicionado absolutamente para cubrir toda la pantalla */}
        <div className="fixed inset-0 -z-50">
          <LavaLampBackground />
        </div>
        
        <section className="rounded-2xl p-6 shadow relative z-20 bg-transparent">
          {showReg && (
            <div className="mb-3 rounded-md border border-green-300 bg-green-50/10 px-3 py-2 text-green-300 text-sm">
              Registro exitoso. ¡Bienvenido!
            </div>
          )}
  
          <h2 className="mb-4 text-xl font-semibold text-white">Perfil</h2>
          {msg && <div className="mb-3 rounded bg-green-50/10 px-3 py-2 text-sm text-green-300">{msg}</div>}
          {err && <div className="mb-3 rounded bg-red-50/10 px-3 py-2 text-sm text-red-300">{err}</div>}
  
          <PixelDNI
            u={u}
            onSubmitProfile={onSubmitProfile}
            setU={setU}
            fieldErrs={fieldErrs}
            saving={saving}
            onRestore={onRestore}
            avatarPreview={avatarPreview}
          />
        </section>
  
        <PasswordDialog
          pwd={pwd}
          setPwd={setPwd}
          onSubmitPassword={onSubmitPassword}
          savingPwd={savingPwd}
          pwdMsg={pwdMsg}
          pwdErr={pwdErr}
        />
      </div>
    </div>
);
  
  
}
