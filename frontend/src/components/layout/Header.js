import Navbar from "./Navbar";
import { useAuth } from '../../context/AuthContext';

function Header(){
    const {user} = useAuth();
    return(
        <header className="w-full text-sm bg-slate-400">
            <h1 style={{ fontFamily:'VT323' }} className="text-2xl font-bold">Bienvenido {user?.name || 'Usuario'} a SkillSwap!</h1>
        <Navbar />
        </header>
    );
}

export default Header;