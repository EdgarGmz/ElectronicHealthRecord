# Estructura del Proyecto - Electronic Health Record

## 📊 Visión General del Proyecto

Este documento complementa la [Guía de GitHub Projects](./GITHUB_PROJECTS_GUIDE.md) y proporciona una estructura clara de las fases del proyecto.

---

## 🗓️ Información del Proyecto

- **Nombre del Proyecto:** Electronic Health Record (EHR)
- **Fecha de Inicio:** Enero 20, 2026
- **Fecha Límite:** Abril 10, 2026
- **Duración Total:** 11 semanas
- **Equipo:** Edgar Gómez + equipo universitario
- **Objetivo:** Sistema de gestión de salud para estudiantes

---

## 📋 Fases del Proyecto

### **Fase 1: Análisis** (2-3 semanas)
**Objetivo:** Entender completamente los requisitos del sistema

#### Entregables:
- ✅ Documento de requisitos funcionales
- ✅ Documento de requisitos no funcionales  
- ✅ Casos de uso documentados
- ✅ Historias de usuario
- ✅ [Análisis de riesgos y amenazas](./documents/Analisis-Riesgos-Amenazas.md)
- ✅ Análisis de tecnologías

#### Tareas Principales:
1. Investigación de sistemas de salud similares
2. Entrevistas con stakeholders (enfermería, psicología, estudiantes)
3. Definición de alcance del proyecto
4. Identificación de módulos principales:
   - Gestión de expedientes médicos
   - Administración de medicamentos
   - Gestión de citas (enfermería y psicología)
   - Generación de reportes
   - Sistema de autenticación y autorización
5. Análisis de compliance (protección de datos médicos)

#### Criterios de Salida:
- [x] Documento de requisitos aprobado por el equipo
- [x] Casos de uso validados
- [x] Stack tecnológico confirmado
- [x] [Riesgos identificados y mitigaciones planteadas](./documents/Analisis-Riesgos-Amenazas.md)

---

### **Fase 2: Diseño** (2-3 semanas)
**Objetivo:** Crear el blueprint completo del sistema

#### Entregables:
- ✅ Diagrama Entidad-Relación (ER) de la base de datos
- ✅ Esquema de base de datos PostgreSQL
- ✅ Diseño de arquitectura del sistema
- ✅ Documentación de API endpoints
- ✅ Wireframes de todas las pantallas
- ✅ Mockups de alta fidelidad
- ✅ Guía de estilos y design system

#### Tareas Principales:

**Base de Datos:**
```
Tablas principales a diseñar:
- users (estudiantes, médicos, administradores)
- medical_records (expedientes médicos)
- appointments (citas)
- medications (medicamentos)
- prescriptions (recetas)
- medical_reports (reportes de salud)
- audit_logs (logs de auditoría)
```

**Arquitectura:**
```
┌─────────────┐
│   Electron  │  (Desktop App)
│   + React   │
└──────┬──────┘
       │ HTTP/REST
┌──────▼──────┐
│  Node.js    │
│  Express    │
│  (API)      │
└──────┬──────┘
       │
┌──────▼──────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
```

**API Endpoints a Diseñar:**
```
Authentication:
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh

Students:
GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id

Medical Records:
GET    /api/medical-records
GET    /api/medical-records/:id
POST   /api/medical-records
PUT    /api/medical-records/:id

Appointments:
GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id

Medications:
GET    /api/medications
POST   /api/medications
PUT    /api/medications/:id

Reports:
GET    /api/reports
POST   /api/reports/generate
```

**Pantallas a Diseñar:**
1. Login/Autenticación
2. Dashboard principal
3. Gestión de estudiantes
4. Expedientes médicos (ver/editar)
5. Calendario de citas
6. Administración de medicamentos
7. Generación de reportes
8. Configuración del sistema

#### Criterios de Salida:
- [ ] Diagrama ER aprobado
- [ ] Scripts SQL para crear tablas
- [ ] Mockups aprobados por stakeholders
- [ ] Documentación de API completa
- [ ] Design system definido

---

### **Fase 3: Desarrollo + Pruebas** (3-4 semanas)
**Objetivo:** Implementar el sistema con pruebas continuas

