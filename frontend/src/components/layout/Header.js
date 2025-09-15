import Navbar from "./Navbar";
import { useAuth } from '../../context/AuthContext';

function Header(){
    const {user} = useAuth();
    return(
        <header className="w-full lg:max-w-4xl max-w-[335px] text-sm mb-6 bg-red-400">
            <h1 style={{ fontFamily:'VT323' }} className="text-2xl font-bold">Bienvenido {user?.name || 'Usuario'} a SkillSwap!</h1>
        <Navbar />
        </header>
    );
}

export default Header;