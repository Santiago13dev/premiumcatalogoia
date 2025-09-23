import React, { useState, useEffect, useMemo } from 'react';
import ComponentCard from './components/ComponentCard';
import Modal from './components/Modal';
import SearchBar from './components/SearchBar';
import componentsData from './data/components.json';

function App() {
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true' || false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Filtrado y búsqueda avanzada
  const filteredComponents = useMemo(() => {
    let filtered = componentsData.filter((comp) => {
      const matchesType = filterType ? comp.type === filterType : true;
      
      if (!searchTerm) return matchesType;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesName = comp.name.toLowerCase().includes(searchLower);
      const matchesDescription = comp.description.toLowerCase().includes(searchLower);
      const matchesTags = comp.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      return matchesType && (matchesName || matchesDescription || matchesTags);
    });

    // Ordenamiento
    switch(sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'recent':
        filtered.reverse();
        break;
      default:
        break;
    }

    return filtered;
  }, [filterType, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const typeCount = {};
    componentsData.forEach(comp => {
      typeCount[comp.type] = (typeCount[comp.type] || 0) + 1;
    });
    return {
      total: componentsData.length,
      types: typeCount,
      filtered: filteredComponents.length
    };
  }, [filteredComponents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header mejorado */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Catálogo IA Premium
                </h1>
              </div>
              {/* Stats */}
              <div className="hidden md:flex items-center gap-4 ml-8">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.filtered} de {stats.total} componentes
                </span>
              </div>
            </div>
            
            {/* Theme toggle and view mode */}
            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
              >
                <option value="name">Nombre</option>
                <option value="type">Tipo</option>
                <option value="recent">Recientes</option>
              </select>

              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Search bar */}
          <SearchBar 
            onSearch={setSearchTerm}
            onTypeFilter={setFilterType}
            filterType={filterType}
            tagSearch={searchTerm}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4 md:p-8">
        {/* Results count */}
        {searchTerm && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredComponents.length > 0 ? (
              <>
                Mostrando {filteredComponents.length} resultado{filteredComponents.length !== 1 ? 's' : ''}
                {searchTerm && ` para "${searchTerm}"`}
              </>
            ) : (
              <>
                No se encontraron resultados para "{searchTerm}"
              </>
            )}
          </div>
        )}

        {/* Components grid/list */}
        {filteredComponents.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'flex flex-col gap-4'
            }
          `}>
            {filteredComponents.map((comp) => (
              <ComponentCard 
                key={comp.id} 
                component={comp} 
                onSelect={setSelectedComponent}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="h-20 w-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No se encontraron componentes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Intenta ajustar tus filtros de búsqueda</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      <Modal component={selectedComponent} onClose={() => setSelectedComponent(null)} />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 Catálogo IA Premium. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                Documentación
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                API
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;