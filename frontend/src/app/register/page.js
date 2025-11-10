import RegisterClient from './RegisterClient';

export const metadata = { title: 'Crear cuenta | SkillSwap' };

export default function Page({ searchParams }) {
  // saneamos ?next= para evitar open-redirects
  const rawNext = typeof searchParams?.next === 'string' ? searchParams.next : '';
  const next = rawNext.startsWith('/') ? rawNext : '/perfil';

  return <RegisterClient next={next} />;
}
