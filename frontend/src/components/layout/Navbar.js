
export default function Navbar(){
    return(
      <nav>
        <ul className="flex gap-4">
          <li><a href="/">Inicio</a></li>
          <li><a href="/register">Registrarse</a></li>
          <li><a href="/login">Iniciar Sesion</a></li>
          <li><a href="/faq">Preguntas frecuentes</a></li>
          <li><a href="/perfil">Mi perfil</a></li>
        </ul>
      </nav>
    );
}