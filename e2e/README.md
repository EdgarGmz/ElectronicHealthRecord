# Pruebas E2E (Playwright)

Automatización del cliente **ut-care** contra la **API** real: login, redirección al dashboard y manejo de errores de autenticación.

## Requisitos

- **Node.js** 18+ y npm.
- **PostgreSQL** accesible (p. ej. `docker compose up -d` desde la raíz del repositorio).
- Base de datos migrada y con datos de prueba (incluyendo usuario admin `EdgarGMZ`): en `api/`, `npx prisma migrate deploy` y `npm run prisma:seed` (o el flujo que uses habitualmente).

## Primera vez

```bash
cd e2e
npm ci
npx playwright install chromium
```

En Linux, si faltan librerías del sistema, usa `npx playwright install chromium --with-deps` (como en CI).

## Ejecutar tests

Desde `e2e/`, con la misma `DATABASE_URL` que la API:

```bash
export DATABASE_URL="postgresql://admin:admin1234@localhost:5432/ehr_db"
npm test
```

Playwright arranca solo la API (`npm run dev` en `../api`) y **ut-care** (`npm run dev` en `../ut-care`). Usa **`http://localhost:5173`** como base URL (no `127.0.0.1`): en desarrollo la API solo permite CORS para `localhost`.

Variables opcionales:

| Variable | Descripción |
|----------|-------------|
| `E2E_ADMIN_USERNAME` | Usuario admin para login (por defecto `EdgarGMZ`). |
| `E2E_ADMIN_EMAIL` | **Legado**: se interpreta como *username* (no email). Si contiene `@`, usa `E2E_ADMIN_USERNAME`. |
| `E2E_ADMIN_PASSWORD` | Contraseña (por defecto la del seed: `Password123!`). |

Modo UI interactivo: `npm run test:ui`.

## CI

El job **E2E** en [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) instala dependencias de `api`, `ut-care` y `e2e`, aplica migraciones y seed, instala Chromium con dependencias del sistema y ejecuta `npm test` aquí.

## Estructura

```
e2e/
├── playwright.config.ts   # Servidores web, baseURL, proyecto Chromium
├── tests/
│   └── auth.spec.ts       # Flujos de autenticación
└── package.json
```
