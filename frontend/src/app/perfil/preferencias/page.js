'use client';
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from 'react';
import axios from '../../../utils/axios';
import Header from '../../../components/layout/Header';
import Subnavbar from "../../../components/perfil/Subnavbar";

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
          skill.name.toLowerCase().includes(term)
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
      }else{
        console.log("Profesor existe:",teacher);
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
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900">
      {/* Fondo con efecto lava lamp - NUEVO */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/30 to-cyan-900/20 backdrop-blur-sm" />
      </div>
      
      <Header />
      <Subnavbar actualTab={'Preferencias'} />

      {/* Contenedor principal con estilo pixel art - MODIFICADO */}
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        
        {/* Título principal - NUEVO ESTILO */}
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-4xl font-bold text-center text-white font-mono pixel-text"
          style={{ 
            fontFamily: 'VT323, monospace',
            textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(103, 232, 249, 0.3)',
            letterSpacing: '2px'
          }}
        >
          PREFERENCIAS
        </motion.h2>
        
        {/* Buscador - COMPLETAMENTE REDISEÑADO */}
        <div className="mb-34 relative">
          <div className="relative">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="BUSCAR PROFESORES..."
              className="w-full p-5 pr-14 rounded-none border-4 border-gray-800 bg-gray-100 text-gray-100 
                         focus:outline-none focus:border-cyan-500 font-mono text-lg pixel-input"
              style={{ 
                fontFamily: 'VT323, monospace',
                letterSpacing: '1px',
                boxShadow: '6px 6px 0 #000'
              }}
              onFocus={() => searchTerm && setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              </div>
            )}
          </div>

          {/* Sugerencias - REDISEÑADO */}
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-2 mb-2 bg-gray-800/70 border-4 border-gray-700 
                         shadow-[8px_8px_0_#000] max-h-60 overflow-y-auto overflow-x-hidden"
            >
              {suggestions.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(103, 232, 249, 0.1)' }}
                  className="p-4 cursor-pointer border-b-2 border-gray-700 last:border-b-0 
                             hover:bg-cyan-900/20 transition-colors"
                  onClick={() => handleSuggestionClick(teacher)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white font-mono text-lg">{teacher.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teacher.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-cyan-500 text-white text-sm rounded-none border-2 border-cyan-700 font-mono"
                            style={{ boxShadow: '2px 2px 0 #000' }}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToFavorites(teacher.id);
                      }}
                      className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-none border-2 border-yellow-700 
                                 hover:bg-yellow-400 font-mono text-sm font-bold"
                      style={{ boxShadow: '3px 3px 0 #000' }}
                    >
                      {teacher.isFavorite ? '★' : '⭐'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {showSuggestions && searchTerm && suggestions.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-2 bg-gray-800 border-4 border-gray-700 p-4"
              style={{ boxShadow: '8px 8px 0 #000' }}
            >
              <p className="text-gray-400 text-center font-mono">NO SE ENCONTRARON PROFESORES</p>
            </motion.div>
          )}
        </div>

        {/* Contenedor de tarjetas - REDISEÑADO */}
        <div className="flex gap-8">
          {/* Profesores destacados - COMPLETAMENTE REDISEÑADO */}
          <motion.div
            className="relative flex-1"
            whileHover="hover"
            initial="rest"
            animate="rest"
          >
            {/* Efecto 3D detrás - NUEVO */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 opacity-80"
              variants={{
                rest: { x: 8, y: -8 },
                hover: { x: -8, y: 8 }
              }}
              transition={{ duration: 0.5 }}
              style={{ boxShadow: '8px 8px 0 #000' }}
            />
            
            {/* Efecto de brillo - NUEVO */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
              variants={{
                hover: { opacity: 1, x: ['0%', '100%'] }
              }}
              transition={{ duration: 0.8 }}
            />
            
            {/* Contenido principal */}
            <div className="relative bg-gray-800 border-4 border-gray-700 p-6 min-h-[400px] 
                           backdrop-blur-sm bg-opacity-90"
                 style={{ boxShadow: '8px 8px 0 #000' }}>
              <h3 className="text-2xl font-bold text-center text-white mb-6 font-mono pixel-text"
                  style={{ textShadow: '2px 2px 0 #000' }}>
                ⭐ DESTACADOS
              </h3>
              <div className="space-y-3">
                {featuredTeachers.map(teacher => (
                  <motion.div
                    key={teacher.id}
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="p-3 bg-gray-700 border-2 border-gray-600 text-white font-mono"
                    style={{ boxShadow: '3px 3px 0 #000' }}
                  >
                    <p className="font-bold">{teacher.name}</p>
                    <p className="text-cyan-400 text-sm">⭐ {teacher.favorites_count} favoritos</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Profesores favoritos - COMPLETAMENTE REDISEÑADO */}
          <motion.div
            className="relative flex-1"
            whileHover="hover"
            initial="rest"
            animate="rest"
          >
            {/* Efecto 3D detrás - NUEVO */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-80"
              variants={{
                rest: { x: 8, y: -8 },
                hover: { x: -8, y: 8 }
              }}
              transition={{ duration: 0.5 }}
              style={{ boxShadow: '8px 8px 0 #000' }}
            />
            
            {/* Efecto de brillo - NUEVO */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
              variants={{
                hover: { opacity: 1, x: ['0%', '100%'] }
              }}
              transition={{ duration: 0.8 }}
            />

            {/* Contenido principal */}
            <div className="relative bg-gray-800 border-4 border-gray-700 p-6 min-h-[400px] 
                           backdrop-blur-sm bg-opacity-90"
                 style={{ boxShadow: '8px 8px 0 #000' }}>
              <h3 className="text-2xl font-bold text-center text-white mb-6 font-mono pixel-text"
                  style={{ textShadow: '2px 2px 0 #000' }}>
                ❤️ FAVORITOS
              </h3>
              <div className="space-y-3">
                {favoriteTeachers.map(teacher => (
                  <motion.div
                    key={teacher.id}
                    whileHover={{ scale: 1.05, x: 5 }}
                    className="p-3 bg-gray-700 border-2 border-gray-600 text-white font-mono flex justify-between items-center"
                    style={{ boxShadow: '3px 3px 0 #000' }}
                  >
                    <p className="font-bold">{teacher.name}</p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveFavorite(teacher.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-none border-2 border-red-700 text-sm font-bold"
                      style={{ boxShadow: '2px 2px 0 #000' }}
                    >
                      QUITAR
                    </motion.button>
                  </motion.div>
                ))}
                {favoriteTeachers.length === 0 && (
                  <p className="text-gray-400 text-center font-mono p-4">NO TIENES FAVORITOS</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}