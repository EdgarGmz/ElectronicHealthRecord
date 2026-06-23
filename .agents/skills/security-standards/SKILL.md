---
name: security-standards
description: Directrices de seguridad en EHR: Control de acceso basado en roles (RBAC), sanitización de payloads (Joi), protección de datos sensibles (PHI) y bitácora segura.
---

# Estándares de Seguridad y Privacidad (security-standards) 🔒

Esta habilidad le enseña al agente cómo garantizar la confidencialidad, integridad y disponibilidad del sistema EHR, protegiendo la información de salud protegida (PHI) y asegurando el control de acceso estricto.

## 👥 Control de Acceso Basado en Roles (RBAC)
El acceso a recursos y endpoints debe restringirse rigurosamente según el rol del usuario autenticado:

### 1. Protección de Endpoints (Backend)
- **Middleware `authorizeRoles`:** Todas las rutas expuestas en `/api/src/routes` que manejen datos de pacientes, consultas o configuración deben usar el middleware de validación de roles de forma obligatoria.
  * *Ejemplo:* `router.get('/audit-logs', authenticateJWT, authorizeRoles('admin', 'coordinador_enfermeria'), ...);`
- **Jerarquías de Roles:** Respetar los grupos de roles declarados en `roles.ts` y limitar el acceso al mínimo privilegio necesario.

### 2. Validación en Frontend
- **Protección de Navegación:** Las vistas en `/ut-care` deben validar los permisos del usuario decodificando el token JWT mediante los helpers `canAccessPath` y `canAccessExpedient` antes de permitir el renderizado de la ruta.

---

## 📝 Validación de Payloads y Prevención de Inyecciones
- **Validación Estricta con Joi:** Todo payload de entrada (parámetros de consulta, cuerpo de peticiones `POST`/`PUT`) debe ser validado y sanitizado mediante un middleware de Joi para evitar la inyección de parámetros no deseados o de tipos incorrectos.
- **SQL Injection (SQLi):** Evitar el uso de consultas crudas (`prisma.$queryRaw`) a menos que sea estrictamente necesario. En caso de usarse, es obligatorio emplear plantillas parametrizadas de Prisma para neutralizar inyecciones SQL.
- **Cross-Site Scripting (XSS):** Sanitizar cualquier dato ingresado por el usuario antes de renderizarlo directamente en el DOM del cliente web.

---

## 🤫 Privacidad de Datos Sensibles (PHI)
- **Datos de Salud Protegidos:** La información médica (diagnósticos, notas de terapia, signos vitales, expedientes) es altamente confidencial.
- **Sanitización en Bitácoras (Audit Logs):**
  - **REGLA CRÍTICA:** Al registrar operaciones en la tabla de auditoría (`audit_logs`), los campos de contraseñas, tokens de recuperación, llaves de sesión o secretos MFA **deben ser completamente omitidos o enmascarados** en los JSON de `oldValues` y `newValues`. Nunca almacenar credenciales legibles o hashes de contraseñas en los registros de auditoría.
- **Cifrado:** Las contraseñas se almacenan únicamente como hashes criptográficos generados mediante **bcrypt** (`SALT_ROUNDS = 10`).
