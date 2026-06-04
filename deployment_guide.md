# 🚀 Guía de Primer Despliegue Real - EHR System

¡Felicidades por dar el paso de llevar tu aplicación de tu entorno local (`localhost`) a un entorno de producción accesible en Internet! 

Esta guía pedagógica está diseñada para que entiendas **qué sucede detrás de escena** durante un despliegue y aprendas a realizarlo tú mismo de forma segura y estructurada.

---

## 🧠 Conceptos Básicos: ¿Qué es hacer un "Deploy"?

En desarrollo local, tu computadora actúa como el cliente y el servidor al mismo tiempo. Al hacer un **deploy (despliegue)**, separamos estos roles y los trasladamos a computadoras especializadas en Internet que están encendidas las 24 horas del día (servidores).

Para nuestro sistema **EHR**, necesitamos desplegar tres piezas que interactúan entre sí:
1.  **La Base de Datos (Persistencia)**: Un servidor de PostgreSQL accesible a través de Internet.
2.  **El Backend / API (Lógica)**: El código en Node.js/Express ejecutándose continuamente para procesar solicitudes.
3.  **El Frontend (Interfaz)**: Los archivos estáticos (HTML, CSS, JS compilados) que el navegador del usuario final descarga.

---

## 🏢 1. Recomendaciones de Hosting

Para tu primer deploy, evaluar la complejidad técnica y el costo es fundamental. Aquí tienes las mejores opciones del mercado clasificadas por su curva de aprendizaje:

| Plataforma | Tipo | Costo Estimado | Dificultad | Ventajas | Desventajas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Render** <br>*(Recomendado)* | PaaS (Plataforma como Servicio) | Gratis (Sitio estático) <br> $7 USD/mes (API) <br> $7 USD/mes (Base de datos) | **Baja** | • Conexión directa a GitHub<br>• SSL (HTTPS) gratis automático<br>• Interfaz muy amigable | • La base de datos gratuita expira en 90 días.<br>• Los servicios gratuitos se "duermen" si no tienen visitas. |
| **Railway** | PaaS (Plataforma como Servicio) | Basado en consumo real <br> (~$5-10 USD/mes) | **Baja-Media** | • Excelente soporte para Docker Compose<br>• Despliegues rapidísimos<br>• Muy escalable | • No cuenta con capa 100% gratuita permanente.<br>• Curva de precios si escala mucho. |
| **DigitalOcean** | VPS (Servidor Privado Virtual) | $4 a $6 USD/mes | **Alta** | • Control absoluto sobre el sistema operativo (Ubuntu)<br>• Costo fijo muy bajo<br>• Permite levantar docker-compose idéntico al local | • Debes configurar todo manualmente por consola (terminal)<br>• Tú te encargas de la seguridad, el firewall y los certificados SSL. |
| **AWS / GCP** | Proveedor Cloud Corporativo | Pago por uso (Puede ser gratis 1 año) | **Muy Alta** | • Cumplimiento HIPAA nativo con configuraciones seguras<br>• Infraestructura de nivel mundial | • Consola sumamente compleja<br>• Si configuras algo mal, puedes recibir cobros muy altos e imprevistos. |

> [!TIP]
> **Mi sugerencia para tu primer deploy:** 
> Desplegar la **Base de Datos y la API en Render**, y los **Frontends (React/Astro) en Vercel o Render (Static Sites)**. Esto te dará una experiencia fluida y rápida con un costo mínimo (o gratuito para pruebas) y sin dolores de cabeza de administración de servidores Linux.

---

## 🛠️ 2. Arquitectura de Despliegue en Producción

En producción, la comunicación segura (`HTTPS`) y la inyección de variables de entorno seguras son obligatorias.

```
                  ┌──────────────────────────────┐
                  │      Navegador del Usuario   │
                  └──────────────┬───────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼ (HTTPS / Descarga)                        ▼ (HTTPS / API Calls)
┌──────────────────────┐                     ┌──────────────────────┐
│  Frontend (Vercel)   │                     │  Backend API (Render)│
│  ut-care  •  Kiosko  │                     │  Express / Node      │
└──────────────────────┘                     └──────────┬───────────┘
                                                        │ (Conexión Interna Protegida)
                                                        ▼
                                             ┌──────────────────────┐
                                             │ PostgreSQL (Render)  │
                                             │ Base de Datos        │
                                             └──────────────────────┘
```

---

## 📋 3. Pasos Exactos para el Despliegue con Render + Vercel

Sigue estos pasos en orden secuencial para completar tu despliegue:

### Paso 1: Subir tu Código a GitHub
Render y Vercel se conectan a tu repositorio de GitHub para automatizar el despliegue cada vez que haces cambios en tu código (`git push`).
1.  Crea un repositorio privado en GitHub.
2.  Sube tu proyecto EHR completo a este repositorio.

---

