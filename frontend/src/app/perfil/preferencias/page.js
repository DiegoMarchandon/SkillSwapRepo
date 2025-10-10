'use client';
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from 'react';
import axios from '../../../utils/axios';

export default function PreferenciasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [favoriteTeachers, setFavoriteTeachers] = useState([]);
  const [featuredTeachers, setFeaturedTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Cargar profesores desde la API con Axios
  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Debug: verificar token
    const token = localStorage.getItem('token');
    // console.log('Token en localStorage:', token);
    // console.log('Headers que se envían:', axios.defaults.headers.common);


      const response = await axios.get('/profesores');
      console.log(response.data);
      if (response.data.success && response.data.teachers) {
        // convierto el objeto de teachers a Array
          const teachersArray = Object.values(response.data.teachers);

        setAllTeachers(teachersArray);
        // Filtrar favoritos
        // console.log(response.data.teachers);
        
          // console.log("entra");
            // Ordenar por cantidad de favoritos para destacados
            console.log("teachersArray",teachersArray);
            const featured = teachersArray
              .filter(teacher => teacher.favorites_count > 0)
              .sort((a, b) => b.favorites_count - a.favorites_count)
              .slice(0, 5);
            setFeaturedTeachers(featured);

            const favorites = teachersArray.filter(teacher => teacher.isFavorite);
            setFavoriteTeachers(favorites);
          
        } else {
          // console.log("no entra");
          console.error('Teachers no es un array:', response.data.teachers);
        }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      if (error.response) {
        console.error('Server error:', error.response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRemoveFavorite = async (teacherId) => {
    try {
      const response = await axios.delete('/favoritos/remove', {
        data: { profesor_id: teacherId }
      });
  
      if (response.data.success) {
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Buscar sugerencias
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTeachers = () => {
      const term = searchTerm.toLowerCase().trim();
      
      const filtered = allTeachers.filter(teacher => 
        teacher.name.toLowerCase().includes(term) ||
        teacher.skills.some(skill => 
          skill.toLowerCase().includes(term)
        )
      );

      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    };

    const timeoutId = setTimeout(searchTeachers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, allTeachers]);

  const handleSuggestionClick = (teacher) => {
    setSearchTerm(teacher.name);
    setShowSuggestions(false);
  };


  const handleAddToFavorites = async (teacherId) => {
    console.log("hola");
    try {
      const teacher = allTeachers.find(t => t.id === teacherId);
      if (!teacher) {
        console.error("No se encontró el profesor");
        return;
      }
      
      // obtener el primer usuario_habilidad_id del profesor
      const habilidadId = teacher.skills?.[0]?.usuario_habilidad_id;
      console.log("Habilidad ID: ",habilidadId);
      // console.log(teacher);

      const response = await axios.post('/favoritos/agregar', {
        profesor_id:teacher.id,
        usuario_habilidad_id: habilidadId || 1
      });

      if (response.data.success) {
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-300 text-gray-900 rounded-2xl shadow">
      <h2 className="mb-4 text-xl font-semibold">Preferencias</h2>
      
      {/* Buscador */}
      <div className="mb-8 relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar profesores por nombre o habilidades..."
            className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            onFocus={() => searchTerm && setShowSuggestions(true)}
            onBlur={() => setShowSuggestions(false)}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500"></div>
            </div>
          )}
        </div>

        {/* Sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((teacher) => (
              <div
                key={teacher.id}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                onClick={() => handleSuggestionClick(teacher)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900">{teacher.name} "su id:"{teacher.id}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-violet-100 text-violet-800 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("click");
                      e.preventDefault();
                      handleAddToFavorites(teacher.id);
                    }}
                    className="px-3 py-1 bg-violet-500 text-white rounded-lg hover:bg-violet-600 text-sm"
                  >
                    {teacher.isFavorite ? '★' : '⭐'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSuggestions && searchTerm && suggestions.length === 0 && !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-gray-600 text-center">No se encontraron profesores</p>
          </div>
        )}
      </div>

      <div className="flex opacity-75">
        {/* Profesores destacados */}
        <motion.div
          className="relative m-6 w-1/2 h-128 overflow-visible"
          whileHover="hover"
          initial="rest"
          animate="rest"
        >
          <motion.div
            className="absolute inset-0 bg-violet-400 opacity-85"
            variants={{
              rest: { x: 10, y: -10 },
              hover: { x: -10, y: 10 }
            }}
            transition={{ duration: 0.5 }}
          />
          <div className="relative bg-white z-50 w-full h-full p-4 overflow-y-auto">
            <h3 className="relative z-50 p-4 text-center">Profesores destacados</h3>
            {featuredTeachers.map(teacher => (
            <div key={teacher.id} className="mb-2 p-2 bg-gray-100 rounded">
              <p>{teacher.name} - ⭐ {teacher.favorites_count}</p>
            </div>
            ))}
          </div>
        </motion.div>

        {/* Profesores favoritos */}
        <motion.div
          className="relative m-6 w-1/2 h-128 overflow-visible"
          whileHover="hover"
          initial="rest"
          animate="rest"
        >
          <motion.div
            className="absolute inset-0 bg-violet-400 opacity-85"
            variants={{
              rest: { x: 10, y: -10 },
              hover: { x: -10, y: 10 }
            }}
            transition={{ duration: 0.5 }}
          />
          <div className="relative bg-white z-50 w-full h-full p-4 overflow-y-auto">
            <h3 className="relative z-50 p-4 text-center">Profesores favoritos</h3>
            {favoriteTeachers.map(teacher => (
              <div key={teacher.id} className="mb-2 p-2 bg-gray-100 rounded">
                <p>{teacher.name}</p>
                <button
                  onClick={() => handleRemoveFavorite(teacher.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Quitar
                </button>
              </div>
            ))}
            {favoriteTeachers.length === 0 && (
              <p className="text-gray-600 text-center">No tienes profesores favoritos</p>)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}