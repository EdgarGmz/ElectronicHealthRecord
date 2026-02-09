# Guía Completa: Configuración de GitHub Projects

## 📋 Descripción del Proyecto

**Nombre:** Electronic Health Record  
**Fecha Límite:** 10 de Abril, 2026  
**Objetivo:** Sistema de gestión de salud para estudiantes universitarios

---

## 🚀 Paso a Paso para Configurar GitHub Projects

### **Paso 1: Acceder a GitHub Projects**

1. Ve a tu repositorio en GitHub: `https://github.com/EdgarGmz/ElectronicHealthRecord`
2. Haz clic en la pestaña **"Projects"** en la barra superior del repositorio
3. Si no ves la pestaña, ve a **Settings** → **Options** y asegúrate de que Projects esté habilitado
4. Haz clic en el botón verde **"Link a project"** o **"New project"**

### **Paso 2: Crear un Nuevo Proyecto**

1. Selecciona **"New project"** (proyecto nuevo)
2. Elige una plantilla:
   - **Recomendado:** "Board" (Tablero tipo Kanban)
   - También puedes usar "Table" (Tabla) o "Roadmap" (Hoja de ruta)
3. Dale un nombre significativo:
   ```
   Electronic Health Record - Desarrollo 2026
   ```
4. Agrega una descripción:
   ```
   Proyecto de desarrollo del Sistema de Salud Electrónico.
   Fecha límite: 10 de Abril, 2026
   ```
5. Haz clic en **"Create project"**

### **Paso 3: Configurar las Columnas del Proyecto**

Para nuestro proyecto, necesitamos configurar las siguientes columnas según las fases definidas:

#### **Columnas por Defecto a Modificar:**

1. **Backlog** (Ya existe por defecto)
   - Mantén esta columna para tareas pendientes sin asignar a una fase

2. **1. Análisis** (Crear nueva columna)
   - Clic en **"+ Add column"** o **"+"**
   - Nombre: `1. Análisis`
   - Descripción: `Fase de análisis de requisitos y especificaciones`

3. **2. Diseño** (Crear nueva columna)
   - Nombre: `2. Diseño`
   - Descripción: `Fase de diseño de arquitectura, UI/UX y base de datos`

4. **3. Pruebas** (Crear nueva columna)
   - Nombre: `3. Pruebas`
   - Descripción: `Fase de pruebas unitarias, integración y funcionales`

5. **4. UAT** (Crear nueva columna)
   - Nombre: `4. UAT (User Acceptance Testing)`
   - Descripción: `Pruebas de aceptación del usuario final`

6. **5. Despliegue** (Crear nueva columna)
   - Nombre: `5. Despliegue`
   - Descripción: `Fase de implementación y puesta en producción`

7. **Completado** (Crear nueva columna)
   - Nombre: `Completado`
   - Descripción: `Tareas terminadas y verificadas`

### **Paso 4: Configurar Fecha Límite del Proyecto**

1. En la vista del proyecto, haz clic en el icono de **"..."** (más opciones) en la esquina superior derecha
2. Selecciona **"Settings"** (Configuración)
3. En la sección **"Custom fields"** (Campos personalizados):
   - Haz clic en **"+ New field"**
   - Nombre: `Fecha Límite`
   - Tipo: `Date`
   - Haz clic en **"Save"**

4. Para agregar un milestone general:
   - Ve a la pestaña **"Issues"** de tu repositorio
   - Haz clic en **"Milestones"**
   - Clic en **"New milestone"**
   - Título: `Entrega Final`
   - Fecha límite: `April 10, 2026`
   - Descripción: `Fecha límite para la entrega del proyecto completo`
   - Haz clic en **"Create milestone"**

### **Paso 5: Crear Issues para Cada Fase**

Ahora crearemos issues (tareas) específicas para cada fase del proyecto:

#### **Fase 1: Análisis**

Ve a **Issues** → **New issue** y crea los siguientes:

```markdown
Título: [Análisis] Definir requisitos funcionales
Descripción:
- Identificar las funcionalidades principales del sistema
- Documentar casos de uso
- Definir historias de usuario
- Entrevistar stakeholders

Asignados: [Tu equipo]
Milestone: Entrega Final
Labels: análisis, documentation
```

