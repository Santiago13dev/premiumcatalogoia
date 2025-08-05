import React, { useState } from 'react';
import ComponentCard from './components/ComponentCard';
import Modal from './components/Modal';
import componentsData from './data/components.json';

/**
 * Componente principal de la aplicación.
 * Gestiona los filtros de búsqueda, la selección de componentes y muestra la lista de tarjetas.
 */
function App() {
  // Estados para filtro por tipo, texto de búsqueda por etiqueta y componente seleccionado para el modal
  const [filterType, setFilterType] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);

  // Calcular la lista filtrada según los criterios de búsqueda
  const filteredComponents = componentsData.filter((comp) => {
    const matchesType = filterType ? comp.type === filterType : true;
    const matchesTag = tagSearch
      ? comp.tags.some((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
      : true;
    return matchesType && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="py-6 px-4 md:px-8 bg-white dark:bg-gray-900 shadow">
        <h1 className="text-3xl font-bold mb-4">Catálogo de componentes de IA</h1>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-1/4 p-2 border dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800"
          >
            <option value="">Todos los tipos</option>
            <option value="model">Modelos</option>
            <option value="dataset">Datasets</option>
            <option value="prompt">Prompts</option>
          </select>
          {/* Búsqueda por etiqueta */}
          <input
            type="text"
            placeholder="Buscar por etiqueta..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="flex-1 p-2 border dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800"
          />
        </div>
      </header>
      <main className="p-4 md:p-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredComponents.map((comp) => (
          <ComponentCard key={comp.id} component={comp} onSelect={setSelectedComponent} />
        ))}
      </main>
      {/* Modal de detalles */}
      <Modal component={selectedComponent} onClose={() => setSelectedComponent(null)} />
    </div>
  );
}

export default App;