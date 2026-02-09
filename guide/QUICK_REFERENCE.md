# Quick Reference - Fases del Proyecto

## 🎯 Proyecto: Electronic Health Record
**Deadline:** 10 de Abril, 2026

---

## 📊 Las 5 Fases

### 1️⃣ ANÁLISIS (2-3 semanas)
**Fechas:** Ene 20 - Feb 10  
**Objetivo:** Entender requisitos completamente

**Entregables clave:**
- ✅ Documento de requisitos funcionales y no funcionales
- ✅ Casos de uso y historias de usuario
- ✅ Análisis de tecnologías

**Issues a crear:**
- [Análisis] Definir requisitos funcionales
- [Análisis] Definir requisitos no funcionales
- [Análisis] Análisis de tecnologías y herramientas
- [Análisis] Identificar riesgos del proyecto

---

### 2️⃣ DISEÑO (2-3 semanas)
**Fechas:** Feb 10 - Mar 3  
**Objetivo:** Crear el blueprint del sistema

**Entregables clave:**
- ✅ Diagrama ER de base de datos
- ✅ Diseño de arquitectura del sistema
- ✅ Mockups y wireframes de UI/UX
- ✅ Documentación de API endpoints

**Issues a crear:**
- [Diseño] Diseño de base de datos PostgreSQL
- [Diseño] Diseño de arquitectura del sistema
- [Diseño] Diseño UI/UX y mockups
- [Diseño] Documentación de API REST

---

### 3️⃣ DESARROLLO + PRUEBAS (3-4 semanas)
**Fechas:** Mar 3 - Mar 31  
**Objetivo:** Implementar sistema con tests

**Entregables clave:**
- ✅ Código fuente (frontend + backend)
- ✅ Suite de pruebas (>80% cobertura)
- ✅ Documentación de código

**Issues a crear:**
- [Desarrollo] Setup del proyecto (backend + frontend)
- [Desarrollo] Implementar autenticación y autorización
- [Desarrollo] Módulo de gestión de estudiantes
- [Desarrollo] Módulo de expedientes médicos
- [Desarrollo] Módulo de citas
- [Desarrollo] Módulo de medicamentos
- [Desarrollo] Módulo de reportes
- [Pruebas] Configurar framework de testing
- [Pruebas] Pruebas unitarias backend
- [Pruebas] Pruebas unitarias frontend
- [Pruebas] Pruebas de integración
- [Pruebas] Pruebas E2E

---

### 4️⃣ UAT (1 semana)
**Fechas:** Mar 31 - Abr 7  
**Objetivo:** Validar con usuarios reales

**Entregables clave:**
- ✅ Plan de pruebas UAT
- ✅ Reporte de feedback
- ✅ Sistema corregido según feedback

**Issues a crear:**
- [UAT] Preparar ambiente de pruebas
- [UAT] Crear casos de prueba
- [UAT] Sesión de pruebas con usuarios
- [UAT] Corrección de issues encontrados
- [UAT] Re-validación con usuarios

---

### 5️⃣ DESPLIEGUE (3 días)
**Fechas:** Abr 7 - Abr 10  
**Objetivo:** Sistema en producción

**Entregables clave:**
- ✅ Sistema desplegado
- ✅ Pipeline CI/CD
- ✅ Documentación de usuario y técnica
- ✅ Monitoreo configurado

**Issues a crear:**
- [Despliegue] Configurar servidor de producción
- [Despliegue] Configurar base de datos en producción
- [Despliegue] Crear pipeline CI/CD
- [Despliegue] Documentación final
- [Despliegue] Configurar monitoreo y logs
- [Despliegue] Capacitación a usuarios

---

## 🚀 Inicio Rápido

### Hoy (Día 1):
1. ✅ Leer [Guía de GitHub Projects](./GITHUB_PROJECTS_GUIDE.md)
2. ✅ Crear proyecto en GitHub
3. ✅ Configurar columnas: Backlog, 5 Fases, Completado
4. ✅ Crear milestone "Entrega Final" (10 abril)
5. ✅ Crear primeros issues de Análisis
6. ✅ Asignar tareas al equipo
7. ✅ Primera reunión de equipo

### Esta Semana:
- Crear todos los issues de Fase 1 (Análisis)
- Empezar investigación y documentación
- Setup ambiente de desarrollo
- Definir horarios de stand-ups diarios

---

## 📋 Checklist de GitHub Projects

**Setup Inicial:**
- [ ] Proyecto creado en GitHub
- [ ] 7 columnas configuradas (Backlog + 5 Fases + Completado)
- [ ] Milestone "Entrega Final" creado (10 abril)
- [ ] Campo personalizado "Prioridad" agregado
- [ ] Campo personalizado "Fecha Límite" agregado
- [ ] Labels creados (análisis, diseño, pruebas, uat, despliegue)

**Issues Creados:**
- [ ] Fase 1: Análisis (4-5 issues)
- [ ] Fase 2: Diseño (4-5 issues)
- [ ] Fase 3: Desarrollo + Pruebas (12-15 issues)
- [ ] Fase 4: UAT (4-5 issues)
- [ ] Fase 5: Despliegue (5-6 issues)

**Configuración:**
- [ ] Automatizaciones activadas
- [ ] Vista Board configurada
- [ ] Vista Table configurada
- [ ] Vista Roadmap configurada
- [ ] Equipo asignado a issues

---

## 👥 Roles Sugeridos

| Rol | Responsabilidades | Fases Principales |
|-----|-------------------|-------------------|
| **Project Manager** | Timeline, coordinación | Todas |
| **Tech Lead** | Arquitectura, decisiones técnicas | 2, 3, 5 |
| **Frontend Dev** | React/Electron | 2, 3 |
| **Backend Dev** | Node.js/Express/API | 2, 3 |
| **DB Admin** | PostgreSQL, queries | 2, 3 |
| **QA/Tester** | Testing, UAT | 3, 4 |
| **DevOps** | CI/CD, deployment | 5 |

**Nota:** En equipos pequeños, combina roles según habilidades.

---

## 📊 KPIs a Monitorear

| Métrica | Meta | Frecuencia |
|---------|------|------------|
| Issues completados | Según plan | Diaria |
| Cobertura de tests | >80% | Semanal |
| Bugs críticos | 0 | Continua |
| Velocidad del equipo | Estable | Semanal |
| Satisfacción UAT | >80% | Fase 4 |

---

## ⚡ Tips Rápidos

1. **Daily Stand-up (5-10 min):**
   - ¿Qué hice ayer?
   - ¿Qué haré hoy?
   - ¿Algún blocker?

2. **Commits frecuentes:**
   - Commit al menos 1 vez al día
   - Mensajes descriptivos
   - Referenciar issues: `git commit -m "Fix login bug #12"`

3. **Code Reviews:**
   - Todo PR debe ser revisado
   - Al menos 1 aprobación antes de merge
   - Usar checklist de review

4. **Documentar todo:**
   - Documentar mientras trabajas
   - Comentar código complejo
   - Actualizar README

5. **No dejar para el final:**
   - Distribuir trabajo uniformemente
   - Buffer para imprevistos
   - Testing continuo, no al final

---

## 🆘 Contactos de Emergencia

**Si algo sale mal:**

1. **Bloqueado en una tarea:**
   - Comenta en el issue
   - Menciona a @team
   - Pide ayuda en reunión diaria

2. **Bug crítico:**
   - Crea issue con label `bug` y `priority: high`
   - Notifica al equipo inmediatamente
   - Trabaja en fix de inmediato

3. **Atrasado en timeline:**
   - Alerta temprana al PM
   - Re-prioriza tareas
   - Considera reducir scope (si es posible)

4. **Conflicto en el equipo:**
   - Habla directamente con la persona
   - Si no se resuelve, escala al PM
   - Mantén profesionalismo

---

## 🎓 Recursos Esenciales

- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [React Docs](https://react.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

## ✅ Verificación Final (10 de Abril)

Antes de entregar, verifica:
- [ ] Todas las features funcionando
- [ ] Tests >80% coverage
- [ ] 0 bugs críticos
- [ ] Documentación completa
- [ ] Sistema desplegado
- [ ] UAT aprobado
- [ ] Demo preparada

---

**¡Éxito! 🚀**

Para más detalles, consulta:
- [Guía Completa de GitHub Projects](./GITHUB_PROJECTS_GUIDE.md)
- [Estructura del Proyecto](./PROJECT_STRUCTURE.md)
