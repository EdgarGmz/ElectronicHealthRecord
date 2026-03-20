# Templates de Issues para GitHub Projects

Este documento contiene templates listos para usar al crear issues en GitHub Projects para cada fase del proyecto.

---

## 🎯 Cómo Usar Estos Templates

1. Ve a **Issues** → **New issue** en GitHub
2. Copia el template correspondiente
3. Pega en el editor de issue
4. Personaliza según tu necesidad
5. Asigna labels, milestone, y miembros del equipo
6. Crea el issue

---

## Template General

```markdown
## 📋 Descripción
[Descripción clara y concisa de lo que se necesita hacer]

## 🎯 Objetivo
[¿Por qué es importante esta tarea? ¿Qué problema resuelve?]

## ✅ Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## 📝 Tareas
- [ ] Subtarea 1
- [ ] Subtarea 2
- [ ] Subtarea 3

## 🔗 Dependencias
- Depende de: #[número]
- Bloquea a: #[número]

## ⏱️ Estimación
- [ ] Pequeña (< 1 día)
- [ ] Media (1-3 días)
- [ ] Grande (> 3 días)

## 📎 Recursos
[Links, documentos, o referencias útiles]

---
**Fase:** [Análisis/Diseño/Pruebas/UAT/Despliegue]  
**Prioridad:** [Alta/Media/Baja]
```

---

## 📊 FASE 1: ANÁLISIS

### Template 1: Requisitos Funcionales

```markdown
## [Análisis] Definir Requisitos Funcionales

### 📋 Descripción
Identificar y documentar todos los requisitos funcionales del sistema Electronic Health Record.

### 🎯 Objetivo
Tener una lista completa y clara de las funcionalidades que debe tener el sistema para cumplir con las necesidades de los usuarios (personal médico, psicología, y administradores).

### ✅ Criterios de Aceptación
- [ ] Lista completa de módulos principales identificados
- [ ] Cada funcionalidad tiene una descripción detallada
- [ ] Casos de uso documentados para funcionalidades principales
- [ ] Historias de usuario creadas (formato: Como [rol], quiero [acción], para [beneficio])
- [ ] Documento revisado y aprobado por el equipo

### 📝 Tareas
- [ ] Investigar sistemas similares de salud electrónica
- [ ] Entrevistar/encuestar a stakeholders (enfermería, psicología, administradores)
- [ ] Listar funcionalidades del módulo de Expedientes Médicos
- [ ] Listar funcionalidades del módulo de Citas
- [ ] Listar funcionalidades del módulo de Medicamentos
- [ ] Listar funcionalidades del módulo de Reportes
- [ ] Listar funcionalidades del módulo de Autenticación/Autorización
- [ ] Crear documento en formato Markdown o Google Docs
- [ ] Priorizar funcionalidades (Must-have, Should-have, Nice-to-have)

### 🔗 Dependencias
- Ninguna (primera tarea del proyecto)

### ⏱️ Estimación
- [x] Media (2-3 días)

### 📎 Recursos
- [Ejemplo de documento de requisitos](https://www.perforce.com/blog/alm/how-write-software-requirements-specification-srs-document)
- README.md del proyecto

---
**Labels:** `análisis`, `documentation`, `requirements`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

### Template 2: Requisitos No Funcionales

```markdown
## [Análisis] Definir Requisitos No Funcionales

### 📋 Descripción
Documentar los requisitos no funcionales del sistema (rendimiento, seguridad, usabilidad, etc.)

### 🎯 Objetivo
Establecer las características de calidad que debe cumplir el sistema más allá de sus funcionalidades.

### ✅ Criterios de Aceptación
- [ ] Requisitos de rendimiento definidos (tiempos de respuesta, concurrencia)
- [ ] Requisitos de seguridad documentados (encriptación, autenticación, manejo de datos médicos)
- [ ] Requisitos de usabilidad especificados
- [ ] Requisitos de escalabilidad y mantenibilidad
- [ ] Compliance con regulaciones de datos médicos (HIPAA o equivalente local)

### 📝 Tareas
- [ ] Definir tiempo de respuesta esperado del sistema (<2s para operaciones comunes)
- [ ] Definir número de usuarios concurrentes soportados
- [ ] Especificar requisitos de seguridad para datos médicos sensibles
- [ ] Definir navegadores soportados
- [ ] Especificar requisitos de disponibilidad (uptime)
- [ ] Documentar requisitos de backup y recuperación
- [ ] Identificar regulaciones aplicables de protección de datos

### ⏱️ Estimación
- [x] Media (1-2 días)

### 📎 Recursos
- [HIPAA Compliance Guidelines](https://www.hhs.gov/hipaa/index.html)
- [Non-Functional Requirements Examples](https://reqtest.com/requirements-blog/functional-vs-non-functional-requirements/)

---
**Labels:** `análisis`, `documentation`, `requirements`, `security`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

### Template 3: Análisis de Tecnologías

```markdown
## [Análisis] Análisis de Tecnologías y Stack

### 📋 Descripción
Evaluar y confirmar el stack tecnológico del proyecto, identificar librerías adicionales necesarias.

### 🎯 Objetivo
Validar que las tecnologías seleccionadas son adecuadas para el proyecto y planificar las herramientas a utilizar.

### ✅ Criterios de Aceptación
- [ ] Stack actual evaluado (React, Electron, Node.js, PostgreSQL)
- [ ] Ventajas y desventajas documentadas
- [ ] Librerías adicionales identificadas y justificadas
- [ ] Decisión final documentada

### 📝 Tareas
- [ ] Evaluar React + TypeScript para frontend
- [ ] Evaluar Electron para aplicación desktop
- [ ] Evaluar Node.js + Express para backend
- [ ] Evaluar PostgreSQL para base de datos
- [ ] Identificar librería de UI/componentes (ej: Material-UI, Ant Design)
- [ ] Identificar librería para manejo de estado (Context API / Redux)
- [ ] Identificar librería para formularios (React Hook Form / Formik)
- [ ] Identificar ORM para PostgreSQL (Sequelize / TypeORM)
- [ ] Identificar librería de testing (Jest, React Testing Library, Cypress)
- [ ] Identificar herramientas de CI/CD
- [ ] Crear documento de decisiones técnicas

### ⏱️ Estimación
- [x] Media (1-2 días)

### 📎 Recursos
- package.json actual del proyecto
- [Stack Overflow Annual Survey](https://survey.stackoverflow.co/)

---
**Labels:** `análisis`, `tech-stack`, `documentation`  
**Milestone:** Entrega Final  
**Prioridad:** 🟡 Media
```

---

## 🎨 FASE 2: DISEÑO

### Template 4: Diseño de Base de Datos

```markdown
## [Diseño] Diseño de Base de Datos PostgreSQL

### 📋 Descripción
Diseñar el esquema completo de la base de datos, incluyendo tablas, relaciones, constraints, e índices.

### 🎯 Objetivo
Crear una estructura de base de datos normalizada, eficiente y escalable que soporte todas las funcionalidades del sistema.

### ✅ Criterios de Aceptación
- [ ] Diagrama Entidad-Relación (ER) creado
- [ ] Todas las tablas identificadas y documentadas
- [ ] Relaciones entre tablas definidas (1:1, 1:N, N:M)
- [ ] Primary keys y foreign keys definidos
- [ ] Constraints y validaciones especificados
- [ ] Índices para optimización identificados
- [ ] Scripts SQL para creación de tablas escritos
- [ ] Diseño revisado por el equipo

### 📝 Tareas
- [ ] Crear diagrama ER (usar dbdiagram.io, draw.io, o Lucidchart)
- [ ] Diseñar tabla `users` (id, email, password_hash, role, created_at)
- [ ] Diseñar tabla `students` (id, user_id, name, dob, enrollment_number, contact)
- [ ] Diseñar tabla `medical_records` (id, student_id, date, diagnosis, treatment, doctor_id)
- [ ] Diseñar tabla `appointments` (id, student_id, type, date, status, notes)
- [ ] Diseñar tabla `medications` (id, name, description, stock)
- [ ] Diseñar tabla `prescriptions` (id, record_id, medication_id, dosage, duration)
- [ ] Diseñar tabla `reports` (id, type, generated_by, created_at, data)
- [ ] Diseñar tabla `audit_logs` para tracking de cambios
- [ ] Definir índices en columnas frecuentemente consultadas
- [ ] Escribir scripts SQL de migración
- [ ] Crear seeds para datos de prueba

### 🔗 Dependencias
- Depende de: #[Análisis de requisitos]

### ⏱️ Estimación
- [x] Grande (3-4 días)

### 📎 Recursos
- [dbdiagram.io](https://dbdiagram.io/) - Herramienta para crear ER diagrams
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Database Normalization](https://www.guru99.com/database-normalization.html)

---
**Labels:** `diseño`, `database`, `postgresql`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

### Template 5: Diseño de API REST

```markdown
## [Diseño] Documentación de API REST

### 📋 Descripción
Diseñar y documentar todos los endpoints de la API REST del backend.

### 🎯 Objetivo
Tener una especificación clara de la API que sirva como contrato entre frontend y backend.

### ✅ Criterios de Aceptación
- [ ] Todos los endpoints documentados con método HTTP, ruta, parámetros
- [ ] Request body schemas definidos
- [ ] Response schemas definidos (success y error)
- [ ] Códigos de estado HTTP especificados
- [ ] Autenticación y autorización documentadas
- [ ] Ejemplos de uso incluidos
- [ ] Documentación en formato OpenAPI/Swagger (opcional pero recomendado)

### 📝 Tareas

**Autenticación:**
- [ ] POST `/api/auth/register` - Registro de usuario
- [ ] POST `/api/auth/login` - Login
- [ ] POST `/api/auth/logout` - Logout
- [ ] POST `/api/auth/refresh` - Refresh token
- [ ] GET `/api/auth/me` - Obtener usuario actual

**Estudiantes:**
- [ ] GET `/api/students` - Listar estudiantes (con paginación)
- [ ] GET `/api/students/:id` - Obtener estudiante por ID
- [ ] POST `/api/students` - Crear estudiante
- [ ] PUT `/api/students/:id` - Actualizar estudiante
- [ ] DELETE `/api/students/:id` - Eliminar estudiante

**Expedientes Médicos:**
- [ ] GET `/api/medical-records` - Listar expedientes
- [ ] GET `/api/medical-records/:id` - Obtener expediente
- [ ] GET `/api/students/:studentId/medical-records` - Expedientes de un estudiante
- [ ] POST `/api/medical-records` - Crear expediente
- [ ] PUT `/api/medical-records/:id` - Actualizar expediente

**Citas:**
- [ ] GET `/api/appointments` - Listar citas
- [ ] GET `/api/appointments/:id` - Obtener cita
- [ ] POST `/api/appointments` - Crear cita
- [ ] PUT `/api/appointments/:id` - Actualizar cita
- [ ] DELETE `/api/appointments/:id` - Cancelar cita

**Medicamentos:**
- [ ] GET `/api/medications` - Listar medicamentos
- [ ] GET `/api/medications/:id` - Obtener medicamento
- [ ] POST `/api/medications` - Crear medicamento
- [ ] PUT `/api/medications/:id` - Actualizar medicamento
- [ ] POST `/api/prescriptions` - Crear prescripción

**Reportes:**
- [ ] GET `/api/reports` - Listar reportes
- [ ] POST `/api/reports/generate` - Generar reporte nuevo
- [ ] GET `/api/reports/:id/download` - Descargar reporte PDF

**Documentación:**
- [ ] Crear documento Markdown con todos los endpoints
- [ ] (Opcional) Configurar Swagger UI

### ⏱️ Estimación
- [x] Grande (2-3 días)

### 📎 Recursos
- [REST API Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [HTTP Status Codes](https://httpstatuses.com/)

---
**Labels:** `diseño`, `api`, `backend`, `documentation`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

### Template 6: Diseño UI/UX

```markdown
## [Diseño] Diseño UI/UX y Mockups

### 📋 Descripción
Crear wireframes y mockups de alta fidelidad para todas las pantallas del sistema.

### 🎯 Objetivo
Definir la interfaz de usuario y experiencia antes de comenzar el desarrollo frontend.

### ✅ Criterios de Aceptación
- [x] Wireframes de baja fidelidad para todas las pantallas principales
- [x] Mockups de alta fidelidad aprobados ✅ **COMPLETADO (2026-02-14)**
- [x] Flujo de navegación documentado
- [x] Guía de estilos (colores, tipografías, espaciados)
- [x] Design system básico (componentes reutilizables)
- [x] Diseño responsive (adaptable a diferentes tamaños)

### 📝 Tareas

**Wireframes (baja fidelidad):**
- [ ] Pantalla de Login
- [ ] Dashboard principal
- [ ] Lista de estudiantes
- [ ] Perfil de estudiante
- [ ] Expediente médico (ver/editar)
- [ ] Calendario de citas
- [ ] Formulario de nueva cita
- [ ] Lista de medicamentos
- [ ] Generación de reportes
- [ ] Configuración del sistema

**Mockups (alta fidelidad):**
- [ ] Aplicar guía de estilos a wireframes
- [ ] Crear versiones desktop y responsive
- [ ] Agregar elementos interactivos (botones, forms, modals)

**Guía de Estilos:**
- [ ] Definir paleta de colores (primario, secundario, neutrales, alertas)
- [ ] Seleccionar tipografías (headers, body, monospace)
- [ ] Definir espaciados (8px grid system)
- [ ] Definir sombras y bordes
- [ ] Iconografía (seleccionar librería: Material Icons, Font Awesome)

**Prototipo:**
- [ ] (Opcional) Crear prototipo interactivo en Figma

### 🔗 Dependencias
- Depende de: #[Análisis de requisitos]

### ⏱️ Estimación
- [x] Grande (4-5 días)

### 📎 Recursos
- [Figma](https://www.figma.com/) (gratis para estudiantes)
- [Adobe XD](https://www.adobe.com/products/xd.html)
- [draw.io](https://app.diagrams.net/)
- [Material Design Guidelines](https://material.io/design)
- [UI/UX Healthcare Examples](https://dribbble.com/search/healthcare-dashboard)

---
**Labels:** `diseño`, `ui/ux`, `frontend`, `design`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

---

## 🧪 FASE 3: PRUEBAS

### Template 7: Configurar Testing Framework

```markdown
## [Pruebas] Configurar Framework de Testing

### 📋 Descripción
Configurar herramientas de testing para pruebas unitarias, integración y E2E.

### 🎯 Objetivo
Tener el ambiente de testing completamente configurado antes de escribir tests.

### ✅ Criterios de Aceptación
- [ ] Jest configurado para pruebas unitarias (backend y frontend)
- [ ] React Testing Library configurado
- [ ] Playwright o Cypress configurado para pruebas E2E
- [ ] Coverage reporting configurado
- [ ] Scripts de test en package.json
- [ ] Estructura de carpetas de tests definida
- [ ] Documentación de cómo ejecutar tests

### 📝 Tareas

**Backend Testing:**
- [ ] Instalar Jest: `npm install --save-dev jest`
- [ ] Configurar jest.config.js
- [ ] Instalar supertest para testing de API
- [ ] Crear carpeta `api/src/tests/`
- [ ] Crear test de ejemplo

**Frontend Testing:**
- [ ] Instalar Jest + React Testing Library
- [ ] Configurar jest.config.js para React
- [ ] Instalar @testing-library/user-event
- [ ] Crear carpeta `client/src/tests/`
- [ ] Crear test de componente de ejemplo

**E2E Testing:**
- [ ] Decidir: Playwright vs Cypress
- [ ] Instalar herramienta seleccionada
- [ ] Configurar playwright.config.ts o cypress.config.js
- [ ] Crear carpeta de tests E2E
- [ ] Crear test E2E de ejemplo (login flow)

**Configuration:**
- [ ] Configurar coverage thresholds (80%)
- [ ] Agregar scripts a package.json:
  ```json
  {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test"
  }
  ```
- [ ] Configurar .gitignore para coverage reports

**Documentación:**
- [ ] Crear TESTING.md con instrucciones
- [ ] Documentar cómo correr tests
- [ ] Documentar cómo escribir nuevos tests

### ⏱️ Estimación
- [x] Media (1-2 días)

### 📎 Recursos
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)

---
**Labels:** `pruebas`, `testing-setup`, `configuration`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

### Template 8: Tests Unitarios

```markdown
## [Pruebas] Pruebas Unitarias - [Módulo]

### 📋 Descripción
Escribir pruebas unitarias para [especificar módulo: backend/frontend/componente específico].

### 🎯 Objetivo
Alcanzar >80% de cobertura de código con pruebas unitarias de calidad.

### ✅ Criterios de Aceptación
- [ ] Todos los componentes/funciones críticos tienen tests
- [ ] Tests cubren casos happy path
- [ ] Tests cubren casos de error
- [ ] Tests cubren edge cases
- [ ] Cobertura >80% en el módulo
- [ ] Todos los tests pasan

### 📝 Tareas

**Para Backend:**
- [ ] Tests de controladores (cada endpoint)
- [ ] Tests de servicios (lógica de negocio)
- [ ] Tests de modelos (validaciones)
- [ ] Tests de utilidades
- [ ] Mock de base de datos

**Para Frontend:**
- [ ] Tests de componentes (rendering)
- [ ] Tests de interacción de usuario
- [ ] Tests de custom hooks
- [ ] Tests de utilidades
- [ ] Mock de API calls

**Ejemplo de estructura:**
```javascript
describe('StudentController', () => {
  describe('GET /api/students', () => {
    test('returns list of students', async () => {});
    test('returns empty array when no students', async () => {});
    test('returns 401 when not authenticated', async () => {});
  });
});
```

### ⏱️ Estimación
- [x] Grande (3-4 días)

### 📎 Recursos
- [Jest Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- Testing documentation configurada anteriormente

---
**Labels:** `pruebas`, `unit-testing`, `[frontend/backend]`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

---

## 👥 FASE 4: UAT

### Template 9: Preparar UAT

```markdown
## [UAT] Preparar Ambiente y Plan de Pruebas UAT

### 📋 Descripción
Preparar todo lo necesario para las sesiones de User Acceptance Testing con usuarios reales.

### 🎯 Objetivo
Tener un ambiente de staging listo y un plan claro para realizar UAT efectivo.

### ✅ Criterios de Aceptación
- [ ] Ambiente de staging configurado y accesible
- [ ] Base de datos con datos de prueba realistas
- [ ] Plan de pruebas UAT documentado
- [ ] Casos de prueba específicos creados
- [ ] Checklist de validación preparado
- [ ] Usuarios de prueba identificados y contactados
- [ ] Sesiones de UAT agendadas

### 📝 Tareas

**Ambiente de Staging:**
- [ ] Desplegar aplicación en servidor de pruebas
- [ ] Configurar base de datos de staging
- [ ] Poblar con datos de prueba realistas (NO datos reales de estudiantes)
- [ ] Verificar que todas las funcionalidades funcionan

**Plan de Pruebas:**
- [ ] Crear documento de plan UAT
- [ ] Definir objetivos de UAT
- [ ] Definir scope (qué se probará)
- [ ] Identificar usuarios participantes:
  - [ ] Personal de enfermería (2-3 personas)
  - [ ] Personal de psicología (2-3 personas)
  - [ ] Administrador del sistema (1 persona)
  - [ ] Estudiantes (3-5 personas)
- [ ] Agendar sesiones (1-2 horas por grupo)

**Casos de Prueba:**
- [ ] Crear checklist de funcionalidades a validar
- [ ] Crear escenarios de uso realistas
- [ ] Preparar datos de entrada para cada escenario
- [ ] Definir criterios de éxito para cada caso

**Materiales:**
- [ ] Preparar guía rápida de uso del sistema
- [ ] Preparar formulario de feedback
- [ ] Preparar encuesta de satisfacción
- [ ] Preparar formato para reportar bugs

### ⏱️ Estimación
- [x] Media (2-3 días)

### 📎 Recursos
- [UAT Best Practices](https://www.guru99.com/user-acceptance-testing.html)

---
**Labels:** `uat`, `testing`, `staging`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

### Template 10: Sesión de UAT

```markdown
## [UAT] Conducir Sesiones de UAT con Usuarios

### 📋 Descripción
Realizar las sesiones de User Acceptance Testing con los diferentes grupos de usuarios.

### 🎯 Objetivo
Validar que el sistema cumple con las expectativas de los usuarios y recolectar feedback valioso.

### ✅ Criterios de Aceptación
- [ ] Todas las sesiones de UAT completadas
- [ ] Feedback de usuarios documentado
- [ ] Bugs encontrados reportados como issues
- [ ] Encuestas de satisfacción completadas
- [ ] Matriz de aceptación creada
- [ ] Reporte de UAT generado

### 📝 Tareas

**Pre-sesión:**
- [ ] Verificar que ambiente de staging está funcionando
- [ ] Preparar credenciales de acceso para cada usuario
- [ ] Verificar grabación de sesión (si aplica y con permiso)

**Durante Sesión - Grupo Enfermería:**
- [ ] Bienvenida y explicación (5 min)
- [ ] Demostración rápida (10 min)
- [ ] Usuarios exploran libremente (20 min)
- [ ] Usuarios ejecutan escenarios predefinidos (30 min)
- [ ] Recolección de feedback (15 min)
- [ ] Cierre y agradecimiento (5 min)

**Durante Sesión - Grupo Psicología:**
- [ ] [Misma estructura que enfermería]

**Durante Sesión - Administradores:**
- [ ] [Misma estructura, enfocada en funciones admin]

**Durante Sesión - Estudiantes:**
- [ ] [Misma estructura, enfocada en perspectiva del paciente]

**Post-sesión:**
- [ ] Transcribir notas de cada sesión
- [ ] Crear issues para cada bug encontrado
- [ ] Categorizar feedback (crítico, importante, nice-to-have)
- [ ] Priorizar issues para corrección
- [ ] Agradecer a participantes

**Documentación:**
- [ ] Crear reporte de UAT con:
  - Número de participantes
  - Bugs encontrados
  - Mejoras sugeridas
  - Nivel de satisfacción
  - Funcionalidades más/menos valoradas
  - Recomendaciones

### ⏱️ Estimación
- [x] Grande (3-5 días distribuidos)

---
**Labels:** `uat`, `user-testing`, `feedback`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

---

## 🚀 FASE 5: DESPLIEGUE

### Template 11: Configurar Producción

```markdown
## [Despliegue] Configurar Servidor de Producción

### 📋 Descripción
Configurar el ambiente de producción incluyendo servidor, base de datos, y servicios necesarios.

### 🎯 Objetivo
Tener un ambiente de producción robusto, seguro y listo para el lanzamiento.

### ✅ Criterios de Aceptación
- [ ] Servidor de producción configurado y accesible
- [ ] PostgreSQL en producción configurado
- [ ] SSL/HTTPS configurado
- [ ] Variables de entorno de producción configuradas
- [ ] Backups automáticos configurados
- [ ] Monitoreo básico configurado
- [ ] Documentación de infraestructura completa

### 📝 Tareas

**Servidor:**
- [ ] Decidir proveedor (AWS, DigitalOcean, Heroku, Azure, Railway)
- [ ] Crear cuenta y configurar billing
- [ ] Aprovisionar servidor/instancia
- [ ] Configurar firewall y reglas de seguridad
- [ ] Instalar dependencias (Node.js, PostgreSQL client)
- [ ] Configurar dominio (si aplica)

**Base de Datos:**
- [ ] Aprovisionar PostgreSQL en producción
- [ ] Configurar credenciales seguras
- [ ] Ejecutar migraciones
- [ ] Configurar backups automáticos (diarios)
- [ ] Configurar restore point
- [ ] Test de conexión desde servidor

**SSL/Security:**
- [ ] Obtener certificado SSL (Let's Encrypt o del proveedor)
- [ ] Configurar HTTPS
- [ ] Forzar redirección HTTP → HTTPS
- [ ] Configurar headers de seguridad

**Environment Variables:**
- [ ] Configurar todas las variables de entorno:
  - DATABASE_URL
  - JWT_SECRET
  - PORT
  - NODE_ENV=production
  - [otras variables específicas]

**Backups:**
- [ ] Configurar backups automáticos de BD (daily)
- [ ] Configurar backup de archivos (si aplica)
- [ ] Test de restauración de backup
- [ ] Documentar procedimiento de restore

**Monitoreo:**
- [ ] Configurar logs centralizados
- [ ] Configurar alertas de downtime
- [ ] Configurar alertas de errores
- [ ] (Opcional) Integrar con servicio de monitoring

### 🔗 Dependencias
- Depende de: #[UAT aprobado]

### ⏱️ Estimación
- [x] Grande (2-3 días)

### 📎 Recursos
- [DigitalOcean Node.js Deployment](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04)
- [Railway Deployment](https://railway.app/)
- [Heroku Deployment](https://devcenter.heroku.com/categories/deployment)

---
**Labels:** `despliegue`, `infrastructure`, `production`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

### Template 12: CI/CD Pipeline

```markdown
## [Despliegue] Configurar Pipeline CI/CD

### 📋 Descripción
Crear pipeline de CI/CD con GitHub Actions para automatizar testing y deployment.

### 🎯 Objetivo
Automatizar el proceso de testing y despliegue para reducir errores humanos y acelerar entregas.

### ✅ Criterios de Aceptación
- [ ] GitHub Actions workflow configurado
- [ ] Tests automáticos en cada PR
- [ ] Linting automático en cada PR
- [ ] Deploy automático a staging en merge a develop
- [ ] Deploy automático a producción en merge a main
- [ ] Notificaciones de éxito/fallo configuradas

### 📝 Tareas

**CI Workflow (Testing):**
- [ ] Crear `.github/workflows/ci.yml`
- [ ] Configurar trigger en PRs y push
- [ ] Setup de Node.js
- [ ] Instalación de dependencias
- [ ] Ejecución de linter
- [ ] Ejecución de tests unitarios
- [ ] Ejecución de tests E2E (opcional en CI)
- [ ] Report de coverage

**CD Workflow (Deployment):**
- [ ] Crear `.github/workflows/deploy-staging.yml`
- [ ] Crear `.github/workflows/deploy-production.yml`
- [ ] Configurar secrets en GitHub (API keys, tokens)
- [ ] Deploy a staging en merge a develop
- [ ] Deploy a production en merge a main (con aprobación manual opcional)

**Ejemplo de workflow:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run test:coverage

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: echo "Deploy to production"
        # Agregar comandos específicos del proveedor
```

**Testing:**
- [ ] Probar workflow con un PR de prueba
- [ ] Verificar que tests fallen si hay errores
- [ ] Verificar que deploy funcione correctamente

**Documentación:**
- [ ] Documentar proceso de CI/CD
- [ ] Documentar cómo agregar nuevos secrets
- [ ] Documentar troubleshooting común

### ⏱️ Estimación
- [x] Media (2-3 días)

### 📎 Recursos
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Example CI/CD workflows](https://github.com/actions/starter-workflows)

---
**Labels:** `despliegue`, `ci-cd`, `automation`, `github-actions`  
**Milestone:** Entrega Final  
**Prioridad:** 🟡 Media
```

### Template 13: Documentación Final

```markdown
## [Despliegue] Crear Documentación Final del Proyecto

### 📋 Descripción
Crear documentación completa del sistema para usuarios y mantenimiento técnico.

### 🎯 Objetivo
Entregar documentación profesional que permita a usuarios y futuros desarrolladores usar y mantener el sistema.

### ✅ Criterios de Aceptación
- [ ] Manual de usuario completo
- [ ] Documentación técnica completa
- [ ] Guía de instalación y configuración
- [ ] Documentación de API actualizada
- [ ] README del proyecto actualizado
- [ ] Videos tutoriales (opcional)

### 📝 Tareas

**Manual de Usuario:**
- [ ] Portada e introducción
- [ ] Cómo acceder al sistema
- [ ] Cómo hacer login
- [ ] Guía de cada módulo:
  - [ ] Dashboard
  - [ ] Gestión de estudiantes
  - [ ] Expedientes médicos
  - [ ] Citas
  - [ ] Medicamentos
  - [ ] Reportes
- [ ] FAQ (Preguntas frecuentes)
- [ ] Troubleshooting básico
- [ ] Información de contacto/soporte
- [ ] Exportar a PDF

**Documentación Técnica:**
- [ ] Arquitectura del sistema (diagramas)
- [ ] Stack tecnológico detallado
- [ ] Estructura de carpetas explicada
- [ ] Diagrama de base de datos
- [ ] Documentación de API (endpoints)
- [ ] Variables de entorno
- [ ] Procesos de backup y restore
- [ ] Guía de troubleshooting técnico

**Guía de Instalación:**
- [ ] Pre-requisitos (Node.js, PostgreSQL, etc.)
- [ ] Paso a paso de instalación local
- [ ] Configuración de variables de entorno
- [ ] Cómo correr migraciones
- [ ] Cómo correr seeds
- [ ] Cómo iniciar la aplicación
- [ ] Cómo correr tests

**README actualizado:**
- [ ] Descripción del proyecto
- [ ] Features principales
- [ ] Screenshots de la aplicación
- [ ] Instrucciones de instalación
- [ ] Instrucciones de uso
- [ ] Stack tecnológico
- [ ] Equipo
- [ ] Licencia

**Videos (Opcional):**
- [ ] Video tutorial de uso del sistema (5-10 min)
- [ ] Video de instalación para desarrolladores (3-5 min)

### ⏱️ Estimación
- [x] Grande (3-4 días)

### 📎 Recursos
- [How to Write Good Documentation](https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/)
- [README Template](https://github.com/othneildrew/Best-README-Template)

---
**Labels:** `despliegue`, `documentation`, `manual`  
**Milestone:** Entrega Final  
**Prioridad:** 🔴 Alta
```

---

## 🐛 Template para Bugs

```markdown
## 🐛 [BUG] [Título descriptivo del bug]

### 📋 Descripción
[Descripción clara y concisa del bug]

### 🔁 Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hasta '...'
4. Ver error

### ✅ Comportamiento Esperado
[Qué debería pasar]

### ❌ Comportamiento Actual
[Qué está pasando]

### 📸 Screenshots
[Si aplica, agregar screenshots]

### 🖥️ Ambiente
- OS: [ej. macOS 12.0]
- Navegador: [ej. Chrome 120]
- Versión del sistema: [ej. 1.0.0]

### 📎 Información Adicional
[Cualquier otra información relevante]

### 🎯 Severidad
- [ ] 🔴 Crítica (Bloquea funcionalidad principal)
- [ ] 🟡 Alta (Funcionalidad afectada pero hay workaround)
- [ ] 🟢 Media (Bug menor)
- [ ] ⚪ Baja (Cosmético)

---
**Labels:** `bug`, `priority: [high/medium/low]`, `[fase correspondiente]`
```

---

## 💡 Template para Features/Mejoras

```markdown
## 💡 [FEATURE] [Título de la feature]

### 📋 Descripción
[Descripción clara de la feature propuesta]

### 🎯 Problema que Resuelve
[¿Qué problema o necesidad resuelve esta feature?]

### 💭 Solución Propuesta
[Cómo funcionaría la feature]

### 🔄 Alternativas Consideradas
[Otras opciones que se consideraron]

### ✅ Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2

### 📸 Mockups/Diseños
[Si aplica]

### 🎯 Prioridad
- [ ] Must have (Esencial)
- [ ] Should have (Importante)
- [ ] Nice to have (Deseable)

---
**Labels:** `feature`, `enhancement`, `priority: [high/medium/low]`
```

---

## 📚 Notas de Uso

### Etiquetas (Labels) Recomendadas

Crea estas labels en tu repositorio de GitHub:

**Por Fase:**
- `análisis` (color: azul)
- `diseño` (color: morado)
- `pruebas` (color: verde)
- `uat` (color: naranja)
- `despliegue` (color: rojo)

**Por Tipo:**
- `bug` (color: rojo oscuro)
- `feature` (color: verde claro)
- `documentation` (color: azul claro)
- `enhancement` (color: amarillo)

**Por Prioridad:**
- `priority: high` (color: rojo)
- `priority: medium` (color: amarillo)
- `priority: low` (color: verde)

**Por Área:**
- `frontend` (color: cyan)
- `backend` (color: marrón)
- `database` (color: gris)
- `ui/ux` (color: rosa)

**Otros:**
- `good first issue` (color: verde suave)
- `help wanted` (color: verde)
- `wontfix` (color: blanco)
- `duplicate` (color: gris claro)

### Tips para Crear Buenos Issues

1. **Título claro:** Usa prefijo [Fase] y descripción concisa
2. **Descripción detallada:** Explica el QUÉ y el POR QUÉ
3. **Checklist de tareas:** Divide en subtareas trackeable
4. **Criterios de aceptación:** Define cuándo está "Done"
5. **Referencias:** Link a otros issues relacionados
6. **Asignación:** Asigna responsables desde el inicio
7. **Estimación realista:** Considera experiencia del equipo
8. **Labels apropiados:** Facilita filtrado y búsqueda

### Flujo de Trabajo Sugerido

```
1. Crear issue con template → Backlog
2. Planificar y asignar → Columna de Fase correspondiente
3. Trabajar en la tarea → Issue permanece en la columna
4. Crear PR referenciando el issue
5. Review y merge del PR
6. Issue se mueve automáticamente a Completado ✅
```

---

¡Usa estos templates para mantener consistencia en tus issues y facilitar la gestión del proyecto! 🚀
