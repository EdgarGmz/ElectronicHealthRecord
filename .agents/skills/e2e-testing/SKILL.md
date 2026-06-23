---
name: e2e-testing
description: Directrices para pruebas de extremo a extremo (E2E) con Playwright, mantenimiento de selectores testid y pruebas de regresión.
---

# Pruebas de Extremo a Extremo con Playwright (e2e-testing) 🧪

Esta habilidad le enseña al agente cómo estructurar, escribir y mantener pruebas automatizadas E2E en la carpeta `/e2e` del repositorio, garantizando estabilidad en los flujos principales del sistema.

## 🏷️ Política de Selectores Robustos (`data-testid`)
Para evitar que las pruebas E2E se rompan debido a refactorizaciones de estilos o estructura HTML, es obligatorio usar selectores de testing dedicados:
- **Regla:** En cualquier botón interactivo, formulario, filtro de búsqueda o input clave, añadir el atributo `data-testid`.
- **Ejemplo en componente React:**
  `<button data-testid="clean-filter-btn" className="...">Limpiar</button>`
- **Ejemplo en el test de Playwright:**
  `await page.locator('[data-testid="clean-filter-btn"]').click();`
- **Evitar:** Nunca apuntar tests E2E basándose en clases CSS cambiantes, textos de botones que varían con la internacionalización (i18n), o selectores de orden DOM (`div > div > button`).

---

## 🏃 Ejecución y Depuración de Pruebas
Los tests E2E se administran desde la raíz o dentro del módulo frontend.
- **Correr todas las pruebas en modo headless:** `npx playwright test` (o mediante el script correspondiente en `package.json`).
- **Correr pruebas con interfaz interactiva (UI Mode):** `npx playwright test --ui` (ideal para depuración paso a paso).
- **Ejecutar un test específico:** `npx playwright test tests/auth.spec.ts`.

---

## 🔒 Control de Estado y Limpieza de Datos
Dado que las pruebas E2E escriben e interactúan con la base de datos real o de pruebas:
- **Aislamiento:** Asegurar que cada suite cree y limpie sus propios datos (o use usuarios fijos predecibles).
- **Pre-requisitos:** Correr las pruebas preferentemente sobre un entorno previamente sembrado con `SEED_TARGET=dev` o `robust` para garantizar que existan los roles necesarios.
