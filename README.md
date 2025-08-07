# 🧠 Catálogo Premium de Componentes de IA

¡Bienvenido a tu propio **Catálogo de Componentes de Inteligencia Artificial**! Esta aplicación te permite explorar, filtrar, y **probar prompts en vivo** usando modelos locales como `llama3` gracias a [Ollama](https://ollama.com/).

---

## 🌟 Características

- ✅ Listado dinámico de componentes de IA (modelos, datasets, prompts)
- 🔍 Filtros por tipo y etiquetas
- 🧪 Probador de prompts en vivo con `llama3` local
- 💻 Backend con Node.js + Express para procesar prompts
- 💅 UI moderna con React + TailwindCSS + Vite

---

## 📂 Estructura del proyecto

```
premiumcatalogoia/
├── public/
├── src/
│   ├── components/
│   │   ├── ComponentCard.jsx
│   │   ├── Modal.jsx
│   │   └── PromptTester.jsx
│   ├── data/
│   │   └── components.json
│   ├── App.jsx
│   └── index.css
├── server/
│   └── server.js
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Instalación y ejecución

### 1. Clona el repositorio
```bash
git clone https://github.com/tuusuario/premiumcatalogoia.git
cd premiumcatalogoia
```

### 2. Instala las dependencias
```bash
npm install
```

### 3. Instala y configura [Ollama](https://ollama.com/)
```bash
# Instala el modelo Llama3 si aún no lo tienes
ollama run llama3
```

### 4. Inicia el backend
```bash
npm run start
# Corre en http://localhost:3000
```

### 5. En otra terminal, inicia el frontend
```bash
npm run dev
# Corre en http://localhost:5173
```

---

## 🧪 Cómo usar el probador de prompts

1. Selecciona un componente de tipo `prompt`
2. En el modal, ingresa el texto en el campo de entrada
3. Haz clic en “Probar Prompt”
4. Verás la respuesta generada por IA en tiempo real

> Nota: los prompts deben tener `{input}` para marcar dónde se reemplaza el texto del usuario.

---

## 📦 JSON de componentes de ejemplo

```json
{
  "id": "1",
  "name": "Resumidor de texto",
  "type": "prompt",
  "tags": ["resumen", "texto"],
  "prompt": "Resume el siguiente texto:\n\n{input}",
  "description": "Devuelve un resumen del texto proporcionado",
  "usage": "POST /api/try-prompt\n{ prompt: '...', input: '...' }"
}
```

---

## 💡 Futuras mejoras

| Idea | Estado |
|------|--------|
| Editor visual de prompts | 🟡 Pendiente |
| Soporte para más modelos (Mistral, Phi) | 🟡 En camino |
| Exportación de componentes en Markdown/ZIP | 🔜 |
| Subida de imagen o PDF para análisis | 🔜 |

---

## 🧑‍💻 Autor

Desarrollado con 💙 por **Santiago Rodríguez**  
🎓 Full-stack Developer | DevOps | AI Enthusiast  
📫 [TuCorreo@ejemplo.com]

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.