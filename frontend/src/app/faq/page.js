'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import Header from "../../components/layout/Header";
import Image from "next/image";

// app/faq/page.js
export default function FAQPage() {

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
        question: "¿Puedo usar SkillSwap en mi celular?",
        answer:
          "Actualmente la plataforma no se encuentra optimizada para dispositivos móviles. Pronto lo estará.",
      },
      {
        question: "¿Puedo usar SkillSwap en mi celular?",
        answer:
          "Actualmente la plataforma no se encuentra optimizada para dispositivos móviles. Pronto lo estará.",
      },
      {
        question: "¿Puedo usar SkillSwap en mi celular?",
        answer:
          "Actualmente la plataforma no se encuentra optimizada para dispositivos móviles. Pronto lo estará.",
      },
    ];

    return (
      <div>
        <Header />
        <section className="bg-gray-50 min-h-screen py-20 px-6">
          <div style={{fontFamily: 'VT323'}} className="max-w-4xl mx-auto text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-extrabold text-gray-800 mb-4"
            >
              Preguntas Frecuentes
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-600"
            >
              Descubrí las respuestas a las dudas más comunes sobre nuestra
              plataforma.
            </motion.p>
          </div>
    
          <div className="max-w-3xl mx-auto space-y-10">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: false, amount: 0.3 }}
                className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100"
              >
                <Image src={npcsImages[index % npcsImages.length]} alt="Pregunta" width={40} height={40} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      );
  }
  