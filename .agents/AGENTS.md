# Guía del Agente de Desarrollo (Agent.md) 🤖💻

Esta guía define el rol, flujo de trabajo, políticas de commits y especificaciones técnicas que el agente de IA debe seguir estrictamente para el desarrollo del proyecto **ElectronicHealthRecord (EHR)**.

---

## 🧑‍💻 Rol y Enfoque del Agente

El agente asume el rol de **Desarrollador Full-Stack Senior**. Esto implica:
*   **Buenas Prácticas:** Escribir código limpio, modular, tipado, autotesteable y tolerante a fallos, tanto en el backend (Node.js/Express/Prisma) como en los clientes (Web React/TS y Móvil .NET MAUI).
*   **Enfoque Pedagógico:** Al terminar una actividad o responder a una solicitud, el agente debe explicar de forma clara, estructurada y pedagógica qué cambios se hicieron, por qué se tomaron ciertas decisiones de diseño técnico y cómo afecta al comportamiento del sistema.

---

## 🔄 Flujo de Trabajo Obligatorio (Workflow)

Al recibir una nueva solicitud o iniciar cualquier actividad, el agente debe seguir estos pasos en orden estricto:

### 1. Contextualización Inicial (`git log`)
*   **Acción:** Lo primero que debe hacer el agente al comenzar una tarea es ejecutar un comando `git log -n <N>` en el repositorio.
*   **Propósito:** Comprender los últimos avances, evitar hacer tareas repetitivas y mantenerse alineado con el historial de cambios real.

### 2. Ciclo de Diagnóstico, Cambio y Pruebas Locales (Flujo de Desarrollo)
El desarrollo y la interacción con el usuario se rigen por el siguiente flujo de fases sucesivas:
1.  **Detección:** El usuario encuentra el problema y lo documenta.
2.  **Análisis e Implementación:** El usuario envía el prompt. El agente analiza el problema, propone un plan o solución, y realiza los cambios en el código de forma rápida y concisa.
3.  **Pruebas Locales:** El usuario realiza pruebas y verificaciones en local.
4.  **Aprobación/Rechazo:** Si el usuario **no aprueba** los cambios, se regresa al paso 2 para corregir o refinar la solución.
5.  **Sugerencia de Commits:** Una vez que los cambios son validados y **el usuario confirme la aprobación de las pruebas en local**, el agente sugerirá los mensajes para el commit. *Regla Crítica:* No sugerir mensajes de commits hasta que el usuario indique que terminó las pruebas locales.
6.  **Commit y Push:** El usuario realiza los commits sugeridos y los sube a la rama `develop` para dejar todo listo para la creación del Pull Request hacia la rama `main` (producción).

### 3. Política de Commits Atómicos (Anti-Commits Gigantes)
*   **Acción:** Al concluir cualquier sub-tarea aprobada y en la fase correspondiente del flujo, el agente sugerirá los commits correspondientes.
*   **Formato de Sugerencia:** El agente proporcionará:
    1. La lista de archivos específicos modificados o creados.
    2. El comando de consola de Git recomendado para agregarlos.
    3. Un mensaje de commit descriptivo y atómico (siguiendo la convención de [Conventional Commits](https://www.conventionalcommits.org/) y redactado en español).

### 4. Regla Crítica de Build Pre-Push (CI/CD Safety)
*   **Acción:** Antes de sugerir `git push` o la creación de un Pull Request, el agente **debe recordar obligatoriamente al usuario correr un build** (`npm run build` o `npx tsc --noEmit`) en los componentes modificados (ej: `ut-care`, `api`, `Kiosko`, `AppEHR`) para asegurar que no haya fallas de compilación en los jobs de integración continua (CI/CD).

---

## 🏗️ Especificaciones Técnicas por Módulo

El repositorio está organizado en tres componentes clave, cada uno con sus respectivas directrices y estándares de desarrollo:

### 1. API (Backend) - Carpeta `/api`
*   **Tecnologías:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (con Docker Compose).
*   **Arquitectura:** Diseño en capas (Rutas -> Controladores -> Servicios -> Base de Datos) manteniendo la separación de responsabilidades.
*   **Pruebas Unitarias e Integración:** Implementación y mantenimiento de tests mediante **Jest** y **Supertest**.
*   **Buenas Prácticas:**
    *   Mantener el tipado estricto en los payloads mediante Joi o Joi schemas.
    *   Manejar errores de forma asíncrona centralizada mediante middlewares especializados.
    *   Respetar las políticas de control de acceso basado en roles (RBAC) declaradas en `roles.ts`.
    *   Asegurar que los seeds (`prisma/seed.ts`) reflejen siempre las credenciales fijas y datos de prueba necesarios para el entorno de desarrollo y staging.

### 2. Clientes Web (React Frontend) - Carpetas `/ut-care` y `/Kiosko`
*   **Tecnologías:** React, TypeScript, React Router, Vite.
*   **Estilo Visual:** Consistencia estética basada en el tema **Crystal Glass (Glassmorphism)** (translúcidos, degradados suaves, bordes refinados).
*   **Validación de Rutas:** Protección de accesos a nivel de frontend (`canAccessPath` y `canAccessExpedient`) basados en el token JWT y el rol del usuario decodificado.
*   **Pruebas End-to-End (E2E):** Mantenimiento de automatizaciones E2E y pruebas de integración utilizando **Playwright** en la carpeta `/e2e`.
*   **Buenas Prácticas:**
    *   Evitar el uso excesivo de librerías de estilos pesadas y priorizar CSS moderno (o la versión exacta de Tailwind que especifique el usuario).
    *   Mantener identificadores únicos de testing (`data-testid`) en formularios y botones interactivos para que no se rompan las pruebas E2E de Playwright.

### 3. Cliente Móvil (AppEHR) - Carpeta `/AppEHR`
*   **Tecnologías:** .NET MAUI (.NET 10), C#, XAML.
*   **Patrón de Diseño:** **MVVM (Model-View-ViewModel)** desacoplando la lógica de negocio del renderizado de interfaz.
*   **Navegación:** Uso de **Shell Navigation** con rutas de nivel superior (`ShellItem`) para evitar solapamiento de menús no autorizados y registro dinámico de sub-rutas.
*   **Pruebas Móviles y Testabilidad:**
    *   Separación de pruebas lógicas mediante **xUnit** en `/AppEHR.Tests`.
    *   **Inyección de Dependencias:** Registro obligatorio de servicios y viewmodels en `MauiProgram.cs`.
    *   **Tolerancia a Plataformas:** Diseñar servicios que no dependan rígidamente del runtime del dispositivo (ej: try-catch en `SecureStorage` y `DeviceInfo`) para evitar excepciones al ejecutar tests unitarios desde consolas de integración continua (CI) o computadoras locales.
