import React from 'react';

/**
 * Modal reutilizable para mostrar los detalles de un componente.
 * Recibe el objeto del componente seleccionado y un callback para cerrar.
 */
const Modal = ({ component, onClose }) => {
  if (!component) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 max-w-3xl w-full rounded-lg shadow-lg overflow-auto max-h-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {component.name}
          </h2>
          <button
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-indigo-600 dark:text-indigo-300 uppercase mb-2">
          {component.type}
        </p>
        <img
          src={component.image}
          alt={component.name}
          className="w-full h-56 object-cover rounded mb-4"
        />
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {component.description}
        </p>
        <div className="mt-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Etiquetas
          </h3>
          <div className="flex flex-wrap gap-2">
            {component.tags.map((tag) => (
              <span
                key={tag}
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {component.usage && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Ejemplo de uso
            </h3>
            {/* Se usa <pre> para preservar formato y se envuelve en <code> para semántica */}
            <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 text-sm overflow-x-auto"><code>{component.usage}</code></pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;