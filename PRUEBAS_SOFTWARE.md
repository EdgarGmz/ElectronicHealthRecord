# Reporte de Pruebas de Software - Proyecto EHR

Este documento detalla la ejecución de los diferentes tipos de pruebas de software solicitados para el proyecto Electronic Health Record (EHR).

## 1. Pruebas Unitarias (Unit Testing)
Se centraron en componentes aislados del sistema.
- **Componente probado:** `api/src/utils/password.ts`
- **Resultado:** 100% de éxito.
- **Descripción:** Se validó que el hashing de contraseñas sea irreversible y que la comparación funcione correctamente tanto para casos positivos como negativos.

## 2. Pruebas de Integración (Integration Testing)
Se validó la interacción entre diferentes módulos (Rutas, Controladores, Servicios y Base de Datos).
- **Flujo probado:** Endpoint de Autenticación (`POST /api/auth/login`).
- **Resultado:** Exitoso.
- **Descripción:** Se verificó que el controlador reciba la petición, el servicio valide contra la base de datos PostgreSQL y se retorne un JWT válido.

## 3. Pruebas de Caja Negra (Black Box Testing)
Pruebas funcionales basadas en requerimientos, sin conocimiento del código interno.
- **Caso de prueba:** Intento de login con usuario inexistente y contraseña incorrecta.
- **Resultado:** El sistema responde correctamente con códigos de error 401 y mensajes adecuados, protegiendo la integridad del sistema.

## 4. Pruebas de Caja Blanca (White Box Testing)
Pruebas con conocimiento del código interno para asegurar la cobertura de rutas lógicas.
- **Herramienta:** Jest Coverage Report.
- **Resultado:** Se obtuvo un reporte detallado de cobertura (Statements, Branches, Functions, Lines).
- **Evidencia:** El servicio de `AuthService` y `Password Utility` muestran ejecución de sus caminos críticos.

## 5. Pruebas de Regresión (Regression Testing)
Asegurar que nuevos cambios no afecten funcionalidades existentes.
- **Acción:** Ejecución de la suite completa de pruebas después de corregir errores de compilación en los servicios de pacientes y auditoría.
- **Resultado:** 8 tests pasados en total (incluyendo el Health Check original).

## 6. Pruebas de Rendimiento (Performance Testing)
Medición de tiempos de respuesta bajo condiciones normales.
- **Métrica:** Tiempo de respuesta del Login.
- **Resultado:** **247ms** (Objetivo: < 500ms).
- **Estado:** Cumplido.

## 7. Pruebas de Esfuerzo (Stress Testing)
Validación del comportamiento del sistema bajo carga alta o simultaneidad.
- **Prueba:** 50 peticiones de login concurrentes.
- **Resultado:** 50/50 exitosas en **1.18 segundos**.
- **Estado:** Estable.

## 8. Pruebas de Usabilidad (Usability Testing)
Evaluación de la facilidad de uso y accesibilidad.
- **Hallazgos en el proyecto:**
    - **Internacionalización:** Uso de `i18next` para soporte multi-idioma.
    - **Accesibilidad Visual:** Uso de `lucide-react` para iconografía estandarizada.
    - **Feedback:** Implementación de validaciones de formularios con `react-hook-form` y `zod` que proporcionan mensajes claros al usuario.

---
**Fecha de ejecución:** 15 de marzo de 2026
**Herramientas utilizadas:** Jest, Supertest, Prisma, Docker.
