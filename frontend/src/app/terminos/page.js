import Link from 'next/link';

export default function TerminosPrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* volver */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-sans"
        >
          <span className="text-sm">←</span>
          Volver al inicio
        </Link>
      </div>

      {/* título principal */}
      <header className="mb-6 space-y-2">
        <h1 className="font-pixel text-2xl md:text-3xl tracking-[0.18em] uppercase text-slate-50">
          Términos de uso y
          <br className="hidden md:block" /> Política de privacidad
        </h1>
        <p className="text-sm md:text-base text-slate-300 font-sans">
          Este documento explica las reglas de uso de SkillSwap y cómo tratamos tus datos
          personales. Al usar la plataforma, aceptás estos términos.
        </p>

        {/* <p className="text-[11px] text-slate-500 font-sans">
          * Modelo orientado a un trabajo práctico / proyecto educativo. Si se usa en un proyecto
          productivo, debe ser revisado por un profesional legal.
        </p> */}
        
      </header>

      <section className="space-y-8 text-sm text-slate-200 font-sans leading-relaxed">
        {/* --- TÉRMINOS DE USO --- */}
        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-cyan-300 mb-2">
            1. ¿Qué es SkillSwap?
          </h2>
          <p>
            SkillSwap es una plataforma web que permite conectar personas que quieren enseñar una
            habilidad con personas que quieren aprenderla. La plataforma facilita la publicación de
            habilidades, la coordinación de horarios y la reserva de sesiones entre usuarios.
          </p>
        </section>

        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-cyan-300 mb-2">
            2. Aceptación de los términos
          </h2>
          <p>
            Al registrarte y usar SkillSwap, declarás que leíste, entendiste y aceptás estos
            Términos de uso y la Política de privacidad. Si no estás de acuerdo, no deberías usar
            la plataforma.
          </p>
        </section>

        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-cyan-300 mb-2">
            3. Registro y cuenta de usuario
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Debés proporcionar información verdadera, actual y completa al registrarte.</li>
            <li>Sos responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>
              Sos responsable de todas las actividades que se realicen utilizando tu cuenta. Si
              detectás un uso no autorizado, debés avisarnos.
            </li>
            <li>
              SkillSwap puede suspender o cancelar cuentas que incumplan estos términos o hagan un
              uso inadecuado de la plataforma.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-cyan-300 mb-2">
            4. Uso de la plataforma
          </h2>
          <p>Al usar SkillSwap, te comprometés a:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Respetar a otros usuarios y mantener una comunicación cordial.</li>
            <li>No publicar contenidos ofensivos, discriminatorios, violentos o ilegales.</li>
            <li>No utilizar la plataforma para spam, fraudes o actividades ilícitas.</li>
            <li>
              No intentar acceder, modificar o interferir con secciones del sistema a las que no
              tengas permiso.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-cyan-300 mb-2">
            5. Reservas y sesiones
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              SkillSwap facilita el contacto y la coordinación de horarios entre personas
              instructoras y personas que aprenden.
            </li>
            <li>
              Salvo que se indique lo contrario, la plataforma no forma parte del acuerdo directo
              entre usuarios (por ejemplo, calidad de la clase, asistencia, puntualidad, etc.).
            </li>
            <li>
              Cada usuario es responsable de cumplir con la sesión reservada y respetar los
              acuerdos de cancelación o reprogramación que se definan.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-cyan-300 mb-2">
            6. Contenido generado por usuarios
          </h2>
          <p>
            El contenido que publiques en SkillSwap (descripciones de habilidades, mensajes, etc.)
            sigue siendo tuyo, pero nos otorgás una licencia limitada para mostrarlo dentro de la
            plataforma con el fin de prestar el servicio.
          </p>
          <p className="mt-2">
            Podemos eliminar o moderar contenido que incumpla estos términos o que consideremos
            inapropiado.
          </p>
        </section>

        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-cyan-300 mb-2">
            7. Limitación de responsabilidad
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              SkillSwap se ofrece “tal cual es”, en el contexto de un proyecto educativo /
              demostrativo.
            </li>
            <li>
              No garantizamos la disponibilidad ininterrumpida del servicio ni la ausencia total de
              errores.
            </li>
            <li>
              En ningún caso seremos responsables por daños indirectos, pérdida de datos o cualquier
              otro perjuicio derivado del uso o imposibilidad de uso de la plataforma.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-cyan-300 mb-2">
            8. Modificaciones de los términos
          </h2>
          <p>
            Podemos actualizar estos términos para reflejar cambios en la plataforma. Cuando lo
            hagamos, podremos indicar la fecha de última actualización y, si corresponde, avisar a
            los usuarios registrados.
          </p>
        </section>

        {/* --- POLÍTICA DE PRIVACIDAD --- */}
        <section className="pt-4 border-t border-slate-800">
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-emerald-300 mb-2">
            9. Datos personales y privacidad
          </h2>
          <p>
            SkillSwap trata tus datos personales de forma responsable y los utiliza solo para los
            fines relacionados con la prestación de la plataforma.
          </p>
        </section>

        <section>
          <h3 className="font-pixel text-[13px] tracking-[0.16em] uppercase text-emerald-300 mb-1">
            9.1. Datos que recopilamos
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Datos de registro: nombre, dirección de correo electrónico y contraseña.</li>
            <li>
              Información de perfil: habilidades que ofrecés o querés aprender, disponibilidad
              horaria, breve descripción, etc.
            </li>
            <li>
              Datos de uso: reservas realizadas, mensajes básicos asociados a coordinar sesiones y
              actividad dentro de la plataforma.
            </li>
            <li>
              Datos técnicos: dirección IP aproximada, tipo de navegador, información básica de
              dispositivo (a través de herramientas estándar como logs del servidor).
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-pixel text-[13px] tracking-[0.16em] uppercase text-emerald-300 mb-1">
            9.2. Para qué usamos tus datos
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Crear y administrar tu cuenta de SkillSwap.</li>
            <li>Mostrar tu perfil y habilidades a otros usuarios, cuando corresponda.</li>
            <li>Permitir reservas y coordinación de sesiones.</li>
            <li>Enviar notificaciones relacionadas con la cuenta y las reservas.</li>
            <li>Mejorar la seguridad, el rendimiento y la experiencia general de la plataforma.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-pixel text-[13px] tracking-[0.16em] uppercase text-emerald-300 mb-1">
            9.3. Base legal del tratamiento
          </h3>
          <p>
            La base principal para tratar tus datos es la prestación del servicio que solicitás al
            registrarte y usar SkillSwap. En algunos casos también podemos basarnos en tu
            consentimiento (por ejemplo, para comunicaciones opcionales) o en intereses legítimos
            relacionados con la mejora y la seguridad de la plataforma.
          </p>
        </section>

        <section>
          <h3 className="font-pixel text-[13px] tracking-[0.16em] uppercase text-emerald-300 mb-1">
            9.4. Con quién compartimos tus datos
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Con otros usuarios, en la medida necesaria para que puedan ver tu perfil y coordinar
              sesiones con vos.
            </li>
            <li>
              Con proveedores de servicios técnicos (hosting, herramientas de envío de correo, etc.),
              que solo pueden usar los datos siguiendo nuestras instrucciones.
            </li>
            <li>
              Cuando una norma legal lo exija, o una autoridad competente lo solicite de forma
              válida.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-pixel text-[13px] tracking-[0.16em] uppercase text-emerald-300 mb-1">
            9.5. Conservación de los datos
          </h3>
          <p>
            Conservamos tus datos mientras tengas una cuenta activa y durante un tiempo razonable
            después, para poder responder ante consultas o cumplir obligaciones legales básicas.
            Podés solicitar la eliminación de tu cuenta, y haremos lo posible por borrar o
            anonimizar tus datos personales, salvo que la ley nos exija conservarlos.
          </p>
        </section>

        <section>
          <h3 className="font-pixel text-[13px] tracking-[0.16em] uppercase text-emerald-300 mb-1">
            9.6. Tus derechos sobre tus datos
          </h3>
          <p>Tenés derecho, según la normativa aplicable, a:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Acceder a los datos personales que tenemos sobre vos.</li>
            <li>Solicitar la rectificación de datos incorrectos o incompletos.</li>
            <li>Solicitar la eliminación de tus datos, en ciertos casos.</li>
            <li>
              Oponerte a determinados tratamientos o solicitar la limitación del uso de tus datos.
            </li>
          </ul>
          <p className="mt-2">
            Para ejercer estos derechos, podés contactarnos a través del formulario de contacto de
            la plataforma.
          </p>
        </section>

        <section>
          <h3 className="font-pixel text-[13px] tracking-[0.16em] uppercase text-emerald-300 mb-1">
            9.7. Cookies y tecnologías similares
          </h3>
          <p>
            SkillSwap puede utilizar cookies técnicas y de sesión para recordar tu inicio de
            sesión, mantener tus preferencias y mejorar el funcionamiento general del sitio. En esta
            versión del proyecto no se utilizan cookies con fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="font-pixel text-lg tracking-[0.16em] uppercase text-emerald-300 mb-2">
            10. Contacto
          </h2>
          <p>
            Si tenés dudas sobre estos Términos de uso o la Política de privacidad, podés escribirnos
            a través de la sección{' '}
            <Link href="/contacto" className="underline text-cyan-300 hover:text-cyan-200">
              Contacto
            </Link>{' '}
            en la plataforma.
          </p>
        </section>
      </section>
    </main>
  );
}
