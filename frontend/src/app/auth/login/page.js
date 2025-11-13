import LoginClient from './LoginClient';

export const metadata = { title: 'Iniciar sesión | SkillSwap' };

export default async function Page({ searchParams }) {
  const rawNext = typeof (await searchParams)?.next === 'string' ? (await searchParams).next : '';
  const next = rawNext.startsWith('/') ? rawNext : '/perfil';
  return <LoginClient next={next} />;
}
