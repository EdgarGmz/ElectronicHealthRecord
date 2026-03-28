# EHR System - Frontend (Client)

Frontend del Sistema de Registro de Salud Electrónico. Construido con React, TypeScript, Vite, Tailwind CSS y diseño **Crystal Glass** (glassmorphism estilo iOS).

## Características

- **Estilo Crystal Glass**: Efectos de vidrio translúcido, backdrop blur y bordes sutiles (documentación en `documents/design/style-guide/GLASSMORPHISM_THEME.md`).
- **Tema modular**: Claro / Oscuro con opciones:
  - **Estático**: Claro u Oscuro fijo.
  - **Automático (turno)**: Cambia según horario (día 6:00–18:00, noche 18:00–6:00).
  - **Automático (sistema)**: Sigue la preferencia del SO.
- **Idioma**: Español e Inglés (configurable, persistido en `localStorage`).
- **Estructura**: Atomic Design (atoms, molecules, organisms), rutas según `documents/docs/diseno-tecnico/Flujo-Navegacion-Completo.md`.

## Requisitos

- Node.js 18+
- API backend en ejecución (por defecto `http://localhost:5000`).

## Instalación

```bash
cd ut-care
npm install
cp .env.example .env
# Editar .env: VITE_API_URL=http://localhost:5000/api
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). El proxy envía `/api` al backend.

## Build

```bash
npm run build
npm run preview   # previsualizar build de producción
```

## Variables de entorno

| Variable        | Descripción              | Default              |
|----------------|--------------------------|----------------------|
| `VITE_API_URL` | URL base de la API       | `http://localhost:5000/api` |
| `VITE_APP_NAME`| Nombre de la aplicación  | EHR System           |

## Estructura principal

```
src/
├── components/
│   ├── atoms/          # GlassCard, GlassButton
│   ├── molecules/      # ThemeToggle, LanguageSwitcher
│   └── organisms/      # Sidebar
├── layouts/            # MainLayout
├── pages/              # LoginPage, DashboardPage, ...
├── store/              # auth.store, theme.store (Zustand)
├── i18n/               # config + locales (es, en)
├── lib/                # api (axios)
├── App.tsx
├── main.tsx
└── index.css           # variables CSS tema + utilidades glass
```

## Pruebas E2E (Playwright)

Las pruebas end-to-end del flujo web (login, dashboard, etc.) viven en el paquete [`../e2e/`](../e2e/) del repositorio (Playwright + Chromium). El CI las ejecuta en GitHub Actions junto con la API y la base de datos; en local necesitas PostgreSQL con migraciones y seed. Instrucciones completas: [`../e2e/README.md`](../e2e/README.md).

Los formularios de login y el dashboard incluyen `data-testid` (`login-email`, `login-password`, `login-submit`, `dashboard-page`) para selectores estables en automatización.

## Documentación de diseño

- `documents/design/style-guide/GLASSMORPHISM_THEME.md` – Tema Crystal Glass
- `documents/design/style-guide/DARK_MODE.md` – Tema claro/oscuro
- `documents/docs/diseno-tecnico/Flujo-Navegacion-Completo.md` – Rutas y navegación
