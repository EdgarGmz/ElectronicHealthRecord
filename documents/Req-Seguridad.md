# 🔒 REQUERIMIENTOS DE SEGURIDAD

## 📝 DESCRIPCIÓN

Este documento establece los requerimientos formales de seguridad del sistema Electronic Health Record (EHR), abordando los principios fundamentales de:

- **Confidencialidad** - Protección de información sensible contra accesos no autorizados
- **Integridad** - Garantía de que los datos no sean modificados de manera no autorizada
- **Disponibilidad** - Aseguramiento de que el sistema esté operativo cuando se requiera
- **Autenticación** - Verificación de la identidad de usuarios y sistemas
- **Autorización** - Control de permisos y accesos basado en roles
- **Auditoría** - Registro y trazabilidad de acciones críticas del sistema

Este documento se alinea con los estándares de cumplimiento **HIPAA** (Health Insurance Portability and Accountability Act) y las mejores prácticas de seguridad en sistemas de información de salud.

---

## 🎯 OBJETIVO

Formalizar los requerimientos de seguridad del sistema EHR para:
1. Garantizar la protección de información médica y personal sensible
2. Cumplir con normativas de protección de datos (HIPAA, GDPR aplicable)
3. Establecer controles medibles y trazables
4. Proporcionar una base sólida para la implementación técnica
5. Facilitar auditorías de seguridad y cumplimiento normativo

---

## 📌 ALCANCE

Este documento cubre todos los aspectos de seguridad del sistema EHR, incluyendo:
- Backend API (Node.js/Express/TypeScript)
- Frontend (React/Electron)
- Base de datos (MySQL)
- Comunicaciones (HTTPS/TLS)
- Infraestructura y despliegue
- Procesos operativos

---

## 1. 🔐 CONFIDENCIALIDAD

### 1.1 Descripción
La confidencialidad garantiza que la información médica, personal y clínica solo sea accesible por personas y sistemas autorizados, protegiendo la privacidad de los pacientes y cumpliendo con regulaciones de protección de datos.

### 1.2 Requerimientos Específicos

#### REQ-CONF-001: Cifrado de Datos en Reposo
**Descripción:** Todos los datos sensibles almacenados en la base de datos deben estar cifrados.

**Controles:**
- Implementar cifrado AES-256 para campos sensibles:
  - Información personal identificable (PII): nombres completos, direcciones, números de teléfono
  - Información médica protegida (PHI): diagnósticos, notas clínicas, resultados de pruebas
  - Datos financieros: información de seguros, pagos
- Usar cifrado transparente a nivel de base de datos (TDE - Transparent Data Encryption) cuando sea posible
- Las llaves de cifrado deben almacenarse en un sistema de gestión de secretos separado (ej. HashiCorp Vault, AWS KMS)

**Métricas:**
- 100% de campos sensibles identificados deben estar cifrados
- Tiempo de cifrado/descifrado < 100ms por operación
- Rotación de llaves de cifrado cada 90 días

**Implementación actual:** Ver configuración en `api/src/config/database.ts` y uso de librerías de cifrado en `api/src/utils/encryption.ts`

---

#### REQ-CONF-002: Cifrado de Datos en Tránsito
**Descripción:** Todas las comunicaciones entre componentes del sistema deben estar cifradas.

**Controles:**
- Usar exclusivamente HTTPS/TLS 1.3 o superior para todas las comunicaciones API
- Implementar Certificate Pinning en aplicaciones cliente
- Prohibir conexiones HTTP no seguras (redirigir automáticamente a HTTPS)
- Configurar Strong Cipher Suites (mínimo: TLS_AES_256_GCM_SHA384)

**Métricas:**
- 100% de endpoints deben servirse sobre HTTPS
- 0 warnings en análisis SSL Labs (calificación A o superior)
- Renovación automática de certificados TLS antes de 30 días de expiración

**Implementación actual:** Ver configuración de Helmet en `api/src/middlewares/security.ts`

---

#### REQ-CONF-003: Clasificación de Datos
**Descripción:** Los datos deben clasificarse según su nivel de sensibilidad.

**Clasificación:**
1. **Crítico** (Nivel 1): Información PHI, contraseñas, tokens de sesión
2. **Confidencial** (Nivel 2): Información PII, historiales médicos
3. **Interno** (Nivel 3): Datos operativos, reportes agregados
4. **Público** (Nivel 4): Información general del sistema

**Controles:**
- Implementar etiquetado de datos según clasificación
- Aplicar controles de acceso diferenciados por nivel
- Logs de auditoría obligatorios para datos Nivel 1 y 2

**Métricas:**
- 100% de tablas de BD clasificadas
- Políticas de retención definidas por nivel de clasificación

---

#### REQ-CONF-004: Protección de Información en Logs
**Descripción:** Los sistemas de logging no deben registrar información sensible.

**Controles:**
- Implementar enmascaramiento automático de datos sensibles en logs
- No registrar contraseñas, tokens completos, números de tarjetas
- Sanitizar stack traces que puedan contener información sensible
- Logs almacenados con cifrado y acceso restringido

**Métricas:**
- 0 ocurrencias de datos sensibles en logs (escaneo automático)
- Retención de logs: 90 días logs de aplicación, 2 años logs de auditoría

