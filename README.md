# Premium Catalog IA 🚀

## Catálogo de Componentes de Inteligencia Artificial

Una plataforma moderna y completa para descubrir, evaluar y utilizar componentes de IA — frontend en React + Vite y backend en Node/Express con integración para modelos y APIs de terceros.

## 🌟 Características

### Frontend
- ⚛️ React 18 con Vite
- 🎨 TailwindCSS para estilos
- 🎭 Framer Motion para animaciones
- 📱 PWA con soporte offline
- 🤖 TensorFlow.js para ML en el navegador
- 🔌 WebSockets para características real-time

### Backend
- 🚀 Node.js con Express
- 📊 MongoDB para base de datos
- 🔄 Redis para caché y sesiones
- 🔐 JWT authentication
- 📡 Socket.IO para real-time
- 📈 Prometheus metrics

### DevOps
- 🐳 Docker & Docker Compose
- ☸️ Kubernetes ready
- 🔄 CI/CD con GitHub Actions
- 📊 Monitoring con Prometheus
- 🔒 Security best practices

## 📦 Instalación

### Requisitos
- Node.js 18+
- MongoDB 6+
- Redis 7+
- npm o yarn

## Instalación y ejecución (local)

1) Clona el repositorio:

```powershell
git clone https://github.com/Santiago13dev/premiumcatalogoia.git
cd premiumcatalogoia
git checkout feature/cambios-MVP
```

2) Instala dependencias (raíz = frontend):

```powershell
npm install
cd server; npm install; cd ..
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env en la raíz
cp .env.example .env

# Editar con tus configuraciones
nano .env
```

4. **Variables de entorno necesarias**
```env
# Cliente (Vite): todas las variables públicas deben empezar con VITE_
VITE_OPENAI_API_KEY=your-openai-key-here
VITE_ANTHROPIC_API_KEY=your-anthropic-key-here
VITE_HUGGINGFACE_API_KEY=your-hf-key-here

# Server (si quieres que el backend use variables desde la raíz)
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ai-catalog
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-32-byte-encryption-key
```

Importante: las claves para APIs públicas del frontend deben usar el prefijo `VITE_` para ser accesibles desde el bundle de Vite. Si prefieres mantener las claves en el backend, colócalas en `server/.env` y expón endpoints del servidor en lugar de enviar claves al cliente.

4) Cómo ejecutar en desarrollo

Opción con Docker (recomendado cuando quieras replicar el entorno completo):

```powershell
docker-compose up -d
```

Opción local (separar terminales):

```powershell
# Terminal 1 - MongoDB (si no usas Docker)
# mongod

# Terminal 2 - Redis (si no usas Docker)
# redis-server

# Terminal 3 - Backend
cd server
npm run server:dev

# Terminal 4 - Frontend
cd ..
npm run dev
```

Accede a la app en `http://localhost:5173` y a la API en `http://localhost:3000`.

## ⚠️ Uso de API keys para probar componentes de IA (importante)

Los componentes de IA en `src/components/` usan servicios que delegan peticiones a APIs externas (OpenAI, Anthropic, HuggingFace, etc.). Para probarlos localmente debes proporcionar tus propias API keys.

Pasos recomendados:

1. Crea un archivo `.env` en la raíz del proyecto y añade las variables `VITE_...` mostradas arriba.
2. Si prefieres no exponer las claves al frontend, coloca las claves en `server/.env` (sin `VITE_`), y cambia `src/services/aiService.js` para que apunte a endpoints del backend que envían las respuestas.
3. Reinicia el servidor de desarrollo después de cambiar `.env`.

Ejemplo rápido (PowerShell) — establecer variables de entorno temporales en la sesión actual antes de arrancar el frontend:

```powershell
#$env:VITE_OPENAI_API_KEY = 'sk-...'
#$env:VITE_ANTHROPIC_API_KEY = 'anthropic-...'
npm run dev
```

Advertencias de seguridad:

- Nunca comites tus claves ni subas `.env` con secretos al repositorio.
- Usa variables de entorno del backend cuando sea posible y aplica límites/rate limiting.
- Para CI/CD, configura secrets en el proveedor (GitHub Actions, etc.) y no incluyas claves en los workflows.

## 🛠️ Scripts útiles

```powershell
# Frontend desarrollo
npm run dev

# Backend desarrollo (desde /server)
cd server; npm run server:dev

# Build frontend
npm run build

# Tests
npm test
```

## 🧪 Testing

El proyecto incluye tests básicos con Jest en `src/__tests__/`. Ejecuta:

```powershell
npm test
```

## 🚀 Deployment

- Vercel: despliega el frontend y proporciona las variables `VITE_...` como secretos.
- PM2: `pm2 start pm2.config.js` para el backend.
- Docker: `docker build -t premiumcatalogoia:latest .` y `docker run -p 3000:3000 premiumcatalogoia:latest`.
- Kubernetes: `kubectl apply -f kubernetes/` (revisa `kubernetes/*.yaml` para variables y secretos).

## � Licencia

Este proyecto está bajo la Licencia MIT — ver [LICENSE](LICENSE).
Santiago13dev 