# Catálogo de componentes de Inteligencia Artificial

Este proyecto es un ejemplo de catálogo interactivo construido **con JavaScript** para listar, filtrar y explorar distintos componentes de IA: modelos, datasets y prompts. El objetivo es ilustrar cómo organizar un repositorio que incluya un pequeño backend y un frontend React con Tailwind CSS.

## Arquitectura

El proyecto se divide en dos partes principales:

1. **Frontend (carpeta `src/`)**: Utiliza React para construir una interfaz de usuario basada en componentes. React es una biblioteca que permite crear interfaces de usuario a partir de piezas reutilizables llamadas componentes【784892975962973†L22-L33】. Cada tarjeta del catálogo es un componente independiente (`ComponentCard`), que se compone dentro del componente principal `App`. Cuando se selecciona una tarjeta se muestra un modal (`Modal`) con la información detallada. Tailwind CSS se usa como framework de utilidades para dar estilo a la aplicación de forma rápida y moderna【816636246807364†L7-L12】.
2. **Backend (carpeta `server/`)**: Un pequeño servidor Node.js con Express. Express se describe como un framework web rápido y minimalista para Node.js【947952538608249†L75-L100】. Exponemos dos endpoints REST: uno para obtener la lista de componentes (`/api/components`) y otro para consultar un componente por su `id` (`/api/components/:id`). Aunque el frontend importa el JSON directamente, disponer del backend permite desacoplar los datos o usarlos en otras aplicaciones.

La configuración de Vite (archivos `vite.config.js` y `package.json`) simplifica el arranque y la construcción del frontend. Tailwind se configura en `tailwind.config.js` y se incluye mediante PostCSS.

## Estructura de carpetas

```
ai-catalog/
├── package.json            # Definición de dependencias y scripts
├── tailwind.config.js      # Configuración de Tailwind CSS
├── postcss.config.js       # Configuración de PostCSS
├── vite.config.js          # Configuración de Vite para React
├── server/
│   └── server.js          # Servidor Express con endpoints de API
├── public/
│   └── index.html          # Plantilla HTML principal
├── src/
│   ├── main.jsx           # Punto de entrada de React
│   ├── App.jsx            # Componente raíz con filtros y lista de tarjetas
│   ├── index.css          # Estilos globales y Tailwind
│   ├── data/
│   │   └── components.json # Datos de ejemplo con 5 componentes
│   └── components/
│       ├── ComponentCard.jsx # Tarjeta individual
│       └── Modal.jsx        # Modal para detalles
└── README.md
```

### Componentes clave

- **`components.json`**: Un archivo JSON de ejemplo con cinco elementos de distinta naturaleza (modelos, datasets y un prompt). Cada objeto contiene `id`, `name`, `type`, `description`, `tags`, `usage` (ejemplo de uso) e `image` (URL de una imagen representativa).
- **`ComponentCard.jsx`**: Presenta la información resumida de un componente. Usa una imagen, nombre, tipo, breve descripción y una lista de etiquetas. Incluye un botón para abrir el modal de detalles. Está diseñado como un componente reutilizable.
- **`Modal.jsx`**: Muestra los detalles completos del componente seleccionado, incluyendo el ejemplo de uso con formato de código. El modal es flotante y se cierra pulsando la X o fuera del área.
- **`App.jsx`**: Gestiona el estado de la aplicación: filtros por tipo y etiquetas, selección de componentes y renderizado de la lista. Importa los datos directamente desde `components.json` y aplica filtros en memoria.
- **`server/server.js`**: Servidor Express que expone dos rutas REST. Permite desacoplar el origen de datos y escalar hacia un almacenamiento persistente.

## Wireframes

A continuación se muestran wireframes sencillos que ilustran la disposición general de la interfaz. Utilizan caracteres ASCII para representar la estructura.

### Vista principal (lista de componentes)

```
┌─────────────────────────────────────────────────────────────┐
│ Catálogo de componentes de IA                              │
│ ┌──────────────┐ ┌───────────────────────────────┐         │
│ │ [Selector]   │ │ Buscar por etiqueta…          │         │
│ └──────────────┘ └───────────────────────────────┘         │
│                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ Imagen              │ │ Imagen              │             │
│ │ Nombre componente   │ │ Nombre componente   │             │
│ │ Tipo                │ │ Tipo                │             │
│ │ Descripción breve…  │ │ Descripción breve…  │             │
│ │ [tags] [tags]        │ │ [tags] [tags]        │             │
│ │ [Ver detalles]       │ │ [Ver detalles]       │             │
│ └─────────────────────┘ └─────────────────────┘             │
│ … (más tarjetas en rejilla responsiva)                      │
└─────────────────────────────────────────────────────────────┘
```

### Vista de detalle (modal)

```
┌─────────────────────────────────────────────────────────────┐
│ Nombre del componente                      ×               │
├─────────────────────────────────────────────────────────────┤
│ Tipo: model/dataset/prompt                               │
│ Imagen grande                                             │
│ Descripción completa                                      │
│ Etiquetas: [tag] [tag] …                                  │
│                                                            │
│ Ejemplo de uso:                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Código de ejemplo con formato monoespaciado             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Instrucciones de uso

1. **Instalación de dependencias**

   En la raíz del proyecto ejecuta:

   ```bash
   npm install
   ```

   Esto instala React, Express y Tailwind CSS, así como Vite y los plugins necesarios.

2. **Ejecutar el frontend en modo desarrollo**

   Para arrancar el servidor de desarrollo de Vite (recarga en caliente):

   ```bash
   npm run dev
   ```

   El proyecto se servirá normalmente en `http://localhost:5173`.

3. **Arrancar el backend (opcional)**

   Si quieres exponer los endpoints del API, primero genera el bundle de producción del frontend y luego inicia el servidor:

   ```bash
   npm run build       # compila el frontend en la carpeta dist
   npm start           # inicia el servidor Express en el puerto 3000
   ```

   La aplicación completa (frontend estático y API) estará disponible en `http://localhost:3000`.

## Justificación de decisiones

* **React**: se eligió React porque permite construir interfaces de usuario mediante componentes reutilizables. La documentación oficial destaca que React es "la biblioteca para interfaces de usuario web y nativas"【784892975962973†L22-L25】 y que los componentes son funciones de JavaScript que devuelven lo que debe aparecer en la pantalla【784892975962973†L68-L74】. Esto facilita descomponer la UI en tarjetas y modales y reutilizarlos.
* **Tailwind CSS**: optamos por Tailwind porque es un framework de utilidades que permite crear diseños modernos sin salir del marcado HTML【816636246807364†L7-L12】. Las clases utilitarias simplifican el prototipado rápido y se integran bien con React. Además, habilitar `darkMode: 'class'` nos permite añadir un tema oscuro simplemente añadiendo la clase `dark` en el `body`.
* **Express**: el backend utiliza Express, un framework minimalista para Node.js. La documentación de Express lo describe como un framework web rápido y no opinado【947952538608249†L75-L100】 con un conjunto de características robustas para aplicaciones web y móviles【947952538608249†L99-L103】. Esto lo hace adecuado para exponer un pequeño API sin demasiada sobrecarga.

## Notas finales

Este proyecto pretende ser una guía inicial para construir un catálogo de componentes de IA. Puedes ampliar el archivo JSON con nuevos modelos, datasets o prompts y conectar la API a una base de datos. También puedes explorar la integración con bibliotecas como Prisma u ORMs para persistencia, o frameworks completos como Next.js para renderizado del lado del servidor.