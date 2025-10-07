import InstructorCalendar from '../../../components/calendario/InstructorCalendar';

export default async function InstructorPage({ params }) {
  const { id } = await params;   // ← importante en Next 15
  const instructorId = Number(id);
  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Perfil del Instructor #{instructorId}</h1>
        <p className="text-gray-500">Elegí un horario disponible para agendar tu sesión.</p>
      </div>
      <InstructorCalendar instructorId={instructorId} />
    </main>
  );
}

