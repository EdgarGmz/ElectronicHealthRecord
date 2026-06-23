---
name: frontend-ui-standards
description: Directrices del tema Crystal Glass (Glassmorphism), adaptabilidad responsiva en móviles/tabletas, targets de toque y compatibilidad entre todos los navegadores.
---

# Estándares de Diseño y UI Frontend (frontend-ui-standards) 🎨

Esta habilidad le enseña al agente cómo mantener la consistencia estética y funcional en los clientes web del EHR, apegándose al tema corporativo y garantizando una experiencia de usuario optimizada en todos los dispositivos y navegadores.

## 💎 Sistema de Diseño: Crystal Glass (Glassmorphism)
Todos los componentes visuales de `/ut-care` deben seguir el estilo translúcido y moderno definido por el tema de la aplicación:
- **Degradados suaves:** Usar degradados lineales sutiles de fondo en contenedores primarios.
- **Bordes refinados:** Definir bordes ultradelgados (ej. `1px border border-white/10`) con sombras difusas (`backdrop-blur`).
- **Estados de interacción:** Los elementos interactivos deben reaccionar con transiciones fluidas de opacidad y escala en el hover.

---

## 📱 Responsividad y Adaptabilidad (Smartphones, Tabletas y Desktops)
El sistema debe ser 100% responsivo para permitir su uso cómodo en consultorios (desktops), rondas de enfermería (tabletas) o de forma rápida en smartphones.
- **Breakpoints Estándar:** Diseñar las interfaces pensando en el flujo móvil-primero (Mobile-First):
  - **Móvil (`sm` / `< 768px`):** Layouts en una sola columna. Ocultar columnas secundarias en tablas e implementar menús colapsables (hamburguesa).
  - **Tableta (`md` / `768px - 1024px`):** Reorganización a dos columnas o rejillas híbridas. Las tablas extensas deben permitir desplazamiento horizontal suave (`overflow-x-auto`).
  - **Desktop (`lg` / `> 1024px`):** Layouts multi-columna expansivos y menús laterales fijos.
- **Zonas de Toque (Touch Targets):** En dispositivos táctiles (smartphones/tabletas), los botones, enlaces e iconos interactivos deben tener un área mínima de contacto de **44px x 44px** (o padding equivalente) para evitar toques accidentales y mejorar la accesibilidad.
- **Desbordamientos:** Usar siempre unidades relativas (`em`, `rem`, `%`, `vh/vw`) y evitar anchos fijos en pixeles para prevenir scroll horizontal inesperado en pantallas angostas.

---

## 🌐 Compatibilidad Multnavegador (Chrome, Safari, Firefox, Edge)
Garantizar que los controles de formularios y elementos dinámicos se visualicen idénticos en todos los motores de renderizado (Blink, WebKit, Gecko):

### 1. Inputs de Búsqueda y Limpieza
- **Doble botón de limpiar en Safari:** Ocultar el botón de limpieza nativo (`x`) de Safari en elementos `input[type="search"]` para usar exclusivamente nuestro botón personalizado:
  ```css
  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
  }
  ```
- **Botón de limpiar en Edge/Chrome:** Ocultar también los selectores nativos equivalentes de Microsoft:
  ```css
  input::-ms-clear {
    display: none;
  }
  ```

### 2. Estructura y Altura de Formularios
- **Normalización de Selectores:** Asegurar que los selectores (`select`), inputs de fecha (`input[type="date"]`) y entradas de texto tengan una altura uniforme definida de manera explícita (ej. `h-10`), previniendo que Safari o Firefox encojan los campos de fecha u horas.
- **Reinicios de Navegador (Appearance):** Usar `appearance: none` en elementos `select` personalizados para eliminar las flechas nativas del navegador y utilizar iconos vectoriales SVG consistentes en todo el sistema.
- **Scrollbar Personalizado:** Para listas o tablas internas, diseñar barras de desplazamiento sutiles y estéticas que funcionen tanto en navegadores basados en Chromium como en Firefox.