#### Entregables:
- ✅ Código fuente completo (frontend + backend)
- ✅ Base de datos implementada
- ✅ Suite de pruebas unitarias (cobertura >80%)
- ✅ Pruebas de integración
- ✅ Pruebas E2E
- ✅ Documentación de código

#### Estructura de Carpetas Recomendada:

```
ElectronicHealthRecord/
├── Kiosko/                    # Frontend (React + Electron)
│   ├── src/
│   │   ├── components/       # Componentes React reutilizables
│   │   │   ├── common/      # Botones, inputs, modals
│   │   │   ├── students/    # Componentes de estudiantes
│   │   │   ├── appointments/
│   │   │   └── reports/
│   │   ├── pages/           # Páginas principales
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Students.tsx
│   │   │   └── MedicalRecords.tsx
│   │   ├── services/        # Servicios API
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utilidades
│   │   ├── contexts/        # React Contexts
│   │   ├── types/           # TypeScript types
│   │   └── tests/           # Tests del frontend
│   ├── public/
│   └── package.json
│
├── api/                       # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   ├── appointmentController.js
│   │   │   └── reportController.js
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Definición de rutas
│   │   ├── middleware/      # Middleware (auth, validation)
│   │   ├── services/        # Lógica de negocio
│   │   ├── config/          # Configuración
│   │   │   └── database.js
│   │   ├── utils/           # Utilidades
│   │   └── tests/           # Tests del backend
│   ├── migrations/          # Migraciones de BD
│   ├── seeds/               # Datos de prueba
│   └── package.json
│
├── main.js                   # Electron main process
├── package.json              # Dependencias raíz
├── .env.example              # Variables de entorno ejemplo
├── .gitignore
├── README.md
├── GITHUB_PROJECTS_GUIDE.md  # Esta guía
└── PROJECT_STRUCTURE.md      # Este documento
```

#### Tareas de Desarrollo:

**Backend:**
1. Configurar Express server
2. Implementar conexión a PostgreSQL
3. Crear migrations y seeds
4. Implementar autenticación JWT
5. Implementar endpoints de API
6. Validación de datos (express-validator)
7. Manejo de errores
8. Logging
9. Tests unitarios con Jest/Mocha

**Frontend:**
1. Configurar proyecto React + TypeScript
2. Implementar sistema de rutas (React Router)
3. Crear componentes base
4. Implementar páginas principales
5. Integración con API (axios/fetch)
6. Gestión de estado (Context API / Redux)
7. Formularios y validaciones
8. Tests con React Testing Library

**Electron:**
1. Configurar Electron main process
2. Configurar IPC (Inter-Process Communication)
3. Configurar ventanas y menus
4. Empaquetado con electron-builder

#### Tests a Implementar:

**Pruebas Unitarias:**
```javascript
// Ejemplo de test de backend
describe('Student Controller', () => {
  test('should create a new student', async () => {
    // Test implementation
  });
  
  test('should get student by id', async () => {
    // Test implementation
  });
});

// Ejemplo de test de frontend
describe('StudentForm Component', () => {
  test('renders correctly', () => {
    // Test implementation
  });
  
  test('validates required fields', () => {
    // Test implementation
  });
});
```

**Pruebas de Integración:**
- Test de flujos completos API
- Test de integración frontend-backend

**Pruebas E2E:**
- Login flow
- Crear expediente médico
- Agendar cita
- Generar reporte

#### Criterios de Salida:
- [ ] Todas las funcionalidades principales implementadas
- [ ] Cobertura de tests >80%
- [ ] Sin errores críticos
- [ ] Código revisado (code review)
- [ ] Documentación de código actualizada

---

### **Fase 4: UAT (User Acceptance Testing)** (1 semana)
**Objetivo:** Validar el sistema con usuarios reales

#### Entregables:
- ✅ Plan de pruebas UAT
- ✅ Casos de prueba documentados
- ✅ Reporte de feedback de usuarios
- ✅ Issues/bugs documentados
- ✅ Sistema corregido según feedback

#### Tareas Principales:
1. Preparar ambiente de staging/pruebas
2. Crear datos de prueba realistas
3. Documentar escenarios de prueba
4. Coordinar sesiones con usuarios:
   - Personal de enfermería
   - Personal de psicología
   - Estudiantes