### Paso 2: Crear y Desplegar la Base de Datos (PostgreSQL)
1.  Inicia sesión en **[Render.com](https://render.com/)**.
2.  Haz clic en **New** (Nuevo) y selecciona **PostgreSQL**.
3.  Configura los campos:
    *   **Name**: `ehr-db-prod`
    *   **Database**: `ehr_db`
    *   **User**: `admin`
    *   **Region**: Selecciona la más cercana a ti (ej. *Oregon* o *Ohio*).
4.  Selecciona el plan **Free** (gratuito) para tu aprendizaje o **Starter** para entornos persistentes.
5.  Haz clic en **Create Database**.
6.  Una vez creada, copia la **Internal Database URL** (para uso de la API interna de Render) o **External Database URL** (para conectarte desde tu máquina local si lo deseas). Se verá algo así:
    `postgresql://admin:password@dpg-xxxxxx-a.oregon-postgres.render.com/ehr_db`

---

### Paso 3: Desplegar la API en Render (Web Service)
1.  En la consola de Render, haz clic en **New** y selecciona **Web Service**.
2.  Conecta tu repositorio de GitHub y selecciona el proyecto.
3.  Configura los detalles del Web Service:
    *   **Name**: `ehr-api-prod`
    *   **Region**: La misma de tu base de datos (clave para evitar latencia).
    *   **Root Directory**: `api` (Esto le indica a Render que busque el código del backend en esa subcarpeta).
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` (Instala dependencias, genera el cliente de Prisma, ejecuta las migraciones en la base de datos PostgreSQL de la nube y compila el código TypeScript a JavaScript en la carpeta `dist/`).
    *   **Start Command**: `npm start` (Ejecuta `node dist/index.js`).
4.  Despliega la sección **Environment Variables** (Variables de Entorno) y agrega las variables que definimos en tu `.env` de desarrollo:
    *   `DATABASE_URL` = *(Pega aquí la URL interna de la base de datos de Render obtenida en el Paso 2)*
    *   `NODE_ENV` = `production`
    *   `JWT_SECRET` = *(Genera una cadena aleatoria larga y segura)*
    *   `JWT_REFRESH_SECRET` = *(Otra cadena aleatoria larga y segura)*
    *   `PORT` = `10000` (Render asigna automáticamente puertos, pero puedes dejarlo por defecto)
5.  En la pestaña **Advanced**, no es necesario configurar un Build Trigger manual adicional, ya que nuestro **Build Command** unificado se encargará de ejecutar automáticamente tanto la generación del cliente de Prisma como las migraciones de la base de datos (`prisma migrate deploy`) antes de que el servidor web empiece a recibir peticiones de producción.
6.  Haz clic en **Create Web Service**. ¡Render empezará a compilar y levantar tu servidor! Copia la URL pública generada (ej. `https://ehr-api-prod.onrender.com`).

---

### Paso 4: Desplegar el Frontend Web (ut-care) en Vercel
**Vercel** es la mejor plataforma para hospedar frontends hechos con Vite o React por su velocidad de carga (CDN) y facilidad de uso.

1.  Crea una cuenta en **[Vercel.com](https://vercel.com/)** usando tu cuenta de GitHub.
2.  Haz clic en **Add New** ──> **Project**.
3.  Importa tu repositorio del proyecto.
4.  Configura el proyecto:
    *   **Project Name**: `ut-care-frontend`
    *   **Framework Preset**: `Vite` (Vercel lo autodetectará).
    *   **Root Directory**: `ut-care` (Indica que el código del cliente web está ahí).
5.  Despliega el menú **Environment Variables** y agrega la variable clave para que el frontend sepa a qué servidor hacer las peticiones HTTP:
    *   `VITE_API_URL` = `https://ehr-api-prod.onrender.com/api` *(La URL pública de tu API de Render)*
    *   `VITE_WS_URL` = `wss://ehr-api-prod.onrender.com` *(Conexión de WebSockets segura)*
6.  Haz clic en **Deploy**. Vercel compilará tu React SPA y te dará un dominio público seguro (con HTTPS).

---

## 🔒 4. Buenas Prácticas de Seguridad en Producción

1.  **Nunca subas archivos `.env` a GitHub**: Estos archivos contienen contraseñas de bases de datos y llaves secretas. El `.gitignore` del proyecto ya los excluye. Las variables de entorno siempre se configuran en los portales web de Render o Vercel de forma protegida.
2.  **Usa HTTPS siempre**: Render y Vercel fuerzan el uso de certificados SSL (HTTPS). Esto encripta la comunicación entre el usuario y tus servidores, algo obligatorio para el cumplimiento de normativas de salud como **HIPAA**.
3.  **Configura adecuadamente los CORS**: En tu API de Render, ajusta la variable de entorno `CORS_ORIGIN` con la URL de producción que te dio Vercel (ej. `https://ut-care-frontend.vercel.app`) para evitar que scripts externos hagan solicitudes no autorizadas a tu servidor.
