/**
 * Servidor backend sencillo usando Express.
 * Define endpoints para listar todos los componentes y obtener uno por ID.
 * Express se describe como un framework web rápido y minimalista para Node.js【947952538608249†L75-L100】, por lo que es ideal para un API ligero.
 */
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Cargar los datos de componentes. Se usa require para importar el JSON una vez.
const components = require('../src/data/components.json');

// Middleware para parsear JSON en solicitudes entrantes (no se usa en este ejemplo pero se deja listo).
app.use(express.json());

// Endpoint para obtener la lista completa de componentes
app.get('/api/components', (req, res) => {
  res.json(components);
});

// Endpoint para obtener un componente específico por su id
app.get('/api/components/:id', (req, res) => {
  const comp = components.find((c) => c.id === req.params.id);
  if (!comp) {
    return res.status(404).json({ message: 'Componente no encontrado' });
  }
  res.json(comp);
});

// Servir los archivos estáticos del frontend si se ha generado con `npm run build`.
// La carpeta `dist` es creada por Vite.
app.use(express.static(path.join(__dirname, '../dist')));

// Para cualquier otra ruta, devolver index.html (soporta navegación por cliente)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});