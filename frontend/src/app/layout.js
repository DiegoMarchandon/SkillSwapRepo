import "./globals.css";

import { Press_Start_2P, VT323, Inter, Roboto_Mono } from "next/font/google";

import { AuthProvider } from "../context/AuthContext";
import NotificationsProvider from "../context/NotificacionesContext";
import { Toaster } from "react-hot-toast";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// Usamos Inter/Roboto Mono pero conservamos los mismos nombres de variables:
const geistSans  = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono  = Roboto_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });
const vt323      = VT323({ weight: "400", subsets: ["latin"], variable: "--font-pixel-mono" });

export const metadata = {
  title: "SkillSwap",
  description: "Intercambiá habilidades por tiempo",
};

export default function RootLayout({ children, modal }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} ${vt323.variable}`}
    >
      <body>
        <AuthProvider>
          <NotificationsProvider>
            
            <main>{children}</main>
            {modal}
            
            <Toaster position="top-right" />
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
