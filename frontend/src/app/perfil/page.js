'use client';
import { useState, useEffect } from "react";

export default function UserProfile({ user }) {
    // plantilla de datos de usuario. Una vez que tenga datos reales reemplazo los Strings

    const originalData = {
    name: "Default Name" || user.name,
    email: "default@gmail.com" || user.email,
    role: "defaultRole" || user.role,
    password: "default password" || user.password,
    credits: "default (5)" || user.credits,
    status: "default (Activo)" || user.status,
    skills_offered: ["React","Tailwind","Node.js","Laravel","PHP","Python"] || user.skills_offered,
    desired_skills: ["Java","C++","C#","Ruby","Swift"] || user.desired_skills,
    bio:  "defaultBio" || user.bio,
  };

  const [formData,setFormData] = useState(originalData);
  const [isModified,setIsModified] = useState(true);
//   console.log("isModified igual a: ", (isModified === false ? "falso" : "verdadero"));
    console.log("isModified igual a: ", isModified);

    // Detectar cambios comparando originalData vs formData
      useEffect(() => {
        const iguales = JSON.stringify(formData) === JSON.stringify(originalData);
        setIsModified(!iguales);
    }, [formData]);
 
    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsModified(false);
    // console.log("isModified ahora cambio a: ", isModified);
};

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 flex gap-8">
        
        {/* Columna izquierda - Avatar */}
        <div className="w-1/3 flex flex-col items-center">
          <img
            src={"https://revisitglam.com/wp-content/uploads/2022/04/Jordi-ENP.jpg" || user.avatar }
            alt="avatar"
            className="w-40 h-40 rounded-full border-4 border-blue-500 shadow-md object-cover"
          />
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Cambiar foto
          </button>
        </div>

        {/* separador vertical */}
        <div className="w-px bg-gray-300"></div>
        {/* Columna derecha - Datos no editables */}
        <div>
        <div>
            <label className="block text-sm font-medium text-gray-600">Rol</label>
            <p className="mt-1 w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800">{formData.role}</p>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-600">Creditos</label>
            <p className="mt-1 w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800">{formData.credits}</p>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-600">Estado</label>
            <p className="mt-1 w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800">{formData.status}</p>
        </div>
        </div>

        {/* Columna derecha - Datos editables */}
        <div className="w-2/3 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Correo</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Biografía</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="mt-1 w-full border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <div>
  <label className="block text-sm font-medium text-gray-600">Habilidades ofrecidas</label>
  <div className="flex flex-wrap gap-2 mt-2">
    {formData.skills_offered.map((skill, idx) => (
      <span
        key={idx}
        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
      >
        {skill}
      </span>
    ))}
  </div>
</div>

<div>
  <label className="block text-sm font-medium text-gray-600">Habilidades deseadas</label>
  <div className="flex flex-wrap gap-2 mt-2">
    {formData.desired_skills.map((skill, idx) => (
      <span
        key={idx}
        className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
      >
        {skill}
      </span>
    ))}
  </div>
</div>

          <div className="flex gap-4">

            <button disabled={!isModified} className="disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Guardar cambios
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
