# 🍽️ UNT Comedor — Sistema de Gestión del Comedor Universitario

Sistema web moderno para la gestión del menú y evaluación de la calidad del servicio del comedor universitario de la **Universidad Nacional de Trujillo (UNT)**, Perú.

Desarrollado bajo principios de mejora continua de ITIL 4, reemplaza el sistema informal de WhatsApp con una plataforma digital estructurada.

---

## Funcionalidades

**Estudiantes**
- Consulta del menú diario por turno (desayuno, almuerzo, cena)
- Historial de menús con filtros por fecha y turno
- Información nutricional detallada (calorías, proteínas, carbohidratos, grasas, hierro)
- Valoración anónima en 5 dimensiones: sabor, cantidad, variedad, higiene, atención
- Comentarios anónimos opcionales

**Administradores**
- CRUD completo de menús con hasta 3 imágenes por menú (Cloudinary)
- Dashboard analítico con 7 visualizaciones Recharts
- KPIs de satisfacción, tendencias temporales, comparación por turno
- Tabla cruzada dimensión × turno con indicadores de color
- Feed de comentarios recientes con promedios

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS v4, Recharts, Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Base de Datos | PostgreSQL + Prisma ORM |
| Autenticación | JWT + bcrypt |
| Imágenes | Cloudinary |
| Validación | Zod (frontend y backend) |
| Formularios | React Hook Form + @hookform/resolvers |

---

## Arquitectura

```
Cliente (Next.js) ←→ API REST (Express) ←→ PostgreSQL (Prisma)
```

Principios aplicados: Clean Architecture, SOLID, Repository Pattern, Modular Architecture.

```
backend/
├── prisma/              # Schema, seed, utilidades DB
└── src/
    ├── config/          # Env, Prisma client, Cloudinary
    ├── controllers/     # Manejo de requests HTTP
    ├── middlewares/      # Auth JWT, roles, validación, upload
    ├── repositories/    # Capa de acceso a datos
    ├── routes/          # Definición de endpoints
    ├── services/        # Lógica de negocio
    ├── types/           # Interfaces TypeScript
    ├── utils/           # Respuestas API, errores custom
    └── validators/      # Esquemas Zod

frontend/
└── src/
    ├── app/             # Pages (Next.js App Router)
    ├── components/      # Componentes reutilizables
    ├── hooks/           # useAuth, useTheme
    ├── lib/             # Axios client, utilidades
    ├── services/        # Llamadas API
    └── types/           # Interfaces compartidas
```

---

## Subir a GitHub

### 1. Crear el repositorio

1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `unt-comedor`
3. Dejalo **sin** README, .gitignore ni licencia (ya los tenemos)
4. Click en **Create repository**

### 2. Inicializar y subir

Abre una terminal en `C:\Users\User\Desktop\unt-comedor` y ejecuta:

```bash
git init
git add .
git commit -m "Initial commit: UNT Comedor full-stack app"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/unt-comedor.git
git push -u origin main
```

> Reemplaza `TU_USUARIO` con tu usuario de GitHub.

### 3. Autenticacion

Si nunca has usado git en esta PC, te pedira credenciales. Opciones:

- **GitHub CLI:** Instala [gh](https://cli.github.com/) y ejecuta `gh auth login`
- **Token personal:** GitHub > Settings > Developer settings > Personal access tokens > Generate new token (classic) con permiso `repo`, y usalo como contraseña

---

## Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- Cuenta de Cloudinary (para imágenes)

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd unt-comedor
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editar `.env` con tus datos:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/unt_comedor?schema=public"
JWT_SECRET=tu_secreto_jwt_seguro
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
FRONTEND_URL=http://localhost:3000
```

### 3. Base de datos

Crear la base de datos `unt_comedor` en PostgreSQL (pgAdmin o terminal), luego:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

### 5. Ejecutar

Terminal 1:
```bash
cd backend && npm run dev    # http://localhost:4000
```

Terminal 2:
```bash
cd frontend && npm run dev   # http://localhost:3000
```

---

## Credenciales de Prueba

| Rol | Código | Contraseña |
|-----|--------|-----------|
| Admin | ADMIN001 | Admin123! |
| Admin | ADMIN002 | Admin123! |
| Estudiante | 2020101001 | Student123! |
| Estudiante | 2020101002 | Student123! |

---

## API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/register | Registrar cuenta |
| GET | /api/auth/profile | Obtener perfil (auth) |

### Menús
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/menus/today | Menús de hoy |
| GET | /api/menus | Listar con filtros |
| GET | /api/menus/:id | Detalle de menú |
| POST | /api/menus | Crear menú (admin) |
| PUT | /api/menus/:id | Actualizar (admin) |
| DELETE | /api/menus/:id | Eliminar (admin) |
| POST | /api/menus/:id/images | Subir imágenes (admin) |
| DELETE | /api/menus/:id/images/:imageId | Eliminar imagen (admin) |

### Valoraciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/ratings | Crear valoración |
| GET | /api/ratings/check/:menuId | Verificar si ya valoró |
| GET | /api/ratings/stats | Estadísticas globales (admin) |
| GET | /api/ratings/stats/shifts | Stats por turno (admin) |
| GET | /api/ratings/stats/trends | Tendencias (admin) |
| GET | /api/ratings/stats/menu/:menuId | Stats de un menú (admin) |

---

## Despliegue

### Frontend → Vercel

```bash
cd frontend
npx vercel
```

Variables de entorno en Vercel:
- `NEXT_PUBLIC_API_URL` = URL del backend en Render

### Backend → Render

1. Crear Web Service en Render conectado al repo
2. Build command: `cd backend && npm install && npx prisma generate && npm run build`
3. Start command: `cd backend && npm start`
4. Variables de entorno: todas las de `.env`

### Base de datos → Render PostgreSQL

1. Crear PostgreSQL en Render
2. Usar la Internal Database URL en `DATABASE_URL`

---

## Scripts útiles

```bash
# Backend
npm run dev              # Desarrollo con hot reload
npm run build            # Compilar TypeScript
npm run prisma:studio    # Explorador visual de BD
npm run db:check         # Verificar estado de BD
npm run db:reset         # Limpiar todas las tablas

# Frontend
npm run dev              # Desarrollo
npm run build            # Build de producción
npm run lint             # Linter
```

---

## Seguridad

- Hashing de contraseñas con bcrypt (12 rounds)
- JWT con expiración configurable
- Validación de inputs con Zod en frontend y backend
- CORS restringido al dominio del frontend
- Helmet para headers de seguridad
- Rate limiting (100 requests / 15 min)
- Soft delete para menús
- Valoraciones únicas por usuario/menú

---

## Licencia

Proyecto académico — Universidad Nacional de Trujillo, 2025.