**Implementación actual:** Ver configuración de Winston en `api/src/config/logger.ts`

---

#### REQ-CONF-005: Segregación de Entornos
**Descripción:** Los entornos de desarrollo, pruebas y producción deben estar completamente segregados.

**Controles:**
- Bases de datos separadas por entorno
- Credenciales únicas por entorno (nunca reutilizar)
- Datos de producción NO deben usarse en desarrollo/QA
- Anonimización obligatoria de datos para entornos no productivos

**Métricas:**
- 0 conexiones cruzadas entre entornos
- Auditoría trimestral de accesos a producción

---

### 1.3 Escenarios de Aplicación

**Escenario 1:** Un alumno accede a su expediente médico
- El sistema debe mostrar solo SU información
- Las comunicaciones deben estar cifradas (HTTPS)
- El acceso debe quedar registrado en audit logs

**Escenario 2:** Un psicólogo consulta notas de sesión
- Solo puede ver expedientes de pacientes asignados
- Datos sensibles cifrados en BD son descifrados solo en memoria
- La consulta genera un registro de auditoría con: usuario, timestamp, paciente consultado

**Escenario 3:** Backup de base de datos
- El archivo de backup debe estar cifrado con AES-256
- Almacenamiento en ubicación segura con acceso restringido
- Pruebas de restauración periódicas sin exponer datos

---

## 2. ✅ INTEGRIDAD

### 2.1 Descripción
La integridad garantiza que los datos y el sistema no sean modificados de manera no autorizada o accidental, manteniendo la exactitud y consistencia de la información médica a lo largo de su ciclo de vida.

### 2.2 Requerimientos Específicos

#### REQ-INT-001: Validación de Entrada de Datos
**Descripción:** Todos los datos ingresados al sistema deben ser validados y sanitizados.

**Controles:**
- Implementar validación en múltiples capas: frontend, API, base de datos
- Usar librerías de validación robustas (class-validator, Joi, Zod)
- Aplicar sanitización contra ataques de inyección (SQL, XSS, Command Injection)
- Definir esquemas de validación estrictos para cada endpoint

**Métricas:**
- 100% de endpoints con validación de entrada implementada
- 0 vulnerabilidades de inyección en auditorías de seguridad
- Tasa de rechazo de inputs inválidos < 2% (indicador de UX)

**Implementación actual:** Ver `api/src/middlewares/validation.ts` y uso de class-validator en DTOs

---

#### REQ-INT-002: Control de Versiones de Registros Médicos
**Descripción:** Los cambios en registros médicos deben ser rastreables y reversibles.

**Controles:**
- Implementar versionado de expedientes clínicos
- Nunca eliminar físicamente registros médicos (soft delete)
- Mantener historial completo de modificaciones con:
  - Usuario que realizó el cambio
  - Fecha y hora exacta
  - Valores anteriores y nuevos
  - Razón del cambio (cuando aplique)

**Métricas:**
- 100% de registros médicos con control de versiones
- Capacidad de restaurar cualquier versión histórica
- Auditoría de modificaciones accesible en < 5 segundos

**Implementación actual:** Ver modelo `audit_logs` en schema de BD (PROJECT_STRUCTURE.md líneas 67-77)

---

#### REQ-INT-003: Checksums y Firmas Digitales
**Descripción:** Documentos críticos deben tener mecanismos de verificación de integridad.

**Controles:**
- Generar hash SHA-256 de documentos médicos al momento de creación
- Almacenar checksums para validación posterior
- Implementar firmas digitales para documentos legales (consentimientos, recetas)
- Detectar y alertar sobre modificaciones no autorizadas

**Métricas:**
- 100% de documentos con checksum verificable
- Alertas automáticas ante discrepancia de checksums
- Tiempo de verificación < 1 segundo por documento

---

#### REQ-INT-004: Transacciones Atómicas
**Descripción:** Las operaciones de base de datos deben ser atómicas y consistentes.

**Controles:**
- Usar transacciones de BD para operaciones múltiples relacionadas
- Implementar rollback automático en caso de fallos
- Validar integridad referencial en todas las relaciones de BD
- Usar mecanismos de lock optimista/pesimista según el caso

**Métricas:**
- 0 inconsistencias en integridad referencial
- Rollback exitoso en 100% de transacciones fallidas
- Tiempo de commit de transacciones < 2 segundos

**Implementación actual:** Ver uso de TypeORM transactions en `api/src/services/`

---

#### REQ-INT-005: Protección contra Modificación de Código
**Descripción:** El código en producción debe estar protegido contra alteraciones.

**Controles:**
- Implementar firma de código para aplicaciones Electron
- Verificación de integridad de archivos en cada despliegue
- Monitoreo de cambios no autorizados en archivos de sistema
- Control de versiones estricto (Git) con revisiones obligatorias

**Métricas:**
- 100% de despliegues con verificación de firma
- 0 modificaciones no autorizadas detectadas
- Code review obligatorio: mínimo 1 aprobación por PR

---

### 2.3 Escenarios de Aplicación

**Escenario 1:** Actualización de diagnóstico por psicólogo
- El sistema valida que el formato de diagnóstico (CIE/DSM-5) sea correcto
- Se crea una nueva versión del expediente manteniendo el histórico
- Se genera un audit log con: usuario, timestamp, diagnóstico anterior y nuevo

