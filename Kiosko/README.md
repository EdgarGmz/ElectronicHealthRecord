# UT Care - Kiosko de Autoservicio UTSC

El **Kiosko de Autoservicio** es una interfaz web intuitiva, empática y de alto rendimiento diseñada con Astro para los alumnos de la Universidad Tecnológica de Santa Catarina (UTSC). Integra herramientas de salud mental, física y contención emocional en un solo portal unificado con el sistema UT Care.

---

## 🚀 Características Principales

1. **Mural de Salud y Consejos:**
   * Un muro interactivo con tarjetas en tonos pastel clasificado por categorías (Salud Mental, Salud Física, Eventos y Días Especiales).
   * **Reacciones (Likes):** Botón de corazón interactivo con micro-animaciones de escala y prevención de duplicados local mediante `localStorage`.
   * **Compartición Inteligente:** Botón de compartir que utiliza la API *Web Share* nativa en dispositivos móviles y copia al portapapeles en computadoras de escritorio.
   * **Anclaje de Publicación:** Al ingresar con un hash en la URL (ej. `/#post-[id]`), el portal realiza scroll suave automático y resalta la tarjeta correspondiente con un destello luminoso pastel.

2. **Registro Anónimo vs. Estándar:**
   * Pestañas interactivas en la vista de registro que permiten registrarse con datos reales o un pseudónimo/alias.
   * La modalidad anónima asegura la privacidad absoluta de los medios de contacto (correo y WhatsApp), los cuales solo son visibles para el especialista asignado para la cita.

3. **Widget de Apoyo Emocional ("No estás solo(a)"):**
   * Un banner superior dinámico que rota frases empáticas con fundido suave.
   * Enlaza directamente al agendado inteligente y muestra una notificación flotante persistente tras confirmar una cita con éxito.

4. **Agenda en Fila Virtual:**
   * Permite a los alumnos autenticados solicitar apoyo y entrar a la fila de atención rápida en el departamento de Psicología o Enfermería de forma sencilla.

5. **Panel de Administración Oculto (`/mural-admin`):**
   * Ruta protegida con una clave maestra (`BLOG_ADMIN_PASSCODE` en el backend) que permite a los psicólogos y enfermeros crear nuevos posts para el mural sin requerir credenciales complejas de inicio de sesión de administrador.

---

## 🛠️ Estructura del Proyecto

```text
Kiosko/
├── public/                # Recursos estáticos (favicons, imágenes, etc.)
├── src/
│   ├── assets/            # Imágenes y estilos globales adicionales
│   ├── components/        # Componentes reutilizables
│   │   ├── EmpatheticWidget.astro  # Banner rotativo de frases de apoyo
│   │   ├── ProjectStory.astro      # Sección de superación del estigma
│   │   ├── MuralBoard.astro        # Grid del mural interactivo y likes
│   │   ├── Footer.astro            # Pie de página integrado
│   │   └── ThemeToggle.astro       # Interruptor modo oscuro/claro
│   ├── layouts/
│   │   └── Layout.astro            # Plantilla global con diseño base y scroll-reveal
│   ├── pages/
│   │   ├── index.astro             # Página de inicio del Kiosko
│   │   ├── login/                  # Autenticación con usuario o alias
│   │   ├── signup/                 # Registro con modalidad estándar y anónima
│   │   ├── agendar/                # Formulario de citas en la fila virtual
│   │   └── mural-admin.astro       # Publicador para psicólogos (Clave maestra)
│   └── utils/
│       └── api.ts                  # Utilidades fetch adaptadas a local y Render API
└── package.json
```

---

## ⚙️ Configuración y Ejecución

### Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) en tu sistema. El servidor del backend Express de **UT Care** debe estar corriendo en `http://localhost:5000` (desarrollo local) o bien apuntando al servidor en producción de Render (`https://ehr-api-prod.onrender.com`).

### Instalación de Dependencias

Ejecuta el siguiente comando en el directorio `Kiosko`:

```sh
npm install
```

### Ejecutar en Desarrollo

Para iniciar el servidor de desarrollo local de Astro (usualmente en `http://localhost:4321`):

```sh
npm run dev
```

### Compilar para Producción

Para construir el portal optimizado y estático en la carpeta `./dist/`:

```sh
npm run build
```

---

## 🛡️ Seguridad y Confidencialidad

* Las credenciales de sesión se guardan de forma local en `localStorage` cifradas por el backend (JWT).
* Las reacciones (likes) se registran en la base de datos de UT Care asociadas a la publicación correspondiente, y el bloqueo temporal se gestiona localmente en el navegador para optimizar el rendimiento y la privacidad.
* La ruta de publicación rápida solicita la clave maestra definida en las variables de entorno del backend para autorizar la inserción en la base de datos PostgreSQL.
