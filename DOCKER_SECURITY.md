# 🔒 Docker Security Checklist

Este documento proporciona una lista de verificación de seguridad para el despliegue de Docker en producción.

## ✅ Checklist de Seguridad Pre-Producción

### Configuración de Variables de Entorno

- [ ] **Cambiar JWT_SECRET** - Usar una cadena aleatoria fuerte (mínimo 64 caracteres)
- [ ] **Cambiar JWT_REFRESH_SECRET** - Usar una cadena aleatoria diferente a JWT_SECRET
- [ ] **Cambiar credenciales de PostgreSQL** - No usar `admin/admin1234` en producción
- [ ] **Configurar SMTP real** - Actualizar SMTP_USER, SMTP_PASS, SMTP_HOST con credenciales válidas
- [ ] **Configurar CORS_ORIGIN** - Cambiar a la URL real del frontend
- [ ] **Revisar límites de rate limiting** - Ajustar según el tráfico esperado

### Gestión de Secretos

```bash
# Generar secretos seguros
# Para JWT_SECRET y JWT_REFRESH_SECRET:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# O con OpenSSL:
openssl rand -hex 64
```

- [ ] **NO** commitear archivos .env o .env.docker al repositorio
- [ ] Usar variables de entorno del sistema o servicios de gestión de secretos (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] Rotar secretos periódicamente (cada 90 días recomendado)

### Configuración de Base de Datos

- [ ] Usar contraseñas fuertes para PostgreSQL (mínimo 16 caracteres, con mayúsculas, minúsculas, números y símbolos)
- [ ] NO exponer el puerto 5432 en docker-compose para producción (remover el mapeo de puertos)
- [ ] Habilitar SSL/TLS para conexiones a la base de datos
- [ ] Configurar backups automáticos diarios
- [ ] Implementar política de retención de backups

### Red y Firewall

- [ ] Usar redes internas de Docker (no exponer servicios innecesariamente)
- [ ] Configurar firewall para permitir solo tráficos necesarios
- [ ] Implementar reverse proxy (Nginx, Traefik) con SSL/TLS
- [ ] Configurar certificados SSL válidos (Let's Encrypt recomendado)
- [ ] Habilitar HTTPS y redirigir HTTP a HTTPS

### Logs y Monitoreo

- [ ] Configurar rotación de logs (evitar que los logs llenen el disco)
- [ ] Implementar monitoreo de recursos (CPU, memoria, disco)
- [ ] Configurar alertas para eventos críticos
- [ ] Implementar logging centralizado (ELK Stack, Grafana Loki)
- [ ] NO loggear información sensible (contraseñas, tokens, datos médicos)

### Actualizaciones y Parches

- [ ] Mantener imágenes Docker actualizadas
- [ ] Revisar y aplicar parches de seguridad regularmente
- [ ] Monitorear CVEs de dependencias (usar `npm audit`)
- [ ] Actualizar Node.js a versiones con soporte LTS

### Control de Acceso

- [ ] Implementar autenticación fuerte para acceso a servidores
- [ ] Usar claves SSH en lugar de contraseñas
- [ ] Implementar MFA (autenticación de dos factores) donde sea posible
- [ ] Limitar acceso SSH a IPs específicas
- [ ] Revisar y auditar permisos de usuarios regularmente

### Cumplimiento HIPAA

- [ ] Encriptar datos en reposo (base de datos, backups)
- [ ] Encriptar datos en tránsito (SSL/TLS)
- [ ] Implementar audit logs completos
- [ ] Configurar retención de logs según normativa (mínimo 6 años)
- [ ] Implementar controles de acceso basados en roles (RBAC)
- [ ] Realizar auditorías de seguridad periódicas
- [ ] Implementar procedimientos de respuesta a incidentes

## 🛡️ Configuración Recomendada para Producción

### docker-compose.prod.yml

```yaml
services:
  api:
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}  # Desde variable de entorno o secrets manager
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      DATABASE_URL: ${DATABASE_URL}
    restart: always
    # NO mapear puertos directamente en producción
    # Usar reverse proxy (Nginx)
    
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    # NO exponer puerto 5432 externamente
    # ports:
    #   - "5432:5432"  # COMENTAR ESTO EN PRODUCCIÓN
    restart: always
    
  nginx:  # Agregar reverse proxy
    image: nginx:alpine
    ports:
      - "443:443"  # HTTPS
      - "80:80"    # HTTP (redirigir a HTTPS)
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
```

### Ejemplo de nginx.conf

```nginx
server {
    listen 80;
    server_name api.ehr-system.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.ehr-system.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://api:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 Auditoría y Validación

### Comandos útiles para auditoría

```bash
# Revisar vulnerabilidades en dependencias
cd api && npm audit

# Escanear imagen Docker por vulnerabilidades
docker scan ehr-api

# Ver logs de contenedores
docker-compose logs -f api

# Inspeccionar configuración de red
docker network inspect ehr-network

# Verificar volúmenes y su contenido
docker volume inspect postgres_data
```

## 📞 Recursos Adicionales

- [OWASP Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)

## 🚨 Respuesta a Incidentes

En caso de detectar una brecha de seguridad:

1. **Aislar** el sistema afectado inmediatamente
2. **Documentar** el incidente con detalles
3. **Notificar** al equipo de seguridad y stakeholders
4. **Investigar** el alcance del incidente
5. **Remediar** la vulnerabilidad
6. **Revisar** y mejorar controles de seguridad

---

**Última actualización**: 2026-02-17

**Nota**: Este checklist debe revisarse y actualizarse regularmente según las mejores prácticas de seguridad y requisitos regulatorios.
