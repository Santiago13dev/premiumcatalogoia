import React, { useState } from 'react';

const SearchBar = ({ onSearch, onTypeFilter, filterType, tagSearch }) => {
  const [searchTerm, setSearchTerm] = useState(tagSearch);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
    onTypeFilter('');
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filtro por tipo mejorado */}
        <div className="flex gap-2">
          <button
            onClick={() => onTypeFilter('')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterType === '' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => onTypeFilter('model')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterType === 'model' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Modelos
          </button>
          <button
            onClick={() => onTypeFilter('dataset')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterType === 'dataset' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Datasets
          </button>
          <button
            onClick={() => onTypeFilter('prompt')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterType === 'prompt' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Prompts
          </button>
        </div>
        
        {/* Barra de búsqueda mejorada */}
        <div className="flex-1 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, etiqueta o descripción..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Botón de búsqueda avanzada */}
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>
      </div>
      
      {/* Panel de búsqueda avanzada */}
      {isAdvancedOpen && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Filtros avanzados</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>• Usa comillas para buscar frases exactas: "machine learning"</p>
            <p>• Usa el signo menos para excluir términos: -tensorflow</p>
            <p>• Combina múltiples etiquetas separadas por comas</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;