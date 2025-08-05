import React from 'react';

/**
 * Componente de tarjeta para cada elemento del catálogo.
 * Muestra nombre, tipo, una descripción corta y sus etiquetas.
 * Al pulsar el botón "Ver detalles" se invoca el callback onSelect.
 */
const ComponentCard = ({ component, onSelect }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 flex flex-col justify-between transition hover:shadow-xl">
      <div>
        {/* Imagen representativa; utiliza una URL remota incluida en el JSON */}
        <img
          src={component.image}
          alt={component.name}
          className="w-full h-40 object-cover rounded-md mb-4"
        />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {component.name}
        </h3>
        <p className="text-sm text-indigo-600 dark:text-indigo-300 uppercase mb-2">
          {component.type}
        </p>
        <p className="text-gray-600 dark:text-gray-300 text-sm max-h-24 overflow-hidden">
          {/* La descripción se recorta mediante overflow-hidden y altura máxima */}
          {component.description}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {component.tags.map((tag) => (
          <span
            key={tag}
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <button
        className="mt-4 w-full py-2 px-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
        onClick={() => onSelect(component)}
      >
        Ver detalles
      </button>
    </div>
  );
};

export default ComponentCard;