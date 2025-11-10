import LoginClient from './LoginClient';

export const metadata = { title: 'Iniciar sesión | SkillSwap' };

export default function Page({ searchParams }) {
  const rawNext = typeof searchParams?.next === 'string' ? searchParams.next : '';
  const next = rawNext.startsWith('/') ? rawNext : '/perfil';
  return <LoginClient next={next} />;
}