5. Observar y documentar uso del sistema
6. Recolectar feedback (encuestas, entrevistas)
7. Priorizar issues encontrados
8. Implementar correcciones críticas
9. Re-testear con usuarios

#### Checklist de Pruebas UAT:

**Módulo de Autenticación:**
- [ ] Login exitoso
- [ ] Login con credenciales incorrectas
- [ ] Recuperación de contraseña
- [ ] Logout

**Módulo de Estudiantes:**
- [ ] Registrar nuevo estudiante
- [ ] Buscar estudiante
- [ ] Editar información de estudiante
- [ ] Ver historial médico

**Módulo de Expedientes Médicos:**
- [ ] Crear nuevo expediente
- [ ] Ver expediente existente
- [ ] Editar expediente
- [ ] Agregar diagnóstico
- [ ] Agregar tratamiento

**Módulo de Citas:**
- [ ] Agendar cita de enfermería
- [ ] Agendar cita de psicología
- [ ] Ver calendario de citas
- [ ] Cancelar cita
- [ ] Reprogramar cita

**Módulo de Medicamentos:**
- [ ] Registrar nuevo medicamento
- [ ] Prescribir medicamento
- [ ] Ver historial de prescripciones

**Módulo de Reportes:**
- [ ] Generar reporte individual
- [ ] Generar reporte estadístico
- [ ] Exportar reporte a PDF
- [ ] Filtrar reportes por fecha

#### Criterios de Salida:
- [ ] Todos los casos de prueba UAT pasados
- [ ] Feedback positivo de usuarios (>80% satisfacción)
- [ ] Issues críticos resueltos
- [ ] Sistema aprobado para producción

---

### **Fase 5: Despliegue** (3 días)
**Objetivo:** Poner el sistema en producción

#### Entregables:
- ✅ Sistema desplegado en producción
- ✅ Base de datos en producción configurada
- ✅ Pipeline CI/CD configurado
- ✅ Manual de usuario
- ✅ Documentación técnica
- ✅ Plan de respaldo y recuperación
- ✅ Monitoreo configurado

#### Tareas Principales:

**Infraestructura:**
1. Configurar servidor de producción
   - Opciones: AWS, DigitalOcean, Heroku, Azure
2. Configurar PostgreSQL en producción
3. Configurar SSL/HTTPS
4. Configurar dominio (si aplica)
5. Configurar backups automáticos

**CI/CD:**
```yaml
# Ejemplo de GitHub Actions workflow
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run linter
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deploy script
```

**Documentación:**
1. Manual de usuario (PDF o web)
   - Guía de inicio
   - Funcionalidades principales
   - FAQs
   - Troubleshooting
2. Documentación técnica
   - Arquitectura del sistema
   - Documentación de API
   - Guía de instalación
   - Guía de mantenimiento

**Seguridad:**
- [ ] Variables de entorno seguras (no commiteadas)
- [ ] Contraseñas hasheadas (bcrypt)
- [ ] JWT con expiración
- [ ] Rate limiting en API
- [ ] Sanitización de inputs
- [ ] CORS configurado
- [ ] Headers de seguridad (helmet.js)

**Monitoreo:**
1. Logs centralizados
2. Métricas de rendimiento
3. Alertas de errores
4. Monitoreo de uptime

#### Criterios de Salida:
- [ ] Sistema accesible en producción
- [ ] Base de datos migrada exitosamente
- [ ] Backups funcionando
- [ ] CI/CD ejecutándose correctamente
- [ ] Documentación entregada
- [ ] Capacitación a usuarios realizada
- [ ] ¡Proyecto completado! 🎉

---

## 📊 Métricas de Éxito

### KPIs del Proyecto:

1. **Cumplimiento de Timeline:**
   - Meta: Entregar el 10 de abril
   - Métrica: Fecha de entrega real

2. **Calidad del Código:**
   - Meta: Cobertura de tests >80%
   - Meta: 0 vulnerabilidades críticas
   - Meta: Code review en todos los PRs

3. **Funcionalidad:**
   - Meta: 100% de requisitos funcionales implementados
   - Meta: 0 bugs críticos en producción

4. **Satisfacción de Usuario:**
   - Meta: >80% de satisfacción en UAT
   - Meta: >90% de casos de uso exitosos

5. **Documentación:**
   - Meta: 100% de código documentado
   - Meta: Manual de usuario completo

