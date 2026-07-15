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

---

## 🌐 4. Iconografía Vectorial Minimalista y Centralización de Estilos

Para garantizar que todas las interfaces (tanto web en `ut-care` como móviles en `AppEHR`) sean ligeras, adaptables y fáciles de mantener, se deben seguir estos lineamientos generales de iconografía y estilos:

### 1. Preferencia por Vectores (SVG) en lugar de Imágenes Ráster (PNG/JPG)
*   **Escalabilidad:** Toda la iconografía (barras de navegación, botones, alertas) debe diseñarse utilizando formatos vectoriales (SVG o elementos Path).
*   **Limpieza y Colores:** Los archivos SVG deben estructurarse con trazos limpios (`stroke-width="2"`, `fill="none"`) y sin colores fijos en la etiqueta del path (usar `currentColor` en web o valores genéricos que puedan ser tintados por el contenedor, ej. `Stroke="{StaticResource BrandPrimary}"` en XAML).

### 2. Barra de Navegación con Pestañas (Tabbed Navigation)
*   **Navegación Visual:** Las barras de navegación inferiores en móviles o barras de navegación principales en web deben ir acompañadas de iconos minimalistas descriptivos para guiar al usuario.
*   **Soporte de Estados:** Cada icono de pestaña debe responder visualmente al estado activo/inactivo (por ejemplo, cambiando opacidad, grosor o tonalidad de color).

### 3. Centralización Absoluta de Tokens de Diseño
*   **Prohibición de Colores Hardcodeados:** Queda prohibido el uso de valores hexadecimales de colores directamente en los archivos de vistas (`.tsx`, `.xaml`, `.html`).
*   **Variables y Recursos:** Todos los colores, tipografías y sombras deben apuntar a las variables globales definidas (como clases de Tailwind en web o claves `{StaticResource ...}` / `AppThemeBinding` en XAML). Esto permite realizar un cambio de marca (rebranding) en toda la aplicación modificando un único archivo de configuración (`tailwind.config.js` o `Colors.xaml`).
