import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
// import MainButton from "../ui/buttons/MainButton";

function Home(){
    return(
        /* podés combinar esta fuente con clases como tracking-widest, 
        uppercase, o text-shadow (si usás plugins) para reforzar el estilo retro sin perder legibilidad.
        
        */
        <div>
            <Header />
            <div className="h-screen flex items-start justify-center text-4xl">
                <h1 style={{ fontFamily:'VT323' }}>SkillSwap (Home.js) </h1>
            </div>
            <Footer />
        </div>
    );
}
export default Home;