```markdown
Título: [Análisis] Definir requisitos no funcionales
Descripción:
- Rendimiento esperado
- Seguridad y privacidad (HIPAA/datos médicos)
- Escalabilidad
- Compatibilidad con navegadores

Labels: análisis, requirements
```

```markdown
Título: [Análisis] Análisis de tecnologías y herramientas
Descripción:
- Evaluar stack actual (React, Electron, Node.js, PostgreSQL)
- Identificar librerías necesarias
- Definir ambiente de desarrollo

Labels: análisis, tech-stack
```

#### **Fase 2: Diseño**

```markdown
Título: [Diseño] Diseño de base de datos
Descripción:
- Crear diagrama ER (Entidad-Relación)
- Definir tablas: Estudiantes, Expedientes, Citas, Medicamentos
- Establecer relaciones y constraints
- Planificar índices y optimización

Labels: diseño, database
```

```markdown
Título: [Diseño] Diseño de arquitectura del sistema
Descripción:
- Arquitectura cliente-servidor
- Diseño de API REST
- Definir endpoints
- Patrón de arquitectura (MVC, Clean Architecture)

Labels: diseño, architecture
```

```markdown
Título: [Diseño] Diseño UI/UX
Descripción:
- Wireframes de las pantallas principales
- Mockups de alta fidelidad
- Flujo de navegación
- Guía de estilos y componentes

Labels: diseño, ui/ux
```

#### **Fase 3: Pruebas**

```markdown
Título: [Pruebas] Configurar framework de pruebas
Descripción:
- Configurar Jest o Vitest para pruebas unitarias
- Configurar React Testing Library
- Configurar Playwright/Cypress para E2E
- Definir estructura de carpetas de tests

Labels: pruebas, testing-setup
```

```markdown
Título: [Pruebas] Pruebas unitarias del backend
Descripción:
- Pruebas de controladores
- Pruebas de servicios
- Pruebas de modelos
- Cobertura mínima: 80%

Labels: pruebas, backend, unit-testing
```

```markdown
Título: [Pruebas] Pruebas unitarias del frontend
Descripción:
- Pruebas de componentes React
- Pruebas de hooks personalizados
- Pruebas de utilidades
- Cobertura mínima: 80%

Labels: pruebas, frontend, unit-testing
```

```markdown
Título: [Pruebas] Pruebas de integración
Descripción:
- Pruebas de API endpoints
- Pruebas de flujos completos
- Pruebas de integración con base de datos

Labels: pruebas, integration-testing
```

```markdown
Título: [Pruebas] Pruebas E2E (End-to-End)
Descripción:
- Pruebas de flujos principales de usuario
- Registro y login
- Gestión de expedientes
- Generación de reportes

Labels: pruebas, e2e-testing
```

#### **Fase 4: UAT (User Acceptance Testing)**

```markdown
Título: [UAT] Preparar ambiente de pruebas
Descripción:
- Configurar servidor de staging
- Preparar datos de prueba
- Documentar proceso de UAT
- Crear checklist de pruebas

Labels: uat, testing
```

```markdown
Título: [UAT] Sesión de pruebas con usuarios finales
Descripción:
- Coordinar sesiones con estudiantes y personal médico
- Recolectar feedback
- Documentar bugs y mejoras
- Crear matriz de aceptación

Labels: uat, user-testing
```

```markdown
Título: [UAT] Corrección de issues encontrados en UAT
Descripción:
- Priorizar issues críticos
- Implementar correcciones
- Re-testear con usuarios
- Obtener aprobación final

Labels: uat, bugfix
```

#### **Fase 5: Despliegue**

```markdown
Título: [Despliegue] Configurar ambiente de producción
Descripción:
- Configurar servidor de producción
- Configurar base de datos PostgreSQL
- Configurar variables de entorno
- Establecer backups automáticos

Labels: despliegue, infrastructure
```

```markdown
Título: [Despliegue] Crear pipeline CI/CD
Descripción:
- Configurar GitHub Actions
- Automatizar pruebas en cada commit
- Automatizar despliegue
- Configurar notificaciones

Labels: despliegue, ci-cd
```

```markdown
Título: [Despliegue] Documentación de despliegue
Descripción:
- Manual de instalación
- Guía de configuración
- Manual de usuario
- Documentación técnica

Labels: despliegue, documentation
```

```markdown
Título: [Despliegue] Monitoreo y mantenimiento
Descripción:
- Configurar logs
- Configurar métricas y alertas
- Plan de respaldo
- Plan de rollback

Labels: despliegue, monitoring
```

### **Paso 6: Organizar Issues en el Proyecto**

1. Ve a tu proyecto en **Projects**
2. Haz clic en **"Add item"** o **"+"**
3. Busca y selecciona los issues que creaste
4. Arrastra cada issue a su columna correspondiente:
   - Issues de **[Análisis]** → Columna `1. Análisis`
   - Issues de **[Diseño]** → Columna `2. Diseño`
   - Issues de **[Pruebas]** → Columna `3. Pruebas`
   - Issues de **[UAT]** → Columna `4. UAT`
   - Issues de **[Despliegue]** → Columna `5. Despliegue`

### **Paso 7: Configurar Vistas Personalizadas**

GitHub Projects permite crear múltiples vistas del mismo proyecto:

#### **Vista 1: Board (Kanban) - Vista Principal**
- Ya está configurada por defecto
- Ideal para ver el flujo de trabajo

#### **Vista 2: Table (Tabla) - Para Tracking Detallado**
1. Haz clic en el icono **"+"** junto a las pestañas de vista
2. Selecciona **"New table view"**
3. Nombre: `Vista Detallada`
4. Configura columnas visibles:
   - Title (Título)
   - Status (Estado/Columna)
   - Assignees (Asignados)
   - Labels (Etiquetas)
   - Milestone (Hito)
   - Fecha Límite (campo personalizado)

#### **Vista 3: Roadmap - Para Planificación Temporal**
1. Clic en **"+"** → **"New roadmap view"**
2. Nombre: `Cronograma`
3. Esta vista muestra las tareas en una línea de tiempo
4. Perfecto para visualizar el progreso hacia el 10 de abril

### **Paso 8: Configurar Automatizaciones**

GitHub Projects incluye automatizaciones integradas:

1. Ve a **Settings** del proyecto (icono **"..."** → **Settings**)
2. Busca la sección **"Workflows"**
3. Activa las siguientes automatizaciones:

#### **Auto-add to project:**
- Cuando se crea un nuevo issue, se agrega automáticamente al proyecto en la columna "Backlog"

#### **Item closed:**
- Cuando se cierra un issue, se mueve automáticamente a "Completado"

#### **Pull request merged:**
- Cuando se fusiona un PR, el issue relacionado se mueve a "Completado"

### **Paso 9: Asignar Tareas al Equipo**

1. Para cada issue, haz clic en él
2. En el panel derecho, busca **"Assignees"**
3. Selecciona los miembros del equipo responsables:
   - Edgar Gómez
   - [Otros integrantes]

4. **Tip:** Distribuye las tareas equitativamente según las habilidades:
   - Frontend: Issues de UI/UX y componentes React
   - Backend: Issues de API y base de datos
   - Testing: Issues de pruebas
   - DevOps: Issues de despliegue y CI/CD

### **Paso 10: Establecer Prioridades**

Para priorizar tareas:

1. Crea un campo personalizado de **Priority**:
   - Ve a **Settings** → **Custom fields**
   - **"+ New field"**
   - Nombre: `Prioridad`
   - Tipo: `Single select`
   - Opciones:
     - 🔴 Alta (Crítica)
     - 🟡 Media
     - 🟢 Baja

2. Asigna prioridades a cada issue según:
   - Impacto en el proyecto
   - Dependencias con otras tareas
   - Fecha límite

---

## 📊 Gestión Diaria del Proyecto

### **Daily Stand-up Virtual**

Usa GitHub Projects para stand-ups diarios:

1. Cada miembro revisa sus issues asignados
2. Actualiza el estado moviendo cards entre columnas
3. Comenta en los issues sobre progreso o blockers
4. Usa mentions (@usuario) para comunicación directa

### **Reuniones de Sprint/Weekly**

1. **Vista Board:** Revisar el progreso general
2. **Vista Roadmap:** Verificar si están en tiempo
3. **Backlog:** Priorizar tareas para la próxima semana

### **Tracking de Progreso**

GitHub Projects calcula automáticamente:
- Número de issues por columna
- Issues completados vs. totales
- Progreso del milestone

Para ver métricas:
- Usa la vista **Insights** (si está disponible en tu plan)
- Revisa el milestone "Entrega Final" para ver el % de completitud

---

## 🎯 Mejores Prácticas para Dominar GitHub Projects