---

## 🚀 Quick Start - Primeros Pasos

### Para Empezar HOY:

1. **Configurar GitHub Projects** (30 min)
   - Seguir pasos 1-4 de la [Guía de GitHub Projects](./GITHUB_PROJECTS_GUIDE.md)

2. **Primera Reunión de Equipo** (1 hora)
   - Presentar el proyecto
   - Asignar roles
   - Revisar timeline
   - Acordar métodos de comunicación

3. **Crear Issues Iniciales** (1 hora)
   - Crear al menos 5-10 issues de la Fase 1 (Análisis)
   - Asignar a miembros del equipo

4. **Setup del Ambiente de Desarrollo** (2 horas)
   - Clonar repositorio
   - Instalar dependencias: `npm install`
   - Configurar IDE (VS Code recomendado)
   - Instalar extensiones útiles

5. **Primera Tarea** (resto del día)
   - Cada miembro trabaja en su primer issue asignado
   - Primer commit antes de terminar el día

---

## 📞 Comunicación del Equipo

### Canales Recomendados:

1. **GitHub Issues:** Discusiones técnicas y decisiones de diseño
2. **GitHub Discussions:** Preguntas generales y brainstorming
3. **Slack/Discord:** Comunicación diaria y quick questions
4. **Reuniones:** Stand-ups y planning (presencial o Zoom)

### Frecuencia de Comunicación:

- **Daily:** Check-in rápido (5-10 min)
- **Semanal:** Planning meeting (1-2 horas)
- **Bisemanal:** Demo de progreso
- **Por fase:** Retrospectiva

---

## ⚠️ Riesgos Comunes y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retrasos en desarrollo | Alta | Alto | Buffer time, priorización |
| Cambios de requisitos | Media | Medio | Scope freeze después de diseño |
| Bugs en producción | Media | Alto | Testing exhaustivo, UAT |
| Problemas de rendimiento | Media | Medio | Testing de carga, optimización |
| Pérdida de datos | Baja | Crítico | Backups automáticos, replicación |
| Miembro del equipo no disponible | Media | Medio | Documentación, knowledge sharing |

---

## 🎓 Recursos de Aprendizaje

### Tecnologías del Stack:

**React + TypeScript:**
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Node.js + Express:**
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

**PostgreSQL:**
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQL Cheat Sheet](https://www.sqltutorial.org/sql-cheat-sheet/)

**Electron:**
- [Electron Documentation](https://www.electronjs.org/docs/latest)

**Testing:**
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)

---

## ✅ Checklist Final de Entrega

Antes del 10 de abril, verifica:

### Código:
- [ ] Todas las features implementadas
- [ ] Tests pasando (>80% coverage)
- [ ] Sin warnings en build
- [ ] Código limpio y documentado
- [ ] Sin TODOs pendientes críticos

### Documentación:
- [ ] README actualizado
- [ ] Documentación de API
- [ ] Manual de usuario
- [ ] Guía de instalación
- [ ] Comentarios en código complejo

### Deployment:
- [ ] Sistema desplegado en producción
- [ ] Base de datos migrada
- [ ] SSL configurado
- [ ] Backups funcionando
- [ ] Monitoreo activo

### Testing:
- [ ] Pruebas unitarias completas
- [ ] Pruebas de integración completas
- [ ] Pruebas E2E completas
- [ ] UAT aprobado
- [ ] No hay bugs críticos

### Proceso:
- [ ] Todos los issues cerrados
- [ ] Todos los PRs mergeados
- [ ] Código en rama main
- [ ] Tags de versión creados
- [ ] Retrospectiva realizada

---

## 🎉 Celebración Final

Una vez entregado el proyecto:
1. Hacer un release en GitHub (v1.0.0)
2. Crear un tag: `git tag -a v1.0.0 -m "Release 1.0.0"`
3. Demo final al instructor/stakeholders
4. Retrospectiva de todo el proyecto
5. Documentar lecciones aprendidas
6. Celebrar con el equipo 🍕🎊

---

**¡Éxito en tu proyecto!** 💪

Para más detalles sobre cómo usar GitHub Projects día a día, consulta la [Guía Completa de GitHub Projects](./GITHUB_PROJECTS_GUIDE.md).
