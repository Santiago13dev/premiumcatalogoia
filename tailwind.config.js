/**
 * Configuración de Tailwind CSS.
 * Tailwind es un framework de utilidades que permite construir interfaces modernas rápidamente【816636246807364†L7-L12】. 
 * Aquí especificamos qué archivos deben analizarse para generar las clases CSS necesarias.
 */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};