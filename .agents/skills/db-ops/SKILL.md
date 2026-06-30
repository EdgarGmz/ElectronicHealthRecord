---
name: db-ops
description: Guía de comandos de base de datos, inicialización con Docker Compose, migración y estrategias de siembra (seed) en EHR.
---

# Gestión y Operación de Base de Datos (db-ops) 🗄️

Esta habilidad le enseña al agente cómo gestionar el ciclo de vida de la base de datos PostgreSQL, ejecutar migraciones seguras y sembrar datos de prueba según las necesidades del desarrollo.

## 🐳 Contenedor Local de Base de Datos
El proyecto cuenta con un entorno de base de datos PostgreSQL orquestado a través de Docker Compose en la raíz del repositorio.
- **Comando para levantar la base de datos:** `npm run db:up` (ejecuta `docker compose up -d db` en segundo plano).
- **Comando para detener la base de datos:** `npm run db:down`.

---

## ⚡ Comandos de Prisma ORM (Backend)
Las siguientes tareas se ejecutan dentro del directorio `/api`:

### 1. Migraciones de Base de Datos
- **Crear y aplicar una migración en desarrollo:** `npm run prisma:migrate` (detecta cambios en `schema.prisma` y genera la estructura).
- **Desplegar migraciones en staging/producción (sin crear nuevas):** `npm run prisma:deploy`.

### 2. Generación del Cliente
- **Regenerar el Prisma Client:** `npm run prisma:generate` (esencial después de cambiar `schema.prisma` o al clonar/limpiar node_modules).

---

## 🌱 Estrategias y Objetivos de Siembra (Seeding)
La base de datos se siembra mediante el script `api/prisma/seed.ts` bajo la variable de entorno `SEED_TARGET`.

- **Comando base de siembra:** `npm run prisma:seed`.
- **Comando de reinicio total con siembra:** `npm run prisma:reset:seed` (limpia bases de datos anteriores, aplica migraciones de cero y ejecuta el sembrado).

### Targets de Siembra (`SEED_TARGET`)
Al ejecutar el sembrado, configura la variable para dictar el volumen y el tipo de datos a generar:
1. **`clean`** (Target por defecto):
   - **Propósito:** Genera el catálogo base de carreras (`Career`) y un usuario administrador único.
   - **Credenciales:** `admin@ehr-system.com` / `Password123!` (Nombre: Edgar Gomez, Username: EdgarGMZ).
2. **`dev`**:
   - **Propósito:** Genera el entorno básico de pruebas locales para desarrollo cotidiano.
   - **Contenido:** Crea los usuarios fijos del personal de salud (Xochilt Clara, Edgar Tiburcio, Orlando de Jesus, Carlos Alexis, Daniela Mayte) y siembra datos iniciales.
3. **`robust`**:
   - **Propósito:** Carga masiva de datos (mínimo 100 registros por tabla).
   - **Uso:** Utilizar para realizar pruebas de carga, paginación, filtros de bitácora y optimización de consultas SQL.
4. **`prod`**:
   - **Propósito:** Configuración optimizada de usuarios y parámetros reales para el lanzamiento a producción.
5. **`demo`** ⭐ (Exposición universitaria):
   - **Propósito:** Dataset definitivo para presentaciones y demostraciones académicas. Limpia la BD y siembra datos ricos, coherentes y en español.
   - **Contenido:** 5 usuarios de staff reales + 312 alumnos + 30 docentes distribuidos en las 12 carreras. Expedientes médicos y psicológicos con frases clínicas en español, sesiones de terapia, consultas de enfermería, citas, lista de espera, interconsultas y 10 blog posts temáticos (incluyendo artículo sobre el Mundial 2026 y Nuevo León).
   - **Correos:** Alumnos → `[nombre][3consonantes]@virtual.utsc.edu.mx` | Docentes → `[nombre][3consonantes]@utsc.edu.mx`
   - **Credenciales:** Todos con contraseña `Password123!`.
   - **Comando:** `SEED_TARGET=demo npm run prisma:seed`
