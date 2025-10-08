import InstructorCalendar from '../../../components/calendario/InstructorCalendar';

export default async function InstructorPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;

  const instructorId = Number(id);
  // skill puede venir como string o array
  const skillRaw = sp?.skill;
  const skillStr = Array.isArray(skillRaw) ? skillRaw[0] : skillRaw;
  const skillId = skillStr ? Number(skillStr) : null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-2">Perfil del Instructor #{instructorId}</h1>
      <p className="text-gray-500">Elegí un horario disponible para agendar tu sesión.</p>


      <InstructorCalendar instructorId={instructorId} skillId={skillId} />
    </main>
  );
}