**Escenario 2:** Receta médica emitida por enfermera
- El sistema valida medicamento contra catálogo autorizado
- Se genera checksum SHA-256 de la receta
- La receta es inmutable una vez emitida (solo anulable, no editable)

**Escenario 3:** Intento de inyección SQL
- Middleware de validación detecta y rechaza el input malicioso
- Se registra el intento en logs de seguridad
- Se incrementa contador de intentos sospechosos del usuario

---

## 3. 🚀 DISPONIBILIDAD

### 3.1 Descripción
La disponibilidad garantiza que el sistema y sus datos estén accesibles y operativos cuando los usuarios autorizados los necesiten, minimizando interrupciones y tiempos de inactividad.

### 3.2 Requerimientos Específicos

#### REQ-DISP-001: Tiempo de Actividad (Uptime)
**Descripción:** El sistema debe mantener un nivel de disponibilidad alto.

**Controles:**
- SLA de disponibilidad: 99.5% (permite ~3.65 horas de downtime/mes)
- Ventanas de mantenimiento programadas fuera de horario laboral
- Notificación a usuarios con 48 horas de anticipación
- Capacidad de degradación graciosa (funciones críticas disponibles aunque fallen módulos secundarios)

**Métricas:**
- Uptime mensual >= 99.5%
- MTTR (Mean Time To Repair) < 2 horas
- MTBF (Mean Time Between Failures) > 720 horas (30 días)

**Implementación actual:** Ver configuración de monitoreo en PROJECT_STRUCTURE.md líneas 439-443

---

#### REQ-DISP-002: Backup y Recuperación
**Descripción:** Los datos deben respaldarse regularmente y ser recuperables.

**Controles:**
- Backups automáticos diarios de base de datos (retención: 30 días)
- Backups semanales (retención: 12 semanas)
- Backups mensuales (retención: 12 meses)
- Almacenamiento en ubicación geográfica diferente (geo-redundancia)
- Pruebas de restauración trimestrales

**Métricas:**
- RPO (Recovery Point Objective) <= 24 horas
- RTO (Recovery Time Objective) <= 4 horas
- 100% de backups verificados como restaurables
- Tiempo de restauración completa < 4 horas

**Implementación actual:** Ver api/README.md líneas 197-209 (Backup Automático)

---

#### REQ-DISP-003: Alta Disponibilidad y Redundancia
**Descripción:** Componentes críticos deben tener redundancia.

**Controles:**
- Despliegue de API en al menos 2 instancias (load balancer)
- Base de datos con replicación maestro-esclavo
- Cache distribuido (Redis) con configuración de cluster
- CDN para archivos estáticos

**Métricas:**
- 0 puntos únicos de falla (SPOF) en componentes críticos
- Failover automático en < 30 segundos
- Health checks cada 30 segundos

---

#### REQ-DISP-004: Protección contra Denegación de Servicio (DoS)
**Descripción:** El sistema debe resistir ataques de denegación de servicio.

**Controles:**
- Rate limiting por IP y por usuario:
  - Autenticación: 5 intentos/15 minutos
  - API general: 100 requests/minuto por usuario
  - Endpoints públicos: 20 requests/minuto por IP
- Protección DDoS a nivel de infraestructura (CloudFlare, AWS Shield)
- Bloqueo automático de IPs maliciosas
- Circuit breakers para proteger servicios downstream

**Métricas:**
- Capacidad de manejar 10x tráfico normal durante 5 minutos
- Latencia de API < 500ms bajo ataque de tráfico
- Tasa de bloqueo de IPs maliciosas > 95%

**Implementación actual:** Ver configuración de rate limiting en `api/src/middlewares/rateLimit.ts`

---

#### REQ-DISP-005: Monitoreo y Alertas
**Descripción:** El sistema debe monitorearse continuamente para detectar problemas.

**Controles:**
- Monitoreo de métricas de infraestructura: CPU, memoria, disco, red
- Monitoreo de aplicación: errores, latencias, throughput
- Alertas automáticas vía email/SMS para incidentes críticos
- Dashboard de estado en tiempo real

**Métricas:**
- Detección de incidentes críticos en < 5 minutos
- Notificación a equipo técnico en < 2 minutos
- Dashboard con disponibilidad del sistema visible 24/7

**Implementación actual:** Ver PROJECT_STRUCTURE.md líneas 439-443 (Monitoreo)

---

### 3.3 Escenarios de Aplicación

**Escenario 1:** Fallo de servidor principal
- Load balancer detecta el fallo en health check
- Redirige automáticamente el tráfico a servidor secundario
- Equipo técnico recibe alerta y procede a reparación
- Usuarios no experimentan interrupción del servicio

**Escenario 2:** Pérdida de datos por error humano
- Administrador elimina accidentalmente registros importantes
- Equipo técnico restaura backup de las últimas 24 horas
- Se recuperan los datos con pérdida máxima de 1 día (RPO)
- Proceso de restauración completo en 3 horas (dentro del RTO)

**Escenario 3:** Ataque DDoS durante horario laboral
- Sistema detecta tráfico anómalo (10,000 requests/segundo)
- Rate limiter bloquea IPs sospechosas automáticamente
- Protección DDoS de infraestructura filtra tráfico malicioso
- Usuarios legítimos continúan operando con latencia ligeramente elevada

---

## 4. 🔑 AUTENTICACIÓN

### 4.1 Descripción
La autenticación verifica la identidad de usuarios y sistemas antes de permitir el acceso, asegurando que solo entidades legítimas puedan interactuar con el sistema.

### 4.2 Requerimientos Específicos

#### REQ-AUTH-001: Autenticación Multifactor (MFA)
**Descripción:** Usuarios con acceso a información sensible deben usar autenticación multifactor.

**Controles:**
- MFA obligatorio para:
  - Psicólogos y personal médico
  - Administradores del sistema
  - Accesos desde ubicaciones/dispositivos no reconocidos
- Métodos soportados:
  - TOTP (Time-based One-Time Password): Google Authenticator, Authy
  - SMS (como respaldo)
  - Email con código de verificación
- Permitir códigos de recuperación (backup codes)

**Métricas:**
- 100% de usuarios con permisos administrativos con MFA activo
- >= 80% de personal médico con MFA activo
- Tiempo de configuración MFA < 3 minutos

**Implementación propuesta:** Integración con librerías como `speakeasy` para TOTP

---

#### REQ-AUTH-002: Gestión de Contraseñas
**Descripción:** Las contraseñas deben cumplir con estándares de seguridad robustos.

**Controles:**
- Requisitos de complejidad:
  - Mínimo 12 caracteres
  - Al menos 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
  - No permitir contraseñas comunes (diccionario de 10,000 contraseñas más usadas)
  - No permitir reutilización de últimas 5 contraseñas
- Hasheo con Bcrypt (work factor >= 12)
- Expiración de contraseñas: 90 días (opcional según política organizacional)
- Bloqueo de cuenta tras 5 intentos fallidos (15 minutos)

**Métricas:**
- 100% de contraseñas hasheadas con Bcrypt
- 0 contraseñas almacenadas en texto plano
- Tasa de cumplimiento de políticas de complejidad: 100%

**Implementación actual:** Ver uso de Bcrypt en `api/src/utils/password.ts`

---

#### REQ-AUTH-003: Tokens de Sesión (JWT)
**Descripción:** Las sesiones deben manejarse con tokens seguros y con tiempo de vida limitado.

**Controles:**
- Usar JWT con firma HMAC SHA-256 o RS256
- Access tokens de corta duración: 15 minutos
- Refresh tokens de larga duración: 7 días
- Refresh token rotation (nuevo refresh token en cada renovación)
- Invalidación de tokens en logout
- Lista negra de tokens revocados (almacenada en Redis)

**Métricas:**
- 100% de tokens con expiración definida
- Tiempo de generación/validación de tokens < 50ms
- 0 tokens sin firma válida aceptados

**Implementación actual:** Ver README.md línea 89 (JWT) y api/README.md líneas 33-41

---

#### REQ-AUTH-004: OAuth2 para Integración con Terceros
**Descripción:** Integraciones externas deben usar protocolos estándar de autenticación.

**Controles:**
- Implementar OAuth2 para autenticación con servicios externos:
  - Google Workspace (para personal administrativo)
  - Servicios de telemedicina integrados
- Scopes granulares para limitar permisos
- Validación de redirect URIs contra whitelist
- PKCE (Proof Key for Code Exchange) para clientes públicos

**Métricas:**
- 100% de integraciones con OAuth2 implementado
- 0 tokens de terceros con permisos excesivos
- Auditoría de permisos OAuth trimestral

**Implementación actual:** Ver README.md línea 89 (OAuth2)

---

#### REQ-AUTH-005: Gestión de Sesiones
**Descripción:** Las sesiones deben manejarse de forma segura.

**Controles:**
- Session timeout por inactividad: 30 minutos
- Máximo de sesiones concurrentes por usuario: 3
- Logout automático al detectar comportamiento anómalo
- Mostrar últimas sesiones activas al usuario
- Permitir cierre remoto de sesiones

**Métricas:**
- 0 sesiones activas después de logout
- Detección de sesiones anómalas en < 5 minutos
- Tasa de session hijacking: 0 (monitoreo continuo)

---

#### REQ-AUTH-006: Autenticación de APIs y Servicios
**Descripción:** Servicios y APIs deben autenticarse entre sí.

**Controles:**
- API keys para servicios externos (con rotación trimestral)
- mTLS (mutual TLS) para servicios internos críticos
- Service accounts con permisos mínimos necesarios
- Monitoreo de uso de credenciales de servicio

**Métricas:**
- 100% de APIs con autenticación implementada
- Rotación de API keys cada 90 días
- 0 credenciales hardcodeadas en código fuente

---

### 4.3 Escenarios de Aplicación

**Escenario 1:** Login de psicólogo desde nueva ubicación
- Usuario ingresa email y contraseña correctos
- Sistema detecta ubicación no reconocida
- Solicita segundo factor (TOTP)
- Usuario ingresa código de Google Authenticator
- Acceso concedido y nueva ubicación registrada

**Escenario 2:** Intento de acceso con credenciales robadas
- Atacante intenta login con credenciales válidas
- Sistema detecta patrón de uso anómalo (horario, IP, dispositivo)
- Bloquea la sesión y solicita verificación adicional
- Notifica al usuario legítimo vía email
- Usuario resetea contraseña y revoca sesiones activas

