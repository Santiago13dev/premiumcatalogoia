# Premium Catalog IA 🚀

## Catálogo de Componentes de Inteligencia Artificial

Una plataforma moderna y completa para descubrir, evaluar y utilizar componentes de IA.

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

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Santiago13dev/premiumcatalogoia.git
cd premiumcatalogoia
```

2. **Instalar dependencias**
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
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
# Server
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/ai-catalog
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-32-byte-encryption-key

# AI APIs (opcional)
VITE_OPENAI_API_KEY=your-openai-key
VITE_ANTHROPIC_API_KEY=your-anthropic-key
VITE_HUGGINGFACE_API_KEY=your-hf-key
```

5. **Iniciar servicios de desarrollo**

**Opción 1: Con Docker Compose (recomendado)**
```bash
docker-compose up -d
```

**Opción 2: Manual**
```bash
# Terminal 1 - MongoDB
mongod

# Terminal 2 - Redis
redis-server

# Terminal 3 - Backend
npm run server:dev

# Terminal 4 - Frontend
npm run dev
```

6. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379

## 🛠️ Scripts disponibles

```bash
# Desarrollo
npm run dev          # Frontend en modo desarrollo
npm run server:dev   # Backend en modo desarrollo

# Producción
npm run build        # Build del frontend
npm start           # Iniciar servidor backend

# Testing
npm test            # Ejecutar tests
npm run test:watch  # Tests en modo watch
npm run test:coverage # Coverage report

# Linting
npm run lint        # Verificar código

# Migraciones
npm run migrate     # Ejecutar migraciones de DB
```

## 📁 Estructura del proyecto

```
premiumcatalogoia/
├── src/                  # Código fuente del frontend
│   ├── components/       # Componentes React
│   ├── services/         # Servicios y APIs
│   ├── hooks/           # Custom hooks
│   ├── context/         # Context providers
│   └── utils/           # Utilidades
├── server/              # Backend API
│   ├── controllers/     # Controladores
│   ├── models/         # Modelos de MongoDB
│   ├── routes/         # Rutas de API
│   ├── middleware/     # Middleware
│   ├── websocket/      # WebSocket server
│   └── monitoring/     # Metrics y health
├── public/             # Archivos estáticos
├── scripts/            # Scripts de utilidad
├── kubernetes/         # Manifiestos K8s
├── tests/             # Tests
└── docs/              # Documentación
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
vercel --prod
```

### PM2 (Backend)
```bash
pm2 start pm2.config.js
```

### Docker
```bash
docker build -t premiumcatalogoia:latest .
docker run -p 3000:3000 premiumcatalogoia:latest
```

### Kubernetes
```bash
kubectl apply -f kubernetes/
```

## 📝 API Documentation

La documentación completa de la API está disponible en [/docs/API.md](./docs/API.md)

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🔒 Seguridad

- Helmet.js para headers de seguridad
- Rate limiting con Redis
- Input validation y sanitización
- JWT con refresh tokens
- Encriptación de datos sensibles
- Audit logging

## 📊 Monitoring

- Health checks: `/health`
- Metrics: `/metrics` (Prometheus)
- Logs: Winston con rotación
- Performance monitoring

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autor

**Santiago Dev**
- GitHub: [@Santiago13dev](https://github.com/Santiago13dev)

## 🙏 Agradecimientos

- OpenAI por las APIs de IA
- TensorFlow.js team
- Comunidad de React
- Todos los contribuidores

---

⭐ Si este proyecto te fue útil, considera darle una estrella!