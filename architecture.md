# Documento de Arquitectura: TeamFlow

## 1. Problem Statement

Las empresas de software y agencias enfrentan pérdida de productividad debido a la dispersión de la información entre múltiples canales de comunicación y herramientas de gestión desconectadas. TeamFlow centraliza la operación permitiendo crear una jerarquía clara (Organización → Equipos → Proyectos → Tareas), garantizando que cada miembro tenga visibilidad exacta de sus responsabilidades bajo un sistema estricto de roles y permisos.

## 2. Functional Requirements

### Autenticación y Sesiones
- El sistema debe permitir registro, inicio de sesión y cierre de sesión seguro.
- El sistema debe manejar la renovación de sesiones mediante Refresh Tokens.

### Gestión de Organización y Roles
- Un usuario debe poder crear una Organización y convertirse en OWNER.
- El OWNER debe poder invitar a otros usuarios asignando roles de ADMIN o MEMBER.
- Los ADMIN deben poder administrar equipos y usuarios.
- Los MEMBER solo pueden trabajar dentro de los proyectos a los que son asignados.

### Equipos y Proyectos
- El sistema debe permitir el CRUD (Crear, Leer, Actualizar, Eliminar) de Equipos.
- El sistema debe permitir asignar usuarios a Equipos específicos.
- El sistema debe permitir el CRUD de Proyectos con estados definidos (Backlog, In Progress, Done).

### Gestión de Tareas
- El sistema debe permitir crear tareas dentro de un proyecto con: título, descripción, estado, prioridad, fecha de vencimiento y responsable.
- Los usuarios deben poder comentar en las tareas.
- Los usuarios deben poder adjuntar archivos a las tareas.

### Notificaciones
- El sistema debe emitir alertas en tiempo real cuando se actualiza el estado de una tarea o se asigna un nuevo responsable.

## 3. Non-Functional Requirements

### Arquitectura y Código
- El backend debe construirse bajo Clean Architecture y principios SOLID, aislando la lógica de dominio de la infraestructura (PostgreSQL).
- El frontend debe utilizar una arquitectura basada en *features*, separando el estado del servidor (TanStack Query) del estado de la UI.

### Infraestructura y Despliegue
- El sistema debe ser "Dockerizado" para garantizar consistencia entre el entorno local y producción.
- La base de datos debe ser relacional (PostgreSQL).
- El almacenamiento de archivos debe delegarse a un servicio en la nube (AWS S3).
- El despliegue debe estar automatizado mediante pipelines de CI/CD (GitHub Actions).

### Seguridad
- Las contraseñas deben ser encriptadas mediante bcrypt.
- La autorización de endpoints debe realizarse mediante JWT (JSON Web Tokens).

### Observabilidad
- El sistema debe exponer un endpoint de salud (`GET /health`).
- Los errores deben registrarse de forma centralizada (logger global) y enviarse a CloudWatch en producción.

## 4. Architecture

### 4.1 Visión general

```
                    SaaS
                     │
          ┌──────────┴──────────┐
          │                     │
       Frontend              Backend
        React                 Node
          │                     │
          └──────────┬──────────┘
                      │
                  PostgreSQL
```

### 4.2 Backend — Clean Architecture

El backend se organiza en capas concéntricas. La regla de dependencia es siempre hacia adentro: `infrastructure` depende de `application` y `domain`, pero `domain` **no conoce nada** de frameworks, ORMs ni HTTP.

```
src/
│
├── domain/
│   ├── entities/        → Reglas de negocio puras (User, Task, Project...)
│   ├── repositories/    → Interfaces (contratos), no implementaciones
│   └── errors/           → Errores de dominio (DomainError, InvalidStateError)
│
├── application/
│   ├── use-cases/        → Orquestan la lógica (CreateTaskUseCase, InviteUserUseCase)
│   └── dto/               → Objetos de entrada/salida de cada caso de uso
│
├── infrastructure/
│   ├── database/          → Configuración de Prisma, migraciones
│   ├── repositories/      → Implementaciones concretas (PrismaTaskRepository)
│   ├── http/               → Controllers, guards, middlewares
│   └── services/           → S3, email, notificaciones, WebSockets
│
└── main.ts
```

Flujo de una petición:

```
HTTP
 ↓
Controller            (infrastructure/http)
 ↓
Use Case               (application/use-cases)
 ↓
Domain                  (domain/entities)
 ↓
Repository Interface     (domain/repositories)
 ↓
Infrastructure Repo       (infrastructure/repositories)
 ↓
PostgreSQL
```

**Por qué el dominio no importa Prisma:** si mañana cambiamos PostgreSQL por otra base de datos, o Prisma por otro ORM, la lógica de negocio (`domain` y `application`) no debería tocarse — solo se reemplaza la implementación en `infrastructure`. Esto se logra mediante el **Repository Pattern**: el dominio define la interfaz (`ITaskRepository`), y la infraestructura la implementa e inyecta vía Dependency Injection (NestJS `providers`).

### 4.3 Frontend — Feature-based architecture

```
src/
│
├── app/            → Configuración global (providers, router, query client)
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── teams/
│   ├── projects/
│   └── tasks/
│
├── components/      → Componentes UI reutilizables (no atados a una feature)
├── hooks/
├── services/         → Clientes HTTP por dominio
├── routes/
├── lib/
└── types/
```

Cada carpeta dentro de `features/` agrupa sus propios componentes, hooks, servicios y tipos, en vez de dispersar todo por tipo de archivo (`components/`, `hooks/`, etc. globales para toda la app).

## 5. Database Model

### 5.1 Entidades principales

`User`, `Organization`, `OrganizationMember`, `Team`, `TeamMember`, `Project`, `Task`, `Comment`, `Notification`, `RefreshToken`.

### 5.2 Relaciones

```
Organization
    │
    ├── OrganizationMember (User ↔ Organization, con rol)
    │
    ├── Team
    │     └── TeamMember (User ↔ Team)
    │
    └── Project
             │
             └── Task
                    │
                    ├── Comment
                    └── Assignee (User)

User
    │
    └── RefreshToken (1:N)
```

### 5.3 Notas de diseño

- `OrganizationMember` es una tabla intermedia (many-to-many) entre `User` y `Organization` que además guarda el `role` (OWNER, ADMIN, MEMBER).
- `TeamMember` cumple el mismo rol entre `User` y `Team`.
- `Task.assigneeId` referencia a `User`, y `Task.projectId` a `Project` (relación obligatoria).
- `RefreshToken` se guarda hasheado en base de datos para poder revocar sesiones (logout, rotación de tokens).
- Índices recomendados: `OrganizationMember(userId, organizationId)` único, `Task(projectId, status)` para filtrado por tablero.

## 6. Authentication

### 6.1 Endpoints

```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /me
```

### 6.2 Flujo

```
Password
   ↓
bcrypt (hash + salt)
   ↓
Verificación en login
   ↓
JWT access token (corta duración, ej. 15 min)
   +
Refresh token (larga duración, ej. 7 días, httpOnly cookie)
```

### 6.3 Decisiones clave

- **Access token**: JWT firmado, enviado en header `Authorization: Bearer`, vida corta para minimizar el riesgo si se filtra.
- **Refresh token**: almacenado en cookie `httpOnly` + `secure`, y persistido (hasheado) en la tabla `RefreshToken` para poder invalidarlo en logout o ante actividad sospechosa (rotación de tokens).
- **Logout**: revoca el refresh token en base de datos, no solo lo borra del cliente.
- Diferencia clave a poder explicar en entrevista: **authentication** responde "¿quién eres?" (login, JWT válido); **authorization** responde "¿qué puedes hacer?" (roles y permisos, sección 7).

## 7. Authorization

### 7.1 Roles

```
OWNER
 ↓
Control total de la organización (billing, eliminar org, todo lo de ADMIN)

ADMIN
 ↓
Administrar usuarios, equipos y proyectos

MEMBER
 ↓
Trabajar dentro de los proyectos/tareas asignadas
```

### 7.2 Estrategia (mantenible, no `if` disperso)

En vez de repetir `if (user.role === 'ADMIN')` en cada controller, se centraliza la autorización con:

- **Guards de NestJS** (`RolesGuard`) que leen un decorador `@Roles('OWNER', 'ADMIN')` sobre cada endpoint.
- Un **Policy/Permission layer** en `application` que encapsula reglas de negocio más finas (ej. "un MEMBER solo puede editar tareas donde es assignee"), reutilizable tanto desde controllers como desde use cases.
- Los use cases reciben el usuario autenticado y delegan la validación de permisos a este layer, no a lógica ad-hoc.

Ejemplo conceptual:

```
@Roles('OWNER', 'ADMIN')
@Post('/teams')
createTeam(...)
```

## 8. API Design

### 8.1 Convenciones REST

- Recursos en plural, anidados cuando hay pertenencia clara: `/organizations/:id/members`, `/projects/:id/tasks`.
- Códigos de estado HTTP estándar (`200`, `201`, `400`, `401`, `403`, `404`, `409`).
- Formato de error consistente: `{ statusCode, message, error, timestamp, path }`.
- Documentación autogenerada con **Swagger/OpenAPI**, disponible en `/api/docs`.

### 8.2 Endpoints principales

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /me

POST   /organizations
GET    /organizations/:id
PATCH  /organizations/:id
POST   /organizations/:id/members
DELETE /organizations/:id/members/:userId

GET    /teams
POST   /teams
PATCH  /teams/:id
DELETE /teams/:id

GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

GET    /projects/:id/tasks
POST   /projects/:id/tasks
PATCH  /tasks/:id
DELETE /tasks/:id

GET    /health
```

### 8.3 Prácticas transversales

- **Pagination**: `?page=&limit=` (cursor-based si el volumen de datos lo justifica).
- **Filtering/Sorting**: `?status=&assigneeId=&sortBy=&order=`.
- **Validation**: DTOs con `class-validator` en el backend, `Zod` en el frontend (contrato compartido conceptualmente).
- **Transactions**: operaciones multi-tabla (ej. crear proyecto + tarea inicial) envueltas en transacciones de Prisma.
- **Error handling**: filtro global de excepciones que traduce errores de dominio a respuestas HTTP.

## 9. Deployment

### 9.1 Local — Docker Compose

```
docker compose up
```

Levanta 3 servicios: `frontend` (React), `backend` (Node), `db` (PostgreSQL), con variables de entorno inyectadas vía `.env` y volúmenes para persistencia de datos.

### 9.2 Producción — AWS

```
                    Internet
                       │
                       ↓
                  CloudFront (CDN)
                       │
                       ↓
                  React App (S3 estático o ECS)
                       
                       │
                       ↓
                   Backend API
                       │
                    AWS ECS
                    (Fargate)
                       │
                       ↓
                  PostgreSQL (RDS)
```

- **Archivos subidos por usuarios**: Backend genera *presigned URLs* → el cliente sube directo a **S3** (evita cargar el archivo por el servidor).
- **Logs**: aplicación → **CloudWatch** (logs estructurados + métricas + alarms).
- **Secrets**: variables sensibles (DB credentials, JWT secret) gestionadas vía AWS Secrets Manager / variables de entorno de ECS, nunca hardcodeadas.

### 9.3 CI/CD — GitHub Actions

```
Pull Request
     ↓
Lint
     ↓
Tests (unit + integration)
     ↓
Build
     ↓
Docker image
     ↓
Deploy (ECS)
```

Cada Pull Request ejecuta automáticamente linting, tests y build; al hacer merge a `main`, el pipeline construye la imagen Docker y despliega a ECS/Fargate.
