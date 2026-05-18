# Registro de Cambios — UNT Comedor

## 2026-05-17

---

### Correcciones de Diseño Responsive

#### Pagina del Estudiante (`frontend/src/app/(dashboard)/student/page.tsx`)

| Problema | Solucion |
|----------|----------|
| Grid de menus usaba `grid-cols-3` fijo, tarjetas ilegibles en mobile | Cambiado a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Navbar comprimido en pantallas <375px | Padding, texto y gaps responsivos (`text-xs sm:text-sm`, `gap-3 sm:gap-6`) |
| Avatar y boton logout muy grandes en mobile | Reducidos con variantes `w-8 h-8 sm:w-9 sm:h-9` |
| Footer saltaba directo a 2 columnas en `md` | Agregado breakpoint intermedio `sm:grid-cols-2` |

#### Panel Admin — Layout (`frontend/src/app/(dashboard)/admin/layout.tsx`)

| Problema | Solucion |
|----------|----------|
| Boton hamburguesa sin funcionalidad en mobile | Implementado sidebar drawer con overlay, estado `sidebarOpen`, cierre al navegar o tocar fuera |
| Sin navegacion posible en pantallas <768px | Sidebar mobile completo con todos los links de navegacion |

#### Panel Admin — Gestion de Menus (`frontend/src/app/(dashboard)/admin/menus/page.tsx`)

| Problema | Solucion |
|----------|----------|
| Grid de informacion nutricional 5 columnas apretado en mobile | Cambiado a `grid-cols-3 sm:grid-cols-5` |
| Grid de platos rigido con columna fija de 7.5rem | Responsive `grid-cols-[1fr_auto] sm:grid-cols-[1fr_7.5rem_auto]` |

#### Panel Admin — Dashboard (`frontend/src/app/(dashboard)/admin/page.tsx`)

| Problema | Solucion |
|----------|----------|
| Tarjetas de acciones rapidas con padding excesivo en mobile | Padding reducido `p-4 sm:p-6`, gaps `gap-3 sm:gap-4`, texto `text-xs sm:text-sm` |

#### Panel Admin — Metricas (`frontend/src/app/(dashboard)/admin/metrics/page.tsx`)

| Problema | Solucion |
|----------|----------|
| Charts con altura fija de 256px en todas las pantallas | Altura responsive `h-48 sm:h-64` |
| Grids de metricas sin breakpoint intermedio | Agregado `sm:grid-cols-2` antes de `md:grid-cols-3` |
| Padding de cards excesivo en mobile | Reducido a `p-4 sm:p-6` |

---

### Nuevas Funcionalidades

#### 1. CRUD Completo de Usuarios (Panel Admin)

**Descripcion:** Los administradores ahora pueden crear, editar y eliminar usuarios directamente desde el panel.

**Backend — Nuevos endpoints:**

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/users` | Crear usuario (hash bcrypt, validacion de duplicados) |
| PUT | `/api/users/:id` | Editar nombre, email, rol, estado |
| DELETE | `/api/users/:id` | Eliminar usuario permanentemente |

**Frontend — Interfaz:**
- Modal para crear usuario nuevo (codigo universitario, nombre, email, contrasena, rol)
- Modal para editar usuario existente (nombre, email, rol, estado activo/inactivo)
- Boton eliminar con dialogo de confirmacion
- Mensajes de error del backend mostrados en toast

**Archivos modificados:**
- `backend/src/repositories/user.repository.ts` — Metodos `update()` y `delete()`
- `backend/src/services/user.service.ts` — Logica de negocio con validaciones
- `backend/src/controllers/user.controller.ts` — Handlers `create`, `update`, `delete`
- `backend/src/routes/user.routes.ts` — Rutas POST, PUT, DELETE
- `frontend/src/services/user.service.ts` — Funciones `create`, `update`, `delete`
- `frontend/src/app/(dashboard)/admin/users/page.tsx` — Reescrito con modal y acciones

---

#### 2. Busqueda de Menus por Plato (Vista Estudiante)

**Descripcion:** Los estudiantes pueden buscar menus escribiendo el nombre de un plato o parte de la descripcion del menu.

**Comportamiento:**
- Barra de busqueda disponible en vista "Menu de Hoy"
- Barra de busqueda disponible en vista "Historial"
- Filtrado local instantaneo (sin llamada al servidor)
- Busca en nombres de platos y descripcion del menu
- Combinable con el filtro por turno

**Archivo modificado:**
- `frontend/src/app/(dashboard)/student/page.tsx`

---

#### 3. Filtro por Turno en Vista "Menu de Hoy" (Estudiante)

**Descripcion:** Botones segmentados que permiten filtrar los menus del dia por turno especifico.

**Opciones disponibles:**
- Todos (muestra desayuno + almuerzo + cena)
- Desayuno
- Almuerzo
- Cena

**Comportamiento:**
- Filtrado local instantaneo
- Combinable con la busqueda por texto
- Responsive: texto compacto en mobile

**Archivo modificado:**
- `frontend/src/app/(dashboard)/student/page.tsx`

---

#### 4. Exportar Valoraciones a Excel (Panel Admin)

**Descripcion:** Los administradores pueden descargar un archivo Excel (.xlsx) con formato profesional de tabla con colores.

**Dependencia agregada:** `exceljs`

**Backend — Nuevo endpoint:**

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/ratings/export` | Genera y descarga archivo Excel (.xlsx) |

**Parametros opcionales de filtro:**
- `dateFrom` — Fecha desde
- `dateTo` — Fecha hasta
- `shift` — Turno (BREAKFAST, LUNCH, DINNER)

**Diseno del Excel:**
- Titulo con fondo indigo y texto blanco
- Headers con fondo violeta, texto blanco centrado
- Filas con colores alternados (zebra striping)
- Color condicional en promedio: verde (>=4), amarillo (>=3), rojo (<3)
- Color por turno: amarillo (Desayuno), azul (Almuerzo), violeta (Cena)
- Comentarios con word-wrap
- Fila de resumen con total y promedio general
- Primera fila fija (frozen pane)

**Columnas:**
| Columna | Descripcion |
|---------|-------------|
| Fecha | Fecha del menu |
| Turno | Desayuno / Almuerzo / Cena (con color) |
| Descripcion | Descripcion del menu |
| Sabor | Puntuacion 1-5 |
| Cantidad | Puntuacion 1-5 |
| Variedad | Puntuacion 1-5 |
| Higiene | Puntuacion 1-5 |
| Atencion | Puntuacion 1-5 |
| Promedio | Promedio (con color condicional) |
| Comentario | Comentario del estudiante |
| Fecha Valoracion | Cuando se registro |

**Frontend:**
- Boton "Exportar Excel" en la pagina de Metricas y Valoraciones
- Descarga automatica con nombre `valoraciones_YYYY-MM-DD.xlsx`
- Indicador de carga durante la exportacion

**Archivos modificados:**
- `backend/src/services/rating.service.ts` — Metodo `exportRatings()`
- `backend/src/controllers/rating.controller.ts` — Handler `exportExcel` con ExcelJS
- `backend/src/routes/rating.routes.ts` — Ruta GET `/export`
- `frontend/src/services/rating.service.ts` — Funcion `exportExcel()`
- `frontend/src/app/(dashboard)/admin/metrics/page.tsx` — Boton de exportacion

---

#### 5. Sistema de Tickets / Mesa de Servicio (ITIL - Incident Management)

**Descripcion:** Modulo completo de gestion de incidentes alineado a ITIL 4. Los estudiantes crean reclamos sobre el servicio del comedor y los administradores gestionan su resolucion con un workflow de estados.

**Modelos Prisma agregados:**

| Modelo | Campos principales |
|--------|--------------------|
| `Ticket` | id, userId, category, priority, subject, description, status, resolvedAt, closedAt |
| `TicketResponse` | id, ticketId, userId, message (hilo de conversacion) |

**Enums agregados:** `TicketStatus` (OPEN, IN_REVIEW, RESOLVED, CLOSED), `TicketPriority` (LOW, MEDIUM, HIGH, URGENT), `TicketCategory` (FOOD_QUALITY, HYGIENE, SERVICE, INFRASTRUCTURE, SCHEDULE, OTHER)