### **1. Nomenclatura Consistente**

```
[FASE] Descripción breve de la tarea

Ejemplos:
✅ [Análisis] Definir requisitos funcionales
✅ [Diseño] Crear mockups de la pantalla de login
✅ [Pruebas] Implementar tests para módulo de autenticación
```

### **2. Usar Labels Efectivamente**

Crea labels por:
- **Tipo:** `bug`, `feature`, `documentation`, `refactor`
- **Prioridad:** `priority: high`, `priority: medium`, `priority: low`
- **Área:** `frontend`, `backend`, `database`, `ui/ux`
- **Fase:** `análisis`, `diseño`, `pruebas`, `uat`, `despliegue`

### **3. Referencias Cruzadas**

En tus issues y PRs, referencia otros issues:
```markdown
Relacionado con #5
Depende de #3
Resuelve #7
```

Esto crea un grafo de dependencias visible en GitHub.

### **4. Templates de Issues**

Crea templates para estandarizar:
- Issues de bugs
- Features
- Tareas de análisis/diseño

### **5. Documentar Todo**

En cada issue:
- **Descripción clara** del qué y el por qué
- **Criterios de aceptación:** ¿Cuándo se considera completa?
- **Tasks checklist:** Subtareas dentro del issue
  ```markdown
  - [ ] Subtarea 1
  - [ ] Subtarea 2
  - [ ] Subtarea 3
  ```

### **6. Code Reviews en PRs**

Cuando trabajes en un issue:
1. Crea una rama: `git checkout -b feature/nombre-descriptivo`
2. Haz tus cambios
3. Crea un Pull Request que referencia el issue: `Fixes #X`
4. Solicita review de tu equipo
5. Una vez aprobado y merged, el issue se cierra automáticamente

### **7. Reuniones y Sincronización**

- **Lunes:** Planning de la semana
- **Diario:** Check-in rápido (5-10 min)
- **Viernes:** Retrospectiva y cierre de semana

### **8. Usar Milestones para Sub-objetivos**

Además del milestone principal (10 de abril), crea milestones intermedios:
- `Fase 1: Análisis Completo` - Fecha: Feb 15
- `Fase 2: Diseño Completo` - Fecha: Feb 28
- `Fase 3: Pruebas Completadas` - Fecha: Mar 20
- `Fase 4: UAT Aprobado` - Fecha: Mar 31
- `Fase 5: Despliegue Final` - Fecha: Abril 10

### **9. Monitorear Burndown**

Aunque GitHub Projects no tiene un gráfico burndown nativo, puedes:
- Usar la vista **Roadmap** para ver progreso temporal
- Crear un issue semanal de "Status Report"
- Usar herramientas externas como ZenHub (si es necesario)

### **10. Celebrar Hitos**

Cuando completes cada fase:
- Cierra todos los issues de esa fase
- Crea un PR de "merge" si aplica
- Documenta lecciones aprendidas
- Celebra con el equipo 🎉

---

## 🔄 Flujo de Trabajo Recomendado

```
1. Backlog → Se crea el issue
           ↓
2. [Fase correspondiente] → Se asigna y se trabaja
           ↓
3. In Review → Se crea PR y se solicita review
           ↓
4. Testing → Se valida la funcionalidad
           ↓
5. Completado → Se cierra el issue
```

**Para issues complejos:**
1. Divide en sub-issues más pequeños
2. Usa checklists dentro del issue principal
3. Referencia los sub-issues con `#numero`

---

## 📅 Cronograma Sugerido

| Fase | Duración | Fechas Estimadas | Entregable |
|------|----------|------------------|------------|
| **1. Análisis** | 2-3 semanas | Ene 20 - Feb 10 | Documento de requisitos, casos de uso |
| **2. Diseño** | 2-3 semanas | Feb 10 - Mar 3 | Diagramas ER, mockups, arquitectura |
| **3. Desarrollo** | 3-4 semanas | Mar 3 - Mar 31 | Código funcional con tests |
| **4. Pruebas** | 1 semana | Mar 24 - Mar 31 | Suite de tests completa (en paralelo) |
| **5. UAT** | 1 semana | Mar 31 - Abr 7 | Feedback de usuarios, correcciones |
| **6. Despliegue** | 3 días | Abr 7 - Abr 10 | Sistema en producción |

> **Nota:** Algunas fases pueden solaparse (ej: desarrollo y pruebas)

---

## 🚨 Troubleshooting Común

### **Problema: No veo la pestaña Projects**
**Solución:** Ve a Settings → Options → Features → Activa "Projects"

### **Problema: No puedo agregar issues al proyecto**
**Solución:** 
1. Asegúrate de tener permisos de escritura en el repo
2. El proyecto debe estar vinculado al repositorio

### **Problema: Las automatizaciones no funcionan**
**Solución:**
1. Verifica que estén activadas en Settings del proyecto
2. Algunas automatizaciones solo funcionan con GitHub Projects (nuevo) no (clásico)

### **Problema: No puedo ver la vista Roadmap**
**Solución:** La vista Roadmap requiere que los issues tengan fechas. Agrega el campo "Fecha Límite" a tus issues.

---

## 📚 Recursos Adicionales

- [Documentación oficial de GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [GitHub Projects Best Practices](https://github.blog/2022-07-27-planning-next-to-your-code-github-projects-is-now-generally-available/)
- [Video tutorial de GitHub Projects](https://www.youtube.com/results?search_query=github+projects+tutorial)

---

## ✅ Checklist de Inicio Rápido

- [ ] Crear proyecto en GitHub Projects
- [ ] Configurar columnas (Backlog, 5 fases, Completado)
- [ ] Crear milestone "Entrega Final" (10 de abril)
- [ ] Crear issues para cada fase
- [ ] Asignar issues a miembros del equipo
- [ ] Configurar labels y campos personalizados
- [ ] Activar automatizaciones
- [ ] Crear vistas adicionales (Table, Roadmap)
- [ ] Programar primera reunión de equipo
- [ ] ¡Comenzar a trabajar! 🚀

---

## 👥 Roles y Responsabilidades

Para un proyecto exitoso, define roles claros:

- **Project Manager:** Supervisa el proyecto, gestiona timeline
- **Tech Lead:** Decisiones técnicas, arquitectura
- **Frontend Developer:** Desarrollo UI con React/Electron
- **Backend Developer:** API con Node.js/Express
- **Database Administrator:** Diseño y gestión PostgreSQL
- **QA/Tester:** Planificación y ejecución de pruebas
- **DevOps:** CI/CD y despliegue

**Nota:** En equipos pequeños, una persona puede tener múltiples roles.

---

## 🎓 Consejos para Equipos Universitarios

1. **Comunicación constante:** Usen Slack, Discord o WhatsApp para día a día
2. **Commits frecuentes:** Hagan commit diario, aunque sea progreso pequeño
3. **No dejen todo para el final:** Distribuyan el trabajo uniformemente
4. **Documenten mientras trabajan:** No esperen al final para documentar
5. **Pidan ayuda temprano:** Si están bloqueados, comuníquenlo al equipo
6. **Usen branches:** Cada feature en su propia rama
7. **Revisen código entre ustedes:** Code reviews mejoran la calidad
8. **Backup:** GitHub ya es su backup, pero hagan backup de la BD regularmente

---

## 📝 Plantilla de Issue

Para mantener consistencia, usa esta plantilla al crear issues:

```markdown
## Descripción
[Descripción clara y concisa de la tarea]

## Fase
[X] Análisis
[ ] Diseño
[ ] Pruebas
[ ] UAT
[ ] Despliegue

## Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## Tareas
- [ ] Subtarea 1
- [ ] Subtarea 2
- [ ] Subtarea 3

## Dependencias
- Depende de: #[número de issue]
- Bloqueado por: #[número de issue]

## Notas Adicionales
[Cualquier información adicional relevante]

## Estimación de Tiempo
[X] Pequeña (< 1 día)
[ ] Media (1-3 días)
[ ] Grande (> 3 días)
```

---

## 🏆 Medición de Éxito

Tu proyecto será exitoso si al 10 de abril:

✅ Todos los issues están en "Completado"  
✅ El sistema cumple con los requisitos funcionales  
✅ Las pruebas tienen >80% de cobertura  
✅ UAT fue aprobado por usuarios reales  
✅ El sistema está desplegado y funcionando  
✅ La documentación está completa  

---

¡Mucho éxito con tu proyecto Electronic Health Record! 🎉👨‍⚕️💻

**Fecha de creación de esta guía:** Enero 20, 2026  
**Deadline del proyecto:** Abril 10, 2026  
**Tiempo restante:** ~11 semanas
