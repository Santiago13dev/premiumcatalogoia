import React from 'react';

const FilterTabs = ({ selectedType, onTypeChange, componentCount, totalCount }) => {
  const types = [
    { id: 'all', label: 'Todos', icon: '🎯' },
    { id: 'model', label: 'Modelos', icon: '🤖' },
    { id: 'dataset', label: 'Datasets', icon: '📊' },
    { id: 'prompt', label: 'Prompts', icon: '💡' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filtrar por tipo
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {componentCount} de {totalCount} componentes
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all duration-200
              flex items-center gap-2
              ${selectedType === type.id
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            <span className="text-lg">{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs;