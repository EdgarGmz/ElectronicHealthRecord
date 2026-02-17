# 🐳 Guía de Docker para EHR System

Esta guía explica cómo usar Docker y Docker Compose para ejecutar el sistema de Registro de Salud Electrónico (EHR) en un entorno containerizado.

## 📋 Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Inicio Rápido](#inicio-rápido)
- [Arquitectura de Contenedores](#arquitectura-de-contenedores)
- [Configuración](#configuración)
- [Comandos Útiles](#comandos-útiles)
- [Desarrollo con Docker](#desarrollo-con-docker)
- [Troubleshooting](#troubleshooting)
- [Producción](#producción)

## 🔧 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Docker Desktop** v20.10+ ([Descargar](https://www.docker.com/products/docker-desktop))
  - Windows: Docker Desktop for Windows
  - macOS: Docker Desktop for Mac
  - Linux: Docker Engine + Docker Compose
- **Git** v2.40+ ([Descargar](https://git-scm.com/))

Para verificar la instalación:

```bash
docker --version
docker-compose --version
```

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/EdgarGmz/ElectronicHealthRecord.git
cd ElectronicHealthRecord
```

### 2. Levantar el Entorno Completo

**Opción A: Usar el script de inicio (Recomendado)**

```bash
./start-docker.sh
```

**Opción B: Comando manual**

```bash
docker-compose up --build
```

Este comando:
- ✅ Construye la imagen Docker de la API
- ✅ Descarga las imágenes de PostgreSQL y Redis
- ✅ Crea la base de datos
- ✅ Ejecuta las migraciones de Prisma automáticamente
- ✅ Inicia la API en el puerto 5000

### 3. Verificar que Todo Funciona

Una vez que los contenedores estén corriendo:

- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

Verifica el estado de los contenedores:

```bash
docker-compose ps
```

Deberías ver algo como:

```
NAME                IMAGE                     STATUS         PORTS
ehr-api             electronichealthrecord-api   Up          0.0.0.0:5000->5000/tcp
ehr-postgres        postgres:15-alpine           Up (healthy) 0.0.0.0:5432->5432/tcp
ehr-redis           redis:7-alpine               Up (healthy) 0.0.0.0:6379->6379/tcp
```

### 4. Detener los Servicios

Para detener todos los contenedores:

```bash
docker-compose down
```

Para detener y eliminar también los volúmenes (⚠️ esto borrará todos los datos):

```bash
docker-compose down -v
```

## 🏗️ Arquitectura de Contenedores

El proyecto utiliza tres contenedores principales:

```
┌─────────────────────────────────────────────────┐
│                   Docker Host                   │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────┐ │
│  │   ehr-api    │  │ ehr-postgres │  │ redis │ │
│  │              │  │              │  │       │ │
│  │  Node.js 18  │──│ PostgreSQL   │  │ Cache │ │
│  │  Express API │  │   15-alpine  │  │       │ │
│  │  Port: 5000  │  │  Port: 5432  │  │ 6379  │ │
│  └──────────────┘  └──────────────┘  └───────┘ │
│                                                 │
│  Volumes:                                       │
│  • postgres_data (base de datos)               │
│  • uploads_data (archivos subidos)             │
│  • logs_data (logs de la aplicación)           │
│  • redis_data (cache persistente)              │
└─────────────────────────────────────────────────┘
```

### Servicios

#### 1. **api** - Servicio de Backend
- **Imagen**: Build personalizado desde `./api/Dockerfile`
- **Puerto**: 5000
- **Dependencias**: PostgreSQL (db), Redis
- **Health Check**: Automático vía depends_on
- **Comando de inicio**: Ejecuta migraciones y luego inicia el servidor

#### 2. **db** - Base de Datos PostgreSQL
- **Imagen**: postgres:15-alpine
- **Puerto**: 5432
- **Usuario**: admin
- **Contraseña**: admin1234 (cambiar en producción)
- **Base de datos**: ehr_db
- **Health Check**: Verifica conexión cada 10s

#### 3. **redis** - Cache (Opcional)
- **Imagen**: redis:7-alpine
- **Puerto**: 6379
- **Health Check**: Ping cada 10s

## ⚙️ Configuración

### Variables de Entorno

Las variables de entorno se configuran en el archivo `docker-compose.yml`. Para personalizarlas:

#### Opción 1: Editar docker-compose.yml (Simple)

Edita directamente las variables en la sección `environment` del servicio `api`:

```yaml
api:
  environment:
    JWT_SECRET: tu-secreto-muy-seguro-aqui
    JWT_REFRESH_SECRET: otro-secreto-seguro
    SMTP_USER: tu-email@institucional.com
    SMTP_PASS: tu-password-app
```

#### Opción 2: Usar archivo .env (Recomendado para producción)

Crea un archivo `.env` en la raíz del proyecto:

```bash
# .env
JWT_SECRET=tu-secreto-muy-seguro-aqui
JWT_REFRESH_SECRET=otro-secreto-seguro
POSTGRES_PASSWORD=password-super-seguro
SMTP_USER=tu-email@institucional.com
SMTP_PASS=tu-password-app
```

Luego modifica el `docker-compose.yml` para usar variables:

```yaml
api:
  environment:
    JWT_SECRET: ${JWT_SECRET}
    JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
```

### Cambiar Credenciales de Base de Datos

⚠️ **Importante**: Las credenciales por defecto son para desarrollo. Cámbialas para producción.

1. Edita `docker-compose.yml`:

```yaml
db:
  environment:
    POSTGRES_USER: usuario_seguro
    POSTGRES_PASSWORD: password_muy_seguro_123
    POSTGRES_DB: ehr_db

api:
  environment:
    DATABASE_URL: postgresql://usuario_seguro:password_muy_seguro_123@db:5432/ehr_db?schema=public
```

2. Reconstruye los contenedores:

```bash
docker-compose down -v
docker-compose up --build
```

## 📝 Comandos Útiles

### Gestión de Contenedores

```bash
# Iniciar servicios en background (detached mode)
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api
docker-compose logs -f db

# Reiniciar un servicio específico
docker-compose restart api

# Detener servicios
docker-compose stop

# Eliminar contenedores, redes (mantiene volúmenes)
docker-compose down

# Eliminar todo incluyendo volúmenes
docker-compose down -v
```

### Gestión de Base de Datos

```bash
# Ejecutar comandos Prisma dentro del contenedor
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma generate
docker-compose exec api npx prisma studio

# Conectarse a PostgreSQL directamente
docker-compose exec db psql -U admin -d ehr_db

# Hacer backup de la base de datos
docker-compose exec db pg_dump -U admin ehr_db > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U admin ehr_db < backup.sql
```

### Ejecutar Seeds

```bash
# Ejecutar seeds de datos de prueba
docker-compose exec api npm run prisma:seed
```

### Debugging

```bash
# Entrar al contenedor de la API (shell interactivo)
docker-compose exec api sh

# Ver variables de entorno del contenedor
docker-compose exec api env

# Inspeccionar el contenedor
docker inspect ehr-api

# Ver estadísticas de recursos (CPU, memoria)
docker stats
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune

# Eliminar volúmenes sin usar
docker volume prune

# Limpieza completa del sistema Docker
docker system prune -a --volumes
```

## 💻 Desarrollo con Docker

### Modo Desarrollo con Hot-Reload

Para desarrollo con hot-reload, puedes crear un `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
      target: builder  # Use builder stage
    volumes:
      - ./api/src:/app/src
      - ./api/prisma:/app/prisma
    command: npm run dev
    environment:
      NODE_ENV: development
```

Ejecuta con:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Ejecutar Tests

```bash
# Tests unitarios
docker-compose exec api npm test

# Tests con cobertura
docker-compose exec api npm run test:coverage

# Tests en modo watch
docker-compose exec api npm run test:watch
```

### Rebuild de la Imagen

Si cambias dependencias o el Dockerfile:

```bash
# Rebuild solo el servicio API
docker-compose build api

# Rebuild y restart
docker-compose up -d --build api
```

## 🔍 Troubleshooting

### Problema: "Port 5000 is already in use"

**Solución**: Detén el proceso usando el puerto o cambia el puerto en `docker-compose.yml`:

```yaml
api:
  ports:
    - "5001:5000"  # Mapea puerto 5001 del host al 5000 del contenedor
```

### Problema: "Database connection failed"

**Soluciones**:

1. Verifica que el contenedor de PostgreSQL esté healthy:
   ```bash
   docker-compose ps
   ```

2. Revisa los logs de la base de datos:
   ```bash
   docker-compose logs db
   ```

3. Reinicia el servicio de base de datos:
   ```bash
   docker-compose restart db
   ```

### Problema: "Prisma migrations failed"

**Solución**: Ejecuta las migraciones manualmente:

```bash
docker-compose exec api npx prisma migrate deploy
```

Si persiste, resetea la base de datos (⚠️ perderás todos los datos):

```bash
docker-compose down -v
docker-compose up --build
```

### Problema: "No space left on device"

**Solución**: Limpia imágenes y volúmenes sin usar:

```bash
docker system prune -a --volumes
```

### Problema: "Container keeps restarting"

**Solución**: Revisa los logs para identificar el error:

```bash
docker-compose logs api
```

Comandos útiles para debug:

```bash
# Ver últimas líneas del log
docker-compose logs --tail=50 api

# Ver logs en tiempo real
docker-compose logs -f api
```

## 🚀 Producción

### Checklist de Producción

Antes de desplegar a producción:

- [ ] Cambiar credenciales de base de datos
- [ ] Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET`
- [ ] Configurar `SMTP_*` variables con servidor de email real
- [ ] Actualizar `CORS_ORIGIN` con el dominio del frontend
- [ ] Revisar y ajustar `RATE_LIMIT_*` según necesidades
- [ ] Configurar backups automáticos de base de datos
- [ ] Configurar SSL/TLS (usar un reverse proxy como Nginx)
- [ ] Revisar logs y configurar rotación de logs
- [ ] Configurar monitoring (Prometheus, Grafana)
- [ ] Documentar URLs y credenciales de producción (en lugar seguro)

📖 **Ver guía completa de seguridad**: [DOCKER_SECURITY.md](./DOCKER_SECURITY.md)

### Variables de Entorno de Producción

Crea un archivo `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  api:
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}  # Desde .env
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      DATABASE_URL: ${DATABASE_URL}
    restart: always
    
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    restart: always
```

Ejecuta con:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Backup y Restore

**Backup automático con cron**:

```bash
# Crear script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T db pg_dump -U admin ehr_db > "${BACKUP_DIR}/ehr_backup_${DATE}.sql"
EOF

chmod +x backup.sh

# Agregar a crontab (backup diario a las 2 AM)
0 2 * * * /ruta/al/backup.sh
```

### Monitoreo

Agregar servicio de monitoreo en `docker-compose.yml`:

```yaml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

## 📚 Recursos Adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prisma con Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
- [Node.js con Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa esta documentación
2. Consulta los logs: `docker-compose logs -f`
3. Abre un issue en GitHub con:
   - Descripción del problema
   - Logs relevantes
   - Versión de Docker
   - Sistema operativo

---

**¡Feliz desarrollo con Docker!** 🐳