**Escenario 3:** Expiración de access token durante uso
- Usuario está navegando la aplicación
- Access token expira después de 15 minutos
- Frontend automáticamente usa refresh token para obtener nuevo access token
- Usuario continúa trabajando sin interrupción

---

## 5. 👤 AUTORIZACIÓN

### 5.1 Descripción
La autorización determina qué acciones y recursos están permitidos para cada usuario autenticado, implementando un control de acceso granular basado en roles y permisos.

### 5.2 Requerimientos Específicos

#### REQ-AUTHZ-001: Control de Acceso Basado en Roles (RBAC)
**Descripción:** El sistema debe implementar RBAC con roles claramente definidos.

**Roles del Sistema:**

1. **ALUMNO/PACIENTE**
   - Ver su propio expediente médico (solo información compartida)
   - Agendar/cancelar sus propias citas
   - Ver historial de citas
   - Actualizar información de contacto

2. **PSICOLOGO**
   - Acceso completo a expedientes de pacientes asignados
   - Crear/editar notas de sesiones terapéuticas
   - Asignar diagnósticos (CIE/DSM-5)
   - Generar reportes individuales
   - Agendar citas para sus pacientes

3. **ENFERMERA**
   - Registrar consultas de enfermería
   - Registrar signos vitales y procedimientos
   - Administrar medicamentos según prescripciones
   - Acceso a información médica relevante (no notas psicológicas completas)
   - Gestionar inventario de insumos médicos

4. **COORDINADOR_PSICOLOGIA**
   - Supervisión de todos los expedientes de psicología
   - Acceso de lectura a notas clínicas para supervisión
   - Generar reportes departamentales
   - Reasignar pacientes entre psicólogos
   - Aprobar derivaciones

5. **COORDINADOR_ENFERMERIA**
   - Acceso a reportes estadísticos agregados (sin PII)
   - Gestión de inventario de insumos
   - Supervisión de procedimientos de enfermería
   - Generación de reportes operativos

6. **ADMINISTRADOR_SISTEMA**
   - Gestión de usuarios y roles
   - Configuración del sistema
   - Acceso a logs de auditoría
   - Mantenimiento de catálogos
   - NO acceso a información médica (separación de responsabilidades)

**Controles:**
- Implementar middleware de autorización en cada endpoint
- Verificar permisos antes de cada operación sensible
- Principio de mínimo privilegio: usuarios solo tienen permisos necesarios
- Revisión trimestral de permisos asignados

**Métricas:**
- 100% de endpoints con verificación de autorización
- 0 accesos no autorizados en auditorías
- Tiempo de verificación de permisos < 10ms

**Implementación actual:** Ver Req-NoFuncionales.md líneas 43-49 (Roles y permisos)

---

#### REQ-AUTHZ-002: Segregación de Responsabilidades
**Descripción:** Funciones críticas deben estar separadas para prevenir conflictos de interés.

**Controles:**
- Administradores del sistema NO tienen acceso a datos médicos
- Personal médico NO tiene permisos administrativos del sistema
- Auditor de seguridad con rol read-only separado
- Aprobaciones de múltiples personas para acciones críticas:
  - Eliminación de datos: requiere aprobación de coordinador
  - Cambios de configuración crítica: 2 administradores

**Métricas:**
- 0 usuarios con roles conflictivos asignados
- 100% de acciones críticas con aprobación dual

---

#### REQ-AUTHZ-003: Control de Acceso a Nivel de Registro
**Descripción:** El acceso debe controlarse no solo por función, sino también por registro específico.

**Controles:**
- Psicólogo solo accede a expedientes donde es el profesional asignado
- Alumno solo ve su propio expediente
- Enfermera solo accede a pacientes en su lista de atención activa
- Implementar filtros automáticos en queries de BD según usuario

**Métricas:**
- 100% de queries con filtros de autorización aplicados
- 0 exposiciones de datos de pacientes no asignados

---

#### REQ-AUTHZ-004: Permisos Temporales y Delegación
**Descripción:** El sistema debe permitir delegación temporal de permisos.

**Controles:**
- Coordinador puede delegar acceso temporal a expediente específico
- Delegación con fecha de inicio y fin definidas
- Delegación automáticamente revocada al expirar
- Registro completo de delegaciones en audit log

**Métricas:**
- 100% de delegaciones con tiempo de expiración
- Revocación automática en < 1 minuto después de expiración

---

#### REQ-AUTHZ-005: Break-glass Access (Acceso de Emergencia)
**Descripción:** En situaciones de emergencia médica, personal autorizado debe poder acceder a información crítica.

**Controles:**
- Mecanismo de "break-glass" para acceso de emergencia
- Requiere justificación explícita
- Genera alerta inmediata a coordinadores y seguridad
- Revisión posterior obligatoria de todos los accesos break-glass
- Limitado a personal médico de emergencias

**Métricas:**
- 100% de accesos break-glass auditados en 24 horas
- Tasa de uso apropiado > 95%

---

### 5.3 Escenarios de Aplicación

**Escenario 1:** Psicólogo intenta acceder a expediente no asignado
- Psicólogo A intenta ver expediente de paciente asignado a Psicólogo B
- Sistema verifica permisos en middleware de autorización
- Detecta que no es el profesional asignado
- Retorna error 403 Forbidden
- Registra intento en audit log

**Escenario 2:** Coordinador revisa caso para supervisión
- Coordinador de Psicología selecciona expediente para revisión de caso
- Sistema valida rol de coordinador
- Concede acceso de solo lectura
- Registra auditoría: coordinador X revisó expediente del paciente Y
- Notificación opcional al psicólogo asignado

**Escenario 3:** Emergencia médica requiere acceso inmediato
- Alumno sufre crisis en campus
- Enfermera de emergencias activa break-glass access
- Ingresa justificación: "Crisis de ansiedad - requiere historial psiquiátrico"
- Sistema concede acceso temporal (30 minutos)
- Genera alerta inmediata a coordinadores
- Acceso es revisado posteriormente en comité de ética

---

## 6. 📋 AUDITORÍA

### 6.1 Descripción
La auditoría proporciona trazabilidad completa de acciones realizadas en el sistema, permitiendo investigación de incidentes, cumplimiento normativo y análisis forense cuando sea necesario.

### 6.2 Requerimientos Específicos

#### REQ-AUD-001: Registro de Eventos de Auditoría
**Descripción:** Todas las acciones críticas deben registrarse en logs de auditoría.

**Eventos que DEBEN auditarse:**

1. **Autenticación:**
   - Login exitoso/fallido
   - Logout
   - Cambio de contraseña
   - Activación/desactivación de MFA
   - Accesos break-glass

2. **Acceso a Datos:**
   - Visualización de expediente médico
   - Búsqueda de pacientes
   - Exportación de datos
   - Impresión de documentos médicos

3. **Modificación de Datos:**
   - Creación de expediente
   - Actualización de diagnóstico
   - Creación/edición de notas clínicas
   - Prescripción de medicamentos
   - Eliminación (soft delete) de registros

4. **Administración:**
   - Creación/modificación/eliminación de usuarios
   - Cambios de roles y permisos
   - Cambios de configuración del sistema
   - Delegación de permisos

5. **Operaciones Críticas:**
   - Backup/restore de datos
   - Acceso a logs de sistema
   - Cambios en configuración de seguridad

**Información capturada en cada log:**
- Timestamp preciso (con zona horaria)
- Usuario/servicio que ejecuta la acción
- Tipo de acción (CREATE, READ, UPDATE, DELETE)
- Recurso afectado (tabla, ID de registro)
- Dirección IP origen
- User agent / dispositivo
- Resultado de la operación (éxito/fallo)
- Datos relevantes (antes/después para modificaciones)

**Controles:**
- Logs inmutables (append-only)
- Almacenamiento centralizado y protegido
- Respaldo de logs en ubicación separada
- Logs no pueden ser modificados o eliminados por usuarios (ni administradores)

**Métricas:**
- 100% de acciones críticas con registro de auditoría
- Latencia de escritura de logs < 100ms
- Disponibilidad de logs: 99.9%
- Retención: 7 años (cumplimiento HIPAA)

**Implementación actual:** Ver tabla `audit_logs` en PROJECT_STRUCTURE.md líneas 67-77 y configuración de Winston en README.md línea 93

---

#### REQ-AUD-002: Análisis y Monitoreo de Logs
**Descripción:** Los logs deben ser analizables para detectar anomalías y patrones sospechosos.

**Controles:**
- Implementar búsqueda y filtrado de logs en tiempo real
- Alertas automáticas para eventos sospechosos:
  - Múltiples intentos de login fallidos
  - Acceso a volumen inusual de expedientes
  - Cambios de configuración fuera de horario
  - Patrones de acceso anómalos
- Dashboard de auditoría para coordinadores
- Reportes automáticos semanales de actividad

**Métricas:**
- Detección de anomalías en < 5 minutos
- Búsqueda de logs con resultados en < 10 segundos
- >= 95% de alertas verdaderamente positivas (baja tasa de falsos positivos)

---

#### REQ-AUD-003: Logs Estructurados y Correlacionables
**Descripción:** Los logs deben seguir un formato estructurado que permita análisis automatizado.

**Controles:**
- Usar formato JSON para logs de auditoría
- Implementar correlation IDs para rastrear flujos completos
- Request IDs únicos para cada transacción
- Etiquetado consistente de eventos (taxonomía definida)

**Ejemplo de log estructurado:**
```json
{
  "timestamp": "2026-02-08T10:15:30.123Z",
  "correlation_id": "abc-123-def-456",
  "event_type": "MEDICAL_RECORD_ACCESS",
  "severity": "INFO",
  "user": {
    "id": "user_789",
    "username": "psic.garcia",
    "role": "PSICOLOGO"
  },
  "resource": {
    "type": "medical_record",
    "id": "record_456",
    "patient_id": "patient_123"
  },
  "action": "READ",
  "result": "SUCCESS",
  "metadata": {
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "duration_ms": 145
  }
}
```

**Métricas:**
- 100% de logs en formato estructurado
- Parsing exitoso de 100% de logs

**Implementación actual:** Ver configuración de Winston en `api/src/config/logger.ts`

---

#### REQ-AUD-004: Trazabilidad de Cadena de Custodia
**Descripción:** Para datos críticos, debe existir una cadena de custodia clara.

**Controles:**
- Rastreo completo desde creación hasta archivado/eliminación
- Registro de cada acceso y modificación
- Identificación clara de profesional responsable
- Timestamps precisos con sincronización NTP

**Métricas:**
- Capacidad de reconstruir historial completo de cualquier registro
- Tiempo de generación de reporte de cadena de custodia < 30 segundos

---

#### REQ-AUD-005: Revisión y Cumplimiento
**Descripción:** Los logs deben ser revisados regularmente para cumplimiento y seguridad.

**Controles:**
- Revisión mensual de logs por coordinadores
- Auditoría trimestral por oficial de seguridad/privacidad
- Auditoría anual externa para cumplimiento HIPAA
- Reportes ejecutivos de actividad del sistema

**Métricas:**
- 100% de revisiones programadas completadas a tiempo
- Tiempo de respuesta a solicitudes de auditoría < 48 horas
- Documentación completa de hallazgos y acciones correctivas

---

#### REQ-AUD-006: Protección y Retención de Logs
**Descripción:** Los logs de auditoría deben estar protegidos contra manipulación y disponibles según requerimientos legales.

**Controles:**
- Logs en almacenamiento WORM (Write Once Read Many)
- Cifrado de logs en reposo
- Control de acceso estricto a logs (solo auditores autorizados)
- Retención según normativa:
  - Logs de auditoría: 7 años (HIPAA)
  - Logs de aplicación: 90 días
  - Logs de seguridad: 1 año

**Métricas:**
- 0 modificaciones no autorizadas en logs
- 100% de logs disponibles durante período de retención
- Cumplimiento de retención verificado trimestralmente

---

### 6.3 Escenarios de Aplicación

**Escenario 1:** Investigación de acceso no autorizado
- Coordinador reporta acceso sospechoso a expediente
- Oficial de seguridad consulta logs de auditoría
- Filtra por patient_id y rango de fechas
- Identifica que usuario X accedió el expediente sin justificación
- Correlaciona con otros accesos del mismo usuario
- Genera reporte completo para acción disciplinaria

**Escenario 2:** Cumplimiento de solicitud legal
- Autoridad solicita historial de accesos a expediente específico
- Oficial de privacidad genera reporte de auditoría
- Incluye: quién accedió, cuándo, qué vieron, qué modificaron
- Reporte generado con cadena de custodia verificable
- Entregado dentro del plazo legal requerido

**Escenario 3:** Detección proactiva de amenaza interna
- Sistema detecta patrón anómalo en logs:
  - Psicólogo accedió 50 expedientes en 1 hora (patrón inusual)
- Genera alerta automática a seguridad
- Se revela intento de exfiltración masiva de datos
- Cuenta del usuario es bloqueada automáticamente
- Investigación forense completa usando logs correlacionados

**Escenario 4:** Auditoría de cumplimiento HIPAA
- Auditor externo solicita evidencia de controles de seguridad
- Sistema genera reportes de:
  - 100% de accesos a PHI auditados
  - Revisiones mensuales de accesos completadas
  - 0 brechas de seguridad no reportadas
- Auditor verifica integridad de logs (checksums)
- Certificado de cumplimiento HIPAA otorgado

---

## 7. 📊 MATRIZ DE CUMPLIMIENTO

### 7.1 Mapeo de Requerimientos a HIPAA

| Requerimiento | Regla HIPAA | Control Técnico |
|---------------|-------------|-----------------|
| REQ-CONF-001 | §164.312(a)(2)(iv) - Encryption | AES-256, TDE |
| REQ-CONF-002 | §164.312(e)(1) - Transmission Security | TLS 1.3, HTTPS |
| REQ-INT-001 | §164.308(a)(5)(ii)(B) - Protection from Malicious Software | Input Validation, Sanitization |
| REQ-INT-002 | §164.312(c)(1) - Integrity Controls | Version Control, Checksums |
| REQ-DISP-002 | §164.308(a)(7)(ii)(A) - Data Backup Plan | Automated Backups, Geo-redundancy |
| REQ-AUTH-001 | §164.312(a)(2)(i) - Unique User Identification | MFA, JWT |
| REQ-AUTH-002 | §164.308(a)(5)(ii)(D) - Password Management | Bcrypt, Password Policy |
| REQ-AUTHZ-001 | §164.308(a)(4)(ii)(C) - Access Authorization | RBAC, Middleware |
| REQ-AUD-001 | §164.312(b) - Audit Controls | Structured Logging, audit_logs |
| REQ-AUD-006 | §164.316(b)(2) - Retention | 7-year retention policy |

---

## 8. 🎯 MÉTRICAS Y KPIs DE SEGURIDAD

### 8.1 Indicadores Clave de Rendimiento

| KPI | Objetivo | Medición | Frecuencia |
|-----|----------|----------|------------|
| **Disponibilidad del Sistema** | >= 99.5% | Uptime monitoring | Mensual |
| **Tiempo de Detección de Incidentes** | < 5 minutos | SIEM alerts | Continuo |
| **Tiempo de Respuesta a Incidentes** | < 2 horas | Incident tracking | Por incidente |
| **Cobertura de Cifrado** | 100% datos sensibles | Database audit | Trimestral |
| **Usuarios con MFA Activo** | >= 80% personal médico | User management system | Mensual |
| **Vulnerabilidades Críticas** | 0 | Security scans | Semanal |
| **Intentos de Acceso No Autorizado** | 0 exitosos | Audit logs | Diario |
| **Cumplimiento de Políticas de Contraseña** | 100% | Authentication system | Continuo |
| **Backups Exitosos** | 100% | Backup monitoring | Diario |
| **Tiempo de Restauración (RTO)** | < 4 horas | DR drills | Trimestral |
| **Cobertura de Auditoría** | 100% acciones críticas | Log analysis | Mensual |

### 8.2 Reportes de Seguridad

**Reportes Regulares:**
1. **Semanal:** Dashboard ejecutivo de seguridad
2. **Mensual:** Reporte de incidentes y vulnerabilidades
3. **Trimestral:** Revisión de cumplimiento normativo
4. **Anual:** Auditoría de seguridad completa (interna y externa)

---

## 9. ✅ RESPONSABILIDADES

### 9.1 Matriz RACI

| Actividad | Desarrollo | QA | DevOps | Seg. Info | Legal | Coord. |
|-----------|------------|-----|--------|-----------|-------|---------|
| Implementación de controles | R | C | C | I | I | I |
| Testing de seguridad | C | R | I | C | I | I |
| Gestión de infraestructura | C | I | R | C | I | I |
| Auditorías de seguridad | I | C | C | R | A | I |
| Cumplimiento normativo | I | I | I | R | A | C |
| Revisión de accesos | I | I | I | C | I | R |
| Respuesta a incidentes | C | C | R | R | I | A |

**Leyenda:**
- R: Responsable (quien ejecuta)
- A: Accountable (quien aprueba)
- C: Consultado (proporciona input)
- I: Informado (se mantiene al tanto)

---

## 10. 🔄 PROCESO DE ACTUALIZACIÓN

### 10.1 Revisión de Requerimientos

Este documento debe revisarse y actualizarse:
- **Anualmente:** Revisión completa de todos los requerimientos
- **Semestralmente:** Revisión de métricas y KPIs
- **Trimestralmente:** Revisión de cumplimiento normativo
- **Ad-hoc:** Cuando cambien normativas, tecnologías o riesgos

### 10.2 Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-02-08 | Equipo Seguridad | Versión inicial del documento |

---

## 11. 📚 REFERENCIAS

### 11.1 Normativas y Estándares
- HIPAA (Health Insurance Portability and Accountability Act)
- GDPR (General Data Protection Regulation) - aplicable a usuarios en UE
- ISO/IEC 27001 - Gestión de Seguridad de la Información
- OWASP Top 10 - Vulnerabilidades web más críticas
- NIST Cybersecurity Framework

### 11.2 Documentación Técnica Relacionada
- [README.md - Seguridad y Compliance](../README.md#L428-L445)
- [README.md - Stack Tecnológico Backend](../README.md#L85-L99)
- [api/README.md - Implementación de Seguridad](../api/README.md#L33-L41)
- [Req-NoFuncionales.md - Requisitos no funcionales](./Req-NoFuncionales.md)
- [PROJECT_STRUCTURE.md - Arquitectura y Modelo de BD](../PROJECT_STRUCTURE.md#L67-L93)
- [PROJECT_STRUCTURE.md - Matriz de Riesgos](../PROJECT_STRUCTURE.md#L530-L542)

### 11.3 Recursos de Implementación
- JWT: jsonwebtoken (npm)
- Bcrypt: bcrypt (npm)
- Logging: Winston, Morgan
- Seguridad HTTP: Helmet
- Validación: class-validator, Joi, Zod
- ORM: TypeORM con soporte de cifrado

---

## 12. 📞 CONTACTOS

### 12.1 Equipo de Seguridad
- **Oficial de Seguridad de la Información:** [ciso@ehr-system.com](mailto:ciso@ehr-system.com)
- **Oficial de Privacidad (DPO):** [privacy@ehr-system.com](mailto:privacy@ehr-system.com)
- **Respuesta a Incidentes:** [incident@ehr-system.com](mailto:incident@ehr-system.com)
- **Reporte de Vulnerabilidades:** [security@ehr-system.com](mailto:security@ehr-system.com)

---

## ✅ CRITERIOS DE ACEPTACIÓN

Este documento cumple con los criterios de aceptación establecidos:

- ✅ **Listado documentado de requerimientos:** 32 requerimientos específicos definidos, cubriendo los 6 principios (CIAAA)
- ✅ **Justificación de cada principio:** Cada sección incluye descripción, controles, métricas y escenarios
- ✅ **Ejemplos de aplicación:** Múltiples escenarios de uso real para cada principio
- ✅ **Controles y métricas:** Cada requerimiento incluye controles técnicos específicos y métricas medibles
- ✅ **Trazabilidad:** Referencias cruzadas a implementación actual en código y documentación existente
- ✅ **Alineación normativa:** Mapeo completo con HIPAA y estándares internacionales
- ✅ **Responsabilidades definidas:** Matriz RACI clara para cada actividad
- ✅ **Validación por stakeholders:** Documento estructurado para revisión por QA, backend, legal y coordinadores

---

**Documento finalizado:** 2026-02-08
**Estado:** En revisión para aprobación de stakeholders
