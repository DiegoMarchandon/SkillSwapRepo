import InstructorCalendar from '../../../components/calendario/InstructorCalendar';

export default async function InstructorPage({ params, searchParams }) {
  
  // Await params antes de usarlo
  const { id } = await params;
  const searchParamsObj = await searchParams;

  const instructorId = Number(id);
  const skillRaw = searchParamsObj?.skill;
  const skillId = Array.isArray(skillRaw) ? Number(skillRaw[0]) : (skillRaw ? Number(skillRaw) : null);

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-2">Perfil del Instructor #{instructorId}</h1>
      <p className="text-gray-500">Elegí un horario disponible para agendar tu sesión.</p>
      <InstructorCalendar instructorId={instructorId} skillId={skillId} />
    </main>
  );
}

