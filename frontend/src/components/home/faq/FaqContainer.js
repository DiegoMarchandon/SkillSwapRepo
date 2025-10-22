'use client';

import { motion } from "framer-motion";
import { useState } from "react";
// import Header from "../../components/layout/Header";
import Image from "next/image";
import styles from "./page.module.css"

// app/faq/page.js
export default function FaqContainer() {

    const npcsImages = [
      "/people8bit/npc1.png",
      "/people8bit/npc2.png",
      "/people8bit/npc3.png",
      "/people8bit/npc4.png",
    ];

    const faqs = [
      {
        question: "¿Qué es SkillSwap?",
        answer:
          "SkillSwap es una plataforma que conecta a personas que desean intercambiar conocimientos y habilidades sin necesidad de dinero.",
      },
      {
        question: "¿Necesito pagar para usar SkillSwap?",
        answer:
          "No, nuestra plataforma es totalmente gratuita. Solo necesitás registrarte y empezar a intercambiar conocimientos.",
      },
      {
        question: "¿Qué tipo de habilidades puedo intercambiar?",
        answer:
          "Podés ofrecer o aprender cualquier habilidad, desde programación y diseño gráfico hasta cocina, idiomas o música.",
      },
      {
        question: "¿Cómo garantizan la seguridad de los usuarios?",
        answer:
          "SkillSwap cuenta con un sistema de perfiles verificados y reseñas para asegurar la confianza entre los usuarios.",
      },
      {
        question: "¿Puedo usar SkillSwap en mi celular?",
        answer:
          "Actualmente la plataforma no se encuentra optimizada para dispositivos móviles. Pronto lo estará.",
      },
      {
        question: "¿Cómo funciona el intercambio de habilidades en SkillSwap?",
        answer:
          "Vas a la sección 'mis habilidades'. Ingresás la/s habilidad/es que te gustaría aprender o enseñar. ",
      },
      {
        question: "¿Cuánto tiempo duran los intercambios o sesiones?",
        answer:
          "Duran lo que se pacte previamente. Una vez que elijas una habilidad a aprender de determinado profesor, podés elegir una respectiva sesión con el horario y duración indicadas por el mismo",
      },
      {
        question: "¿Qué gano al usar SkillSwap si no hay dinero de por medio?",
        answer:
          "Conocimiento y reconocimiento! Además de la ventaja de poder aprender sin pagar nada, también contamos con un sistema de rangos, rachas y rankings para los usuarios más destacados en la plataforma.",
      },
    ];

    return (
      <div>
        <section className="bg-[#0a0a0a] min-h-screen py-20 px-6">
          <div style={{fontFamily: 'VT323'}} className="max-w-4xl mx-auto text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-extrabold text-gray-300 mb-4"
            >
              Preguntas Frecuentes
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-500"
            >
              Descubrí las respuestas a las dudas más comunes sobre nuestra
              plataforma.
            </motion.p>
          </div>
    
          <div className=" max-w-3xl mx-auto space-y-10">
            {faqs.map((faq, index) => (

              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: false, amount: 0.3 }}
                className="relative  shadow-lg rounded-2xl p-4 border border-gray-800"
              >
                <div className={`${styles.bubbleLeft} relative w-full mb-5 h-24 bg-blue-200`}>
                  <Image src={npcsImages[index % npcsImages.length]} className="absolute bottom-2/3 right-2/2" alt="Pregunta" width={50} height={50} />
                  <h3 className="text-xl  font-semibold text-gray-800 mb-2">
                    {faq.question}
                  </h3>
                </div>

                <div className={`${styles.bubbleRight} relative w-full h-24 bg-cyan-200`}>
                  <Image src="/pet/BMO.png" className="rotate-y-180 absolute bottom-2/4 left-2/2" alt="Respuesta" width={60} height={60} />
                  <p className="text-gray-800">{faq.answer}</p>
                </div>
              </motion.div>

            ))}
          </div>
        </section>
      </div>
      );
  }
  