<div align="center">

# 🏥 Electronic Health Record System

### Sistema de Registro de Salud Electrónico Institucional
#### Departamento de Enfermería & Psicología

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![.NET MAUI](https://img.shields.io/badge/.NET%20MAUI-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/apps/maui)

</div>

---

## 🧭 Navegación Rápida por Componentes

Para acceder a las guías específicas de configuración, desarrollo y despliegue de cada componente, utiliza los siguientes enlaces rápidos:

*   **[⚙️ Backend (API REST)](./api/README.md)** - Servidor Express, Prisma ORM, Base de Datos PostgreSQL y Roles.
*   **[💻 Cliente Web (ut-care)](./ut-care/README.md)** - Interfaz React para psicólogos y enfermería (Portal Web).
*   **[📱 Cliente Móvil (AppEHR)](./AppEHR/README.md)** - Asistente de alta velocidad en .NET MAUI para Psicólogos.

---

## 📋 Descripción General

Este proyecto es un **Sistema de Registro de Salud Electrónico (EHR)** integral, diseñado a la medida para los departamentos de psicología y enfermería de instituciones educativas. Proporciona una plataforma digitalizada para el manejo de expedientes médicos, seguimiento de citas, historiales clínicos, evaluaciones y administración del inventario de medicamentos, operando bajo estándares de seguridad y confidencialidad alineados a políticas **HIPAA** y la **ODS 3 (Salud y Bienestar)**.

El sistema unifica la información en un **expediente clínico único por matrícula o número de empleado**, el cual es compartido por ambos departamentos:
*   **Enfermería** lo utiliza principalmente para registrar consultas del día, signos vitales y control de medicamentos en stock.
*   **Psicología** tiene acceso al contexto médico para valoraciones integrales y cuenta con herramientas para registrar sesiones de terapia, evaluaciones psicométricas e interconsultas.

---

## 🛠️ Stack Tecnológico Global

El proyecto está organizado en un monorepo que hace uso de las siguientes tecnologías por capa:

### 🗄️ Infraestructura & Base de Datos
*   **PostgreSQL:** Motor de base de datos relacional.
*   **Docker & Docker Compose:** Contenedorización de la base de datos para fácil inicialización.
*   *Descargas:* [Docker Desktop](https://www.docker.com/products/docker-desktop)

### ⚙️ Backend (API)
*   **Node.js (TypeScript) & Express:** Servidor REST de alto rendimiento.
*   **Prisma ORM:** Cliente de base de datos seguro para el mapeo relacional.
*   *Descargas:* [Node.js (v18+)](https://nodejs.org/)

### 💻 Cliente Web (`ut-care`)
*   **React (TypeScript) & Vite:** SPA ligera para el personal de salud administrativo en campus.
*   **TailwindCSS:** Diseño visual basado en la guía estética **Crystal Glass** (glassmorphism).
*   **Playwright:** Framework para automatización y pruebas de integración End-to-End (E2E).

### 📱 Cliente Móvil (`AppEHR`)
*   **.NET MAUI (.NET 10) & C# / XAML:** Aplicación multiplataforma exclusiva para psicólogos operativos (Android y Windows Desktop).
*   **xUnit:** Suite de pruebas unitarias para ViewModels.
*   *Descargas:* [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) | [Android Studio](https://developer.android.com/studio) (Para SDK de depuración y herramientas de emulador)

---

## 📁 Estructura del Monorepo

```
ElectronicHealthRecord/
├── .github/workflows/   # Workflows de CI/CD para compilación y pruebas automáticas
├── api/                 # Backend REST API (NodeJS + Express + Prisma ORM)
├── ut-care/             # Frontend principal en React (Portal para Psicólogos y Enfermería)
├── AppEHR/              # Cliente móvil para Psicólogos (.NET MAUI)
├── AppEHR.Tests/        # Pruebas unitarias de ViewModels (xUnit)
├── e2e/                 # Pruebas End-to-End para el cliente web (Playwright)
├── database/            # Scripts de respaldo y almacenamiento compartido
├── documents/           # Especificaciones técnicas, de diseño y guías del proyecto
├── docker-compose.yml   # Configuración de Docker para levantar la base de datos PostgreSQL
└── README.md            # Este archivo guía del monorepo
```

---

## 🚀 Guía de Inicio Rápido (Tras clonar el repositorio)

Sigue estos pasos generales para levantar toda la infraestructura de base de datos y tener el backend listo para los clientes:

### 1. Clonar el repositorio
```bash
git clone https://github.com/EdgarGmz/ElectronicHealthRecord.git
cd ElectronicHealthRecord
```

### 2. Levantar la Base de Datos (Docker)
Asegúrate de tener Docker Desktop ejecutándose en tu equipo. Desde la carpeta raíz del repositorio, levanta el contenedor de PostgreSQL:
```bash
docker compose up -d
```

### 3. Configurar e Iniciar el Backend (API)
Navega al directorio de la API, copia el archivo de entorno e inicializa la base de datos con los datos de desarrollo (seeds):
```bash
cd api
cp .env.example .env
npm install
npm run setup   # Instala dependencias, corre migraciones de Prisma e inyecta seeds de prueba
npm run dev     # Inicia el servidor de desarrollo en http://localhost:5000/api
```

Una vez que el backend esté ejecutándose, puedes proceder a inicializar y depurar tu cliente preferido siguiendo su README específico:
*   [Guía del Cliente Web (ut-care)](./ut-care/README.md)
*   [Guía del Cliente Móvil (AppEHR)](./AppEHR/README.md)

---

## 👥 Equipo y Participantes

El desarrollo del sistema EHR está compuesto por los siguientes roles clave:
*   **Project Manager:** Planificación y gestión de historias de usuario.
*   **Tech Lead:** Decisiones de arquitectura y diseño del modelo relacional.
*   **Backend Developer:** Desarrollo de endpoints REST, seguridad HIPAA y base de datos.
*   **Frontend Developer:** Diseño de vistas con Crystal Glass en React y .NET MAUI.
*   **QA Engineer:** Pruebas unitarias (xUnit, Jest) y pruebas E2E (Playwright).
