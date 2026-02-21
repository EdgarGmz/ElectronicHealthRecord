# 🚀 Quick Start - API Documentation

Esta guía te ayudará a visualizar y probar la documentación de la API en menos de 5 minutos.

## 📋 Tabla de Contenidos

- [Opción 1: Swagger Editor Online (Más Rápido)](#opción-1-swagger-editor-online-más-rápido)
- [Opción 2: ReDoc (Mejor para Lectura)](#opción-2-redoc-mejor-para-lectura)
- [Opción 3: Swagger UI Local (Para Desarrollo)](#opción-3-swagger-ui-local-para-desarrollo)
- [Opción 4: Postman (Para Testing)](#opción-4-postman-para-testing)
- [Opción 5: VS Code (Para Edición)](#opción-5-vs-code-para-edición)

---

## Opción 1: Swagger Editor Online (Más Rápido)

**⏱️ Tiempo: 1 minuto**

1. Ve a [https://editor.swagger.io/](https://editor.swagger.io/)
2. Click en **File** → **Import file**
3. Selecciona el archivo `api/openapi.yaml`
4. ✅ ¡Listo! Puedes ver y editar la documentación

**Ventajas:**
- ✅ No requiere instalación
- ✅ Validación en tiempo real
- ✅ Generación de código cliente
- ✅ Exportar a diferentes formatos

---

## Opción 2: ReDoc (Mejor para Lectura)

**⏱️ Tiempo: 2 minutos**

### Instalación Global (Una sola vez)

```bash
npm install -g redoc-cli
```

### Uso

```bash
# Navegar a la carpeta api
cd api

# Servir la documentación
redoc-cli serve openapi.yaml --watch

# O usar el script del package.json
npm run docs:serve
```

Abre en tu navegador: **http://localhost:8080**

**Ventajas:**
- ✅ Interfaz hermosa y profesional
- ✅ Excelente para lectura
- ✅ Búsqueda integrada
- ✅ Responsive design
- ✅ No requiere servidor backend

**Desventaja:**
- ❌ No permite probar endpoints (solo lectura)

---

## Opción 3: Swagger UI Local (Para Desarrollo)

**⏱️ Tiempo: 5 minutos**

### Paso 1: Instalar Dependencias

```bash
cd api
npm install
```

### Paso 2: Crear Servidor Simple

Crea el archivo `api/swagger-server.js`:

```javascript
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const swaggerDocument = YAML.load('./openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`📚 Swagger UI disponible en: http://localhost:${PORT}/api-docs`);
});
```

### Paso 3: Ejecutar

```bash
node swagger-server.js
```

Abre en tu navegador: **http://localhost:3000/api-docs**

**Ventajas:**
- ✅ Permite probar endpoints interactivamente
- ✅ Autocompletado de parámetros
- ✅ Soporte para autenticación JWT
- ✅ Ideal para desarrollo

---

## Opción 4: Postman (Para Testing)

**⏱️ Tiempo: 2 minutos**

### Método 1: Importar OpenAPI

1. Abre Postman
2. Click en **Import**
3. Selecciona `api/openapi.yaml`
4. ✅ Postman generará automáticamente la colección completa

### Método 2: Importar Colección Pre-configurada

1. Abre Postman
2. Click en **Import**
3. Selecciona `api/postman-collection.json`
4. ✅ Colección lista para usar

### Configurar Variables

En Postman, configura las variables de colección:

```
baseUrl: http://localhost:5000/api
accessToken: (se llenará automáticamente después del login)
```

### Probar la API

1. Ejecuta el request **Authentication → Login**
2. El `accessToken` se guardará automáticamente
3. Prueba otros endpoints (ya incluyen el token)

**Ventajas:**
- ✅ Excelente para testing manual
- ✅ Guarda historial de requests
- ✅ Variables de entorno
- ✅ Pruebas automatizadas
- ✅ Compartir colecciones con el equipo

---

## Opción 5: VS Code (Para Edición)

**⏱️ Tiempo: 3 minutos**

### Instalar Extensiones

1. Abre VS Code
2. Instala estas extensiones:
   - **OpenAPI (Swagger) Editor** by 42Crunch
   - **Swagger Viewer** by Arjun G
   - **YAML** by Red Hat

### Uso

1. Abre `api/openapi.yaml` en VS Code
2. Click derecho → **Preview Swagger**
3. ✅ Vista previa interactiva dentro de VS Code

**Ventajas:**
- ✅ Edición con autocompletado
- ✅ Validación en tiempo real
- ✅ Navegación de referencias
- ✅ No sale del editor

---

## 📊 Comparación de Opciones

| Opción | Tiempo Setup | Interactivo | Offline | Mejor Para |
|--------|-------------|-------------|---------|------------|
| **Swagger Editor Online** | 1 min | ❌ | ❌ | Vista rápida |
| **ReDoc** | 2 min | ❌ | ✅ | Documentación profesional |
| **Swagger UI Local** | 5 min | ✅ | ✅ | Desarrollo y testing |
| **Postman** | 2 min | ✅ | ✅ | Testing completo |
| **VS Code** | 3 min | ✅ | ✅ | Edición de specs |

---

## 🎯 Recomendaciones

### Para Desarrolladores Frontend
👉 Usa **Postman** para entender y probar endpoints

### Para Desarrolladores Backend
👉 Usa **Swagger UI Local** durante el desarrollo

### Para QA/Testing
👉 Usa **Postman** con la colección pre-configurada

### Para Product Managers
👉 Usa **ReDoc** para revisar la documentación

### Para Editar la Especificación
👉 Usa **VS Code** con las extensiones

---

## 🔧 Troubleshooting

### Error: "Cannot find module 'swagger-ui-express'"

```bash
cd api
npm install
```

### Error: "YAML parse error"

Valida el archivo:
```bash
npm install -g @apidevtools/swagger-cli
swagger-cli validate api/openapi.yaml
```

### Puerto ya en uso

Cambia el puerto en el comando:
```bash
# ReDoc
redoc-cli serve openapi.yaml -p 8081

# Swagger UI
# Edita PORT en swagger-server.js
```

---

## 📚 Recursos Adicionales

- 📄 **[Documentación Completa](./API_DOCUMENTATION.md)** - Guía detallada de la API
- 📄 **[Especificación OpenAPI](./openapi.yaml)** - Definición completa
- 📦 **[Colección Postman](./postman-collection.json)** - Tests pre-configurados
- 🏠 **[README Principal](../README.md)** - Información del proyecto
- 🛠️ **[Stack Tecnológico](./README.md)** - Tecnologías del backend

---

## 💡 Tips Útiles

### Generar Cliente SDK Automáticamente

```bash
# Instalar OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generar cliente TypeScript
openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g typescript-axios \
  -o Kiosko/src/services/api-client

# Generar cliente Python
openapi-generator-cli generate \
  -i api/openapi.yaml \
  -g python \
  -o python-client
```

### Exportar a diferentes formatos

Desde Swagger Editor:
- JSON
- HTML
- PDF (via herramientas de terceros)

### Compartir con el Equipo

1. Sube el archivo a un servidor web
2. Usa servicios como:
   - [Stoplight](https://stoplight.io/)
   - [SwaggerHub](https://swagger.io/tools/swaggerhub/)
   - GitHub Pages con ReDoc

---

## ✅ Next Steps

Una vez que hayas explorado la documentación:

1. **Frontend**: Genera el cliente SDK para tu aplicación
2. **Backend**: Implementa los endpoints según la especificación
3. **Testing**: Importa la colección en Postman y crea tests
4. **QA**: Revisa la especificación para casos de prueba
5. **Deployment**: Configura Swagger UI en tu servidor de desarrollo

---

## 🤝 Contribuir a la Documentación

Si encuentras errores o mejoras:

1. Edita `api/openapi.yaml`
2. Valida: `swagger-cli validate openapi.yaml`
3. Commit y push
4. Abre un Pull Request

---

**¿Necesitas ayuda?**

- 📧 Email: support@ehr-system.com
- 💬 GitHub Issues: [Issues](https://github.com/EdgarGmz/ElectronicHealthRecord/issues)
- 📖 Docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

<div align="center">

**¡Feliz desarrollo! 🚀**

</div>
