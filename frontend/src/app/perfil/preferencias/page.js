'use client';
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from 'react';
import axios from '../../../utils/axios';

export default function PreferenciasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cargar profesores desde la API con Axios
  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/profesores');
      if (response.data.success) {
        setAllTeachers(response.data.teachers);
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
    try {
      const response = await fetch('/api/preferences/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacher_id: teacherId }),
      });

      if (response.ok) {
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
                    <h4 className="font-semibold text-gray-900">{teacher.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-violet-100 text-violet-800 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
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
          <div className="relative bg-white z-50 w-full h-full">
            <h3 className="relative z-50 p-4 text-center">Profesores destacados</h3>
          </div>
        </motion.div>

        {/* Profesores preferidos */}
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
          <div className="relative bg-white z-50 w-full h-full ">
            <h3 className="relative z-50 p-4 text-center">Profesores favoritos</h3>
          </div>
        </motion.div>
      </div>
    </div>
  );
}