**Backend — Endpoints:**

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/tickets` | Crear reclamo (estudiante autenticado) |
| GET | `/api/tickets/my` | Mis reclamos (estudiante) |
| GET | `/api/tickets` | Todos los reclamos (admin) |
| GET | `/api/tickets/stats` | Estadisticas del dashboard (admin) |
| GET | `/api/tickets/export` | Exportar Excel con filtros (admin) |
| GET | `/api/tickets/:id` | Detalle de ticket (ambos roles) |
| PATCH | `/api/tickets/:id/status` | Cambiar estado (admin) |
| POST | `/api/tickets/:id/responses` | Agregar respuesta (ambos roles) |

**Workflow de estados:**
- `OPEN` → `IN_REVIEW` / `CLOSED`
- `IN_REVIEW` → `RESOLVED` / `OPEN` / `CLOSED`
- `RESOLVED` → `CLOSED` / `IN_REVIEW`
- `CLOSED` → (estado terminal, no se puede reabrir)

**Validaciones (Zod):**
- Asunto: 5-100 caracteres
- Descripcion: 10-1000 caracteres
- Respuestas: 1-1000 caracteres
- Transiciones de estado validadas en el servicio

**Frontend — Vista Admin (`/admin/tickets`):**
- Dashboard con 4 KPIs: total tickets, pendientes, alta prioridad, tiempo promedio de resolucion
- Tabla con columnas: Asunto, Estudiante, Categoria, Prioridad, Estado, Fecha
- Filtros por estado, prioridad y categoria
- Vista detalle con botones de cambio de estado y hilo de respuestas
- Boton "Exportar Excel" que respeta filtros activos
- Paginacion
- Link "Mesa de Servicio" agregado al sidebar admin

**Frontend — Vista Estudiante (`/student/tickets`):**
- Listado de reclamos propios con badges de estado
- Formulario de creacion (categoria, prioridad, asunto, descripcion)
- Vista detalle con conversacion tipo chat (mensajes del estudiante vs soporte)
- Filtro por estado con pills segmentados
- Empty states con CTA para crear primer reclamo

**Exportar Excel (reclamos):**
- Columnas: Asunto, Estudiante, Codigo, Categoria, Prioridad, Estado, Fecha Creacion, Fecha Resolucion
- Colores por estado: azul (Abierto), amarillo (En Revision), verde (Resuelto), gris (Cerrado)
- Colores por prioridad: gris (Baja), azul (Media), naranja (Alta), rojo (Urgente)
- Fila de resumen con conteo por estado
- Respeta filtros activos del admin

**Refactorizacion — Student Layout:**
- Creado `student/layout.tsx` con navbar compartido (logo, links, avatar, logout) y footer (horarios, contacto)
- Eliminado navbar/footer duplicado de `student/page.tsx`
- Toggle "Menu de Hoy / Historial" movido al contenido de la pagina como control segmentado
- Pagina de tickets hereda automaticamente el navbar y footer del layout

**Archivos creados:**
- `backend/prisma/schema.prisma` — Modelos Ticket, TicketResponse, enums
- `backend/src/validators/ticket.validator.ts`
- `backend/src/repositories/ticket.repository.ts`
- `backend/src/services/ticket.service.ts`
- `backend/src/controllers/ticket.controller.ts`
- `backend/src/routes/ticket.routes.ts`
- `frontend/src/services/ticket.service.ts`
- `frontend/src/app/(dashboard)/admin/tickets/page.tsx`
- `frontend/src/app/(dashboard)/student/tickets/page.tsx`
- `frontend/src/app/(dashboard)/student/layout.tsx`

**Archivos modificados:**
- `backend/src/routes/index.ts` — Registro de rutas `/tickets`
- `backend/src/*/index.ts` — Barrel exports actualizados
- `frontend/src/types/index.ts` — Tipos Ticket, TicketResponse, TicketStats, labels
- `frontend/src/services/index.ts` — Export ticketService
- `frontend/src/app/(dashboard)/admin/layout.tsx` — Link "Mesa de Servicio" en sidebar
- `frontend/src/app/(dashboard)/student/page.tsx` — Refactorizado (layout compartido)

---

### Resumen de Archivos Modificados

```
backend/
├── prisma/
│   └── schema.prisma              (+ Ticket, TicketResponse, enums)
├── src/
│   ├── controllers/
│   │   ├── rating.controller.ts   (+ exportExcel)
│   │   ├── ticket.controller.ts   (NUEVO — CRUD + exportExcel)
│   │   └── user.controller.ts     (+ create, update, delete, exportExcel)
│   ├── repositories/
│   │   ├── ticket.repository.ts   (NUEVO)
│   │   └── user.repository.ts     (+ update, delete)
│   ├── routes/
│   │   ├── rating.routes.ts       (+ ruta /export)
│   │   ├── ticket.routes.ts       (NUEVO — 8 endpoints)
│   │   └── user.routes.ts         (+ rutas POST, PUT, DELETE)
│   ├── services/
│   │   ├── rating.service.ts      (+ exportRatings)
│   │   ├── ticket.service.ts      (NUEVO)
│   │   └── user.service.ts        (+ create, update, delete)
│   └── validators/
│       └── ticket.validator.ts    (NUEVO)

frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── admin/
│   │       │   ├── layout.tsx         (sidebar mobile + link Mesa de Servicio)
│   │       │   ├── page.tsx           (responsive acciones rapidas)
│   │       │   ├── menus/page.tsx     (responsive formulario)
│   │       │   ├── metrics/page.tsx   (responsive + boton exportar)
│   │       │   ├── tickets/page.tsx   (NUEVO — dashboard + tabla + detalle)
│   │       │   └── users/page.tsx     (reescrito con CRUD completo)
│   │       └── student/
│   │           ├── layout.tsx         (NUEVO — navbar + footer compartido)
│   │           ├── page.tsx           (refactorizado, responsive + busqueda)
│   │           └── tickets/page.tsx   (NUEVO — crear, listar, detalle)
│   ├── services/
│   │   ├── rating.service.ts      (+ exportExcel)
│   │   ├── ticket.service.ts      (NUEVO)
│   │   └── user.service.ts        (+ create, update, delete, exportExcel)
│   └── types/
│       └── index.ts               (+ Ticket, TicketResponse, TicketStats, labels)
```
