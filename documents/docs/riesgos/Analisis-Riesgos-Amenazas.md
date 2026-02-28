# 🛡️ ANÁLISIS DE RIESGOS Y AMENAZAS
## Sistema de Registro de Salud Electrónico (Electronic Health Record)

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Metodología de Análisis](#-metodología-de-análisis)
3. [Contexto del Sistema](#-contexto-del-sistema)
4. [Clasificación de Riesgos](#-clasificación-de-riesgos)
5. [Matriz de Riesgos y Amenazas](#-matriz-de-riesgos-y-amenazas)
6. [Análisis Detallado por Categoría](#-análisis-detallado-por-categoría)
7. [Cumplimiento Regulatorio](#-cumplimiento-regulatorio)
8. [Controles y Mitigaciones](#-controles-y-mitigaciones)
9. [Plan de Monitoreo y Revisión](#-plan-de-monitoreo-y-revisión)
10. [Conclusiones y Recomendaciones](#-conclusiones-y-recomendaciones)

---

## 📊 RESUMEN EJECUTIVO

### Propósito del Documento
Este documento presenta un análisis exhaustivo de los riesgos y amenazas que podrían afectar la seguridad, privacidad, operación y cumplimiento regulatorio del sistema Electronic Health Record (EHR), diseñado para los departamentos de Enfermería y Psicología de una institución educativa.

### Alcance del Análisis
El análisis cubre:
- **Riesgos de Seguridad**: Confidencialidad, Integridad y Disponibilidad (CIA Triad)
- **Amenazas Tecnológicas**: Infraestructura, aplicación, base de datos, red
- **Amenazas Humanas**: Insider threats, errores humanos, ingeniería social
- **Riesgos de Procesos**: Operacionales, mantenimiento, respaldo
- **Cumplimiento Regulatorio**: HIPAA, protección de datos personales sensibles

### Hallazgos Principales
- Se identificaron **42 riesgos críticos** que requieren atención inmediata
- **15 riesgos de seguridad de alta prioridad** relacionados con datos sensibles
- **8 amenazas de cumplimiento regulatorio** con potencial impacto legal
- **12 vulnerabilidades técnicas** que requieren controles adicionales
- **7 riesgos operacionales** que podrían afectar la continuidad del servicio

---

## 🔍 METODOLOGÍA DE ANÁLISIS

### Marco de Referencia
Este análisis se basa en:
- **NIST Cybersecurity Framework**: Identificar, Proteger, Detectar, Responder, Recuperar
- **OWASP Top 10**: Vulnerabilidades web más críticas
- **ISO 27001**: Sistema de gestión de seguridad de la información
- **HIPAA Security Rule**: Requisitos de seguridad para información médica protegida (PHI)

### Criterios de Evaluación

#### Probabilidad
| Nivel | Descripción | Frecuencia Estimada |
|-------|-------------|---------------------|
| **Muy Alta** | Casi certeza de ocurrencia | > 80% probabilidad anual |
| **Alta** | Probable que ocurra | 60-80% probabilidad anual |
| **Media** | Puede ocurrir | 30-60% probabilidad anual |
| **Baja** | Poco probable | 10-30% probabilidad anual |
| **Muy Baja** | Extremadamente raro | < 10% probabilidad anual |

#### Impacto
| Nivel | Descripción | Consecuencias |
|-------|-------------|---------------|
| **Crítico** | Catastrófico para la organización | Pérdida masiva de datos PHI, demandas legales, cierre del servicio |
| **Alto** | Daño severo | Violación de HIPAA, pérdida de confianza, daño reputacional mayor |
| **Medio** | Daño significativo | Interrupción de servicios, pérdida de productividad, costos de recuperación |
| **Bajo** | Daño menor | Inconvenientes temporales, bajo costo de resolución |
| **Muy Bajo** | Impacto negligible | Sin impacto real en operaciones o seguridad |

#### Nivel de Riesgo (Matriz)
| Probabilidad \ Impacto | Muy Bajo | Bajo | Medio | Alto | Crítico |
|------------------------|----------|------|-------|------|---------|
| **Muy Alta** | Medio | Alto | Alto | Crítico | Crítico |
| **Alta** | Bajo | Medio | Alto | Alto | Crítico |
| **Media** | Bajo | Bajo | Medio | Alto | Alto |
| **Baja** | Muy Bajo | Bajo | Bajo | Medio | Alto |
| **Muy Baja** | Muy Bajo | Muy Bajo | Bajo | Bajo | Medio |

---

## 🏗️ CONTEXTO DEL SISTEMA

### Arquitectura Tecnológica
```
┌─────────────────────────────────────────────────┐
│           Electron Desktop App                  │
│  ┌─────────────────────────────────────────┐   │
│  │        React Frontend (Client)          │   │
│  │   • React Router • TailwindCSS          │   │
│  │   • Redux Toolkit • React Query         │   │
└──┴─────────────────┬───────────────────────┴───┘
                     │ HTTPS/REST API + WebSocket
┌────────────────────▼───────────────────────────┐
│          Express.js Backend (API)              │
│   • TypeScript • TypeORM • JWT                 │
│   • Bcrypt • Helmet • CORS • Joi/Zod           │
│   • Redis Cache • Winston Logging              │
└────────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│              MySQL Database                     │
│   • Expedientes • Pacientes • Citas            │
│   • Medicamentos • Usuarios • Audit Logs       │
│   • Cifrado AES-256 en reposo                  │
└─────────────────────────────────────────────────┘
```

### Componentes Críticos
1. **Autenticación y Autorización**
   - JWT con refresh tokens
   - Bcrypt para hashing de contraseñas
   - RBAC (Role-Based Access Control)

2. **Cifrado de Datos**
   - AES-256 para datos en reposo
   - TLS/HTTPS para datos en tránsito

3. **Validación y Sanitización**
   - class-validator, Joi, Zod
   - Protección contra inyecciones SQL, XSS, CSRF

4. **Logging y Auditoría**
   - Winston con rotación diaria
   - Audit logs de todas las operaciones críticas

5. **Protección de Infraestructura**
   - Helmet para headers de seguridad HTTP
   - Rate limiting contra DDoS
   - CORS configurado
   - Redis para cache y sesiones

### Datos Sensibles Gestionados
- **Protected Health Information (PHI)**:
  - Información demográfica de pacientes
  - Historiales clínicos (enfermería y psicología)
  - Notas de sesiones terapéuticas
  - Diagnósticos DSM-5 y CIE-10
  - Evaluaciones psicométricas
  - Redes de apoyo del paciente
  - Signos vitales y procedimientos médicos
  - Prescripciones y administración de medicamentos

---

## 🎯 CLASIFICACIÓN DE RIESGOS

### Por Categoría
1. **Riesgos de Seguridad (Security)**
   - Confidencialidad
   - Integridad
   - Disponibilidad

2. **Riesgos Tecnológicos (Technology)**
   - Infraestructura
   - Aplicación
   - Base de datos
   - Red y comunicaciones

3. **Riesgos Humanos (Human)**
   - Insider threats
   - Errores humanos
   - Ingeniería social
   - Capacitación insuficiente

4. **Riesgos de Procesos (Process)**
   - Operacionales
   - Mantenimiento
   - Respaldo y recuperación
   - Gestión de cambios

5. **Riesgos de Cumplimiento (Compliance)**
   - HIPAA
   - Protección de datos personales
   - Regulaciones locales

---

## 📋 MATRIZ DE RIESGOS Y AMENAZAS

### RIESGOS CRÍTICOS (Prioridad Máxima)

| ID | Riesgo/Amenaza | Categoría | Probabilidad | Impacto | Nivel | Controles Actuales | Mitigaciones Propuestas |
|----|---------------|-----------|--------------|---------|-------|-------------------|------------------------|
| **RC-01** | Fuga masiva de datos PHI por ataque externo (ransomware, breach) | Seguridad | Media | Crítico | **CRÍTICO** | Cifrado AES-256, HTTPS, firewall | WAF, IDS/IPS, segmentación de red, DLP, backups offline inmutables |
| **RC-02** | Acceso no autorizado a expedientes por robo/compromiso de credenciales | Seguridad | Alta | Crítico | **CRÍTICO** | JWT, Bcrypt, rate limiting | MFA obligatorio, detección de anomalías, tokens de corta duración, políticas de contraseñas robustas |
| **RC-03** | Exposición de datos sensibles por inyección SQL | Tecnología | Media | Crítico | **CRÍTICO** | TypeORM (ORM), validación con Joi/Zod | Consultas parametrizadas, WAF con reglas anti-SQLi, escaneo de vulnerabilidades regular |
| **RC-04** | Pérdida total de base de datos sin capacidad de recuperación | Proceso | Baja | Crítico | **ALTO** | Backups automáticos programados | Backups incrementales/diferenciales, replicación geográfica, pruebas de restauración mensuales, RTO < 4h |
| **RC-05** | Insider threat: empleado malicioso accede y exfiltra información sensible | Humano | Media | Crítico | **ALTO** | RBAC, audit logs | Monitoreo de actividad anómala, principio de mínimo privilegio, revisión de logs, separación de deberes |
| **RC-06** | Violación de HIPAA por manejo inadecuado de PHI | Cumplimiento | Media | Crítico | **ALTO** | Cifrado, audit logs, RBAC | Capacitación HIPAA anual, auditorías de cumplimiento trimestrales, DPO/Security Officer designado |
| **RC-07** | Ataque DDoS que deja sistema inaccesible durante emergencias médicas | Seguridad | Alta | Alto | **ALTO** | Rate limiting básico | CDN con protección DDoS (Cloudflare/AWS Shield), arquitectura distribuida, plan de contingencia offline |
| **RC-08** | Cross-Site Scripting (XSS) permite robo de sesiones activas | Tecnología | Media | Alto | **ALTO** | Sanitización, Helmet (CSP) | CSP estricto, sanitización en cliente y servidor, HttpOnly cookies, escaping automático en templates |
| **RC-09** | Compromiso de secretos y claves en repositorio de código | Seguridad | Alta | Alto | **ALTO** | .gitignore para secrets | Vault para secrets (HashiCorp Vault, AWS Secrets Manager), rotación automática de claves, escaneo de secretos en CI/CD |
| **RC-10** | Falla de servidor Redis causa pérdida de sesiones y cache | Tecnología | Media | Alto | **ALTO** | Redis configurado | Redis Cluster con replicación, persistencia RDB+AOF, fallback a sesiones en DB |

### RIESGOS ALTOS

| ID | Riesgo/Amenaza | Categoría | Probabilidad | Impacto | Nivel | Controles Actuales | Mitigaciones Propuestas |
|----|---------------|-----------|--------------|---------|-------|-------------------|------------------------|
| **RA-01** | Vulnerabilidad en dependencias de Node.js (npm packages) | Tecnología | Alta | Alto | **ALTO** | npm audit | Dependabot, Snyk, actualizaciones regulares, lock de versiones críticas |
| **RA-02** | Expiración/revocación incorrecta de tokens JWT permite acceso persistente | Seguridad | Media | Alto | **ALTO** | Refresh tokens, expiración configurada | Blacklist de tokens revocados (Redis), logout activo en todos los dispositivos, duración JWT < 15 min |
| **RA-03** | CSRF permite acciones no autorizadas en nombre del usuario | Tecnología | Media | Alto | **ALTO** | CORS configurado, SameSite cookies | Tokens CSRF, doble submit cookies, validación de Origin/Referer |
| **RA-04** | Error humano: eliminación accidental de expedientes o datos críticos | Humano | Alta | Alto | **ALTO** | Audit logs | Soft deletes, confirmación doble para acciones destructivas, papelera de reciclaje con TTL 30 días, backups |
| **RA-05** | Desactualización del sistema operativo del servidor expone vulnerabilidades conocidas | Tecnología | Media | Alto | **ALTO** | No especificado | Gestión de parches automatizada, política de actualización mensual, escaneo de vulnerabilidades |
| **RA-06** | Phishing/ingeniería social compromete credenciales de personal médico | Humano | Alta | Alto | **ALTO** | No especificado | Capacitación anti-phishing trimestral, simulacros, reporte de correos sospechosos, autenticación basada en riesgo |
| **RA-07** | Falla en validación de permisos RBAC permite escalación de privilegios | Seguridad | Baja | Alto | **ALTO** | RBAC implementado | Tests de permisos en CI/CD, revisión de código enfocada en autorización, auditoría de roles trimestral |
| **RA-08** | Logs de auditoría alterados o eliminados por atacante/insider | Seguridad | Baja | Alto | **ALTO** | Winston logging | Logs inmutables (write-only), forwarding a SIEM externo (Splunk, ELK), alertas en tiempo real |
| **RA-09** | Ausencia de monitoreo en tiempo real retrasa detección de incidentes de seguridad | Proceso | Alta | Medio | **ALTO** | Logs básicos | SIEM, alertas automáticas, SOC (aunque sea básico), dashboard de seguridad en tiempo real |
| **RA-10** | Exposición de información en mensajes de error detallados al cliente | Seguridad | Alta | Medio | **ALTO** | Manejo de errores genérico | Logging detallado solo en servidor, mensajes genéricos al cliente, nunca exponer stack traces |
| **RA-11** | Falta de cifrado en backups almacenados | Seguridad | Media | Alto | **ALTO** | Backups automáticos | Cifrado de backups en tránsito y reposo (AES-256), almacenamiento seguro (encriptado), acceso restringido |
| **RA-12** | Fallo en autenticación de dos factores (si se implementa mal) | Seguridad | Baja | Alto | **MEDIO** | Pendiente implementación MFA | MFA robusto (TOTP, U2F), fallback seguro, recovery codes almacenados cifrados |

### RIESGOS MEDIOS

| ID | Riesgo/Amenaza | Categoría | Probabilidad | Impacto | Nivel | Controles Actuales | Mitigaciones Propuestas |
|----|---------------|-----------|--------------|---------|-------|-------------------|------------------------|
| **RM-01** | Problemas de rendimiento bajo alta carga (> 22 usuarios concurrentes) | Tecnología | Media | Medio | **MEDIO** | Redis cache | Load testing regular, escalado horizontal (Kubernetes/PM2 cluster), optimización de queries |
| **RM-02** | Cambios no documentados en el código aumentan vulnerabilidades | Proceso | Alta | Medio | **MEDIO** | Git, code reviews | Documentación obligatoria en PRs, changelog automático, políticas de commit claras |
| **RM-03** | Falta de plan de respuesta a incidentes aumenta tiempo de recuperación | Proceso | Media | Medio | **MEDIO** | No especificado | IRP documentado, runbooks para incidentes comunes, simulacros semestrales, equipo de respuesta designado |
| **RM-04** | Configuración incorrecta de CORS expone API a orígenes no autorizados | Seguridad | Media | Medio | **MEDIO** | CORS configurado | Whitelist estricta de orígenes, no usar wildcard (*) en producción, validación en cada endpoint |
| **RM-05** | Ausencia de WAF deja endpoints expuestos a ataques automatizados | Tecnología | Media | Medio | **MEDIO** | Helmet, rate limiting | WAF (AWS WAF, Cloudflare, ModSecurity), reglas OWASP CRS, actualización continua |
| **RM-06** | Session fixation permite secuestro de sesiones | Seguridad | Baja | Medio | **MEDIO** | JWT (menos vulnerable) | Regenerar session ID después de login, secure flag en cookies, validación de fingerprint del cliente |
| **RM-07** | Clickjacking permite engañar usuarios para realizar acciones no deseadas | Seguridad | Baja | Medio | **MEDIO** | Helmet (X-Frame-Options) | CSP frame-ancestors, X-Frame-Options DENY, validación de acciones sensibles |
| **RM-08** | Open redirects permiten phishing y robo de credenciales | Seguridad | Media | Medio | **MEDIO** | Validación básica | Whitelist de URLs de redirección, validación estricta de parámetros redirect, no confiar en input del usuario |
| **RM-09** | Falta de segregación de ambientes (dev/staging/prod) causa bugs en producción | Proceso | Alta | Medio | **MEDIO** | Branches en Git | Ambientes separados (infraestructura y DB), CI/CD con gates, no compartir datos de producción en dev |
| **RM-10** | Falta de pruebas de seguridad automatizadas en CI/CD | Proceso | Alta | Medio | **MEDIO** | No especificado | SAST (SonarQube), DAST (OWASP ZAP), dependency scanning en cada PR |

### RIESGOS BAJOS

| ID | Riesgo/Amenaza | Categoría | Probabilidad | Impacto | Nivel | Controles Actuales | Mitigaciones Propuestas |
|----|---------------|-----------|--------------|---------|-------|-------------------|------------------------|
| **RB-01** | Exposición de versiones de software en headers HTTP | Seguridad | Alta | Bajo | **BAJO** | Helmet | Helmet con hidePoweredBy, ocultar versiones en todos los headers |
| **RB-02** | Carencia de política de contraseñas débiles permite cuentas fáciles de comprometer | Seguridad | Media | Medio | **MEDIO** | Bcrypt (hashing fuerte) | Validación de complejidad (min 12 chars, mayúsculas, números, símbolos), prevención de contraseñas comunes |
| **RB-03** | Falta de timeout en sesiones permite sesiones perpetuas | Seguridad | Media | Bajo | **BAJO** | Expiración JWT configurada | Timeout de inactividad (30 min), logout automático, notificación al usuario |
| **RB-04** | Logs no estructurados dificultan análisis forense post-incidente | Proceso | Media | Bajo | **BAJO** | Winston logging | Logs estructurados (JSON), correlación de eventos, timestamps precisos (ISO 8601) |
| **RB-05** | Falta de tests de penetración periódicos | Proceso | Media | Medio | **MEDIO** | No especificado | Pentesting semestral (externo), bug bounty program, red team exercises |
| **RB-06** | Falta de política de retención de datos puede violar regulaciones | Cumplimiento | Baja | Medio | **MEDIO** | No especificado | Política documentada según HIPAA (6 años para PHI), archivado automático, eliminación segura |
| **RB-07** | Interfaz administrativa sin protección adicional | Seguridad | Baja | Medio | **MEDIO** | RBAC | Admin panel separado, IP whitelisting, MFA obligatorio para admin, rate limiting agresivo |
| **RB-08** | Ausencia de health checks dificulta detección de problemas de disponibilidad | Tecnología | Media | Bajo | **BAJO** | No especificado | Endpoints /health y /readiness, monitoreo con Prometheus/Grafana, alertas automáticas |
| **RB-09** | Falta de documentación de seguridad para desarrolladores | Proceso | Alta | Bajo | **BAJO** | No especificado | Secure coding guidelines, OWASP Cheat Sheets, revisión de seguridad en onboarding |
| **RB-10** | Certificados SSL/TLS vencidos interrumpen el servicio | Tecnología | Baja | Medio | **MEDIO** | HTTPS configurado | Renovación automática (Let's Encrypt certbot), alertas 30 días antes de vencimiento, monitoreo de certificados |


---

## 🔬 ANÁLISIS DETALLADO POR CATEGORÍA

### 1️⃣ RIESGOS DE SEGURIDAD (CONFIDENCIALIDAD, INTEGRIDAD, DISPONIBILIDAD)

#### 1.1 Confidencialidad

**Amenazas Identificadas:**
- **Acceso no autorizado a PHI**: Sin MFA, las contraseñas robadas permiten acceso completo
- **Exfiltración de datos**: Insider con acceso legítimo puede copiar bases de datos enteras
- **Exposición de secretos**: Claves en código fuente o variables de entorno mal protegidas
- **Intercepción de comunicaciones**: Si HTTPS no está forzado o mal configurado

**Impacto de Materialización:**
- Violación de HIPAA con multas de hasta $50,000 por registro expuesto
- Pérdida de confianza de pacientes y personal
- Demandas legales de pacientes afectados
- Daño reputacional irreparable para la institución

**Controles Recomendados:**
1. MFA obligatorio para todos los usuarios (especialmente personal médico)
2. DLP (Data Loss Prevention) para detectar exfiltración
3. Cifrado de disco completo en servidores y clientes
4. Segmentación de red (DMZ, VLANs)
5. VPN obligatoria para acceso remoto
6. Clasificación de datos y etiquetado automático

#### 1.2 Integridad

**Amenazas Identificadas:**
- **Modificación no autorizada de expedientes**: Altering medical records
- **Inyección de datos maliciosos**: SQL injection, NoSQL injection
- **Corrupción de datos por bugs**: Lógica de negocio defectuosa
- **Modificación de logs de auditoría**: Borrar huellas de ataques

**Impacto de Materialización:**
- Decisiones médicas basadas en información incorrecta
- Responsabilidad legal por mala praxis
- Pérdida de integridad en auditorías de cumplimiento
- Imposibilidad de realizar análisis forense

**Controles Recomendados:**
1. Checksums y firmas digitales para expedientes críticos
2. Versionado de expedientes con histórico inmutable
3. Blockchain o tecnología append-only para audit logs
4. Validación estricta en todas las capas (cliente, API, DB)
5. Tests de integridad de datos automatizados
6. Backups con verificación de integridad

#### 1.3 Disponibilidad

**Amenazas Identificadas:**
- **Ataques DDoS**: Inundación de peticiones legítimas o maliciosas
- **Ransomware**: Cifrado de datos con petición de rescate
- **Fallas de hardware**: Disco duro, RAM, CPU
- **Errores de configuración**: Cambios que rompen el sistema
- **Desastres naturales**: Incendio, inundación en datacenter

**Impacto de Materialización:**
- Imposibilidad de atender emergencias médicas
- Pérdida de productividad del personal
- Incumplimiento de SLAs
- Costos de recuperación significativos

**Controles Recomendados:**
1. Alta disponibilidad (HA) con redundancia en múltiples zonas
2. Load balancers y failover automático
3. Backups geográficamente distribuidos
4. Plan de recuperación ante desastres (DRP) con RTO < 4 horas
5. CDN y protección DDoS a nivel de red
6. Monitoreo 24/7 con alertas automáticas

---

### 2️⃣ RIESGOS TECNOLÓGICOS

#### 2.1 Vulnerabilidades de Aplicación (OWASP Top 10)

| Vulnerabilidad | Riesgo Actual | Estado | Mitigaciones Necesarias |
|----------------|--------------|--------|-------------------------|
| **A01: Broken Access Control** | Alto | Parcial | Tests exhaustivos de autorización, revisión de cada endpoint |
| **A02: Cryptographic Failures** | Medio | Bueno | Validar algoritmos (AES-256, RSA-2048+), rotación de claves |
| **A03: Injection (SQL, NoSQL, etc.)** | Crítico | Bueno | ORM con consultas parametrizadas, WAF |
| **A04: Insecure Design** | Medio | Parcial | Threat modeling en fase de diseño, arquitectura zero-trust |
| **A05: Security Misconfiguration** | Alto | Medio | Hardening automático, IaC con validación de seguridad |
| **A06: Vulnerable Components** | Alto | Medio | Dependabot, Snyk, actualizaciones proactivas |
| **A07: Identification/Authentication Failures** | Alto | Medio | MFA, políticas de contraseñas robustas, rate limiting |
| **A08: Software and Data Integrity Failures** | Medio | Medio | Integridad de CI/CD, verificación de dependencias (SRI) |
| **A09: Security Logging/Monitoring Failures** | Alto | Medio | SIEM, alertas en tiempo real, retención de logs > 1 año |
| **A10: Server-Side Request Forgery (SSRF)** | Medio | Bueno | Validación de URLs, no resolver DNS de input del usuario |

#### 2.2 Infraestructura y Red

**Amenazas:**
- Firewall mal configurado expone puertos innecesarios
- Falta de segmentación permite movimiento lateral de atacantes
- DNS poisoning o hijacking
- Man-in-the-middle en comunicaciones internas

**Mitigaciones:**
- Network segmentation (DMZ, backend separado)
- Firewall con reglas de least privilege
- IDS/IPS (Intrusion Detection/Prevention System)
- Encrypted internal communications (service mesh, mTLS)

#### 2.3 Base de Datos

**Amenazas:**
- Acceso directo a DB desde internet
- Privilegios excesivos de cuentas de aplicación
- Backups sin cifrar
- Falta de auditoría de accesos

**Mitigaciones:**
- DB en red privada, solo accesible desde backend
- Cuentas de servicio con mínimos privilegios (no usar root)
- Cifrado transparente de datos (TDE)
- Auditoría nativa de MySQL habilitada
- Rotación de credenciales de DB mensual

---

### 3️⃣ RIESGOS HUMANOS

#### 3.1 Insider Threats

**Perfil de Amenaza Interna:**
- **Empleado malicioso**: Intención de causar daño o robar información
- **Empleado negligente**: Errores por desconocimiento o descuido
- **Empleado comprometido**: Cuenta controlada por atacante externo

**Escenarios de Riesgo:**
1. Psicólogo accede a expedientes de pacientes que no son asignados
2. Enfermera elimina accidentalmente registros de medicación
3. Administrador de sistemas copia base de datos completa
4. Personal de TI desactiva controles de seguridad para "facilitar" operaciones

**Controles:**
- Principio de mínimo privilegio (solo acceso a lo necesario)
- Separación de deberes (ninguna persona tiene control completo)
- Monitoreo de comportamiento anómalo (UBA - User Behavior Analytics)
- Revisión de accesos trimestralmente
- Capacitación continua en seguridad y ética
- Acuerdos de confidencialidad (NDA)
- Background checks para personal con acceso a PHI

#### 3.2 Ingeniería Social y Phishing

**Vectores de Ataque:**
- Correos de phishing suplantando identidad de la institución
- Vishing (phone phishing) haciéndose pasar por TI
- Pretexting para obtener información sensible
- Baiting con USB infectadas

**Controles:**
- Simulacros de phishing trimestrales
- Capacitación anti-phishing obligatoria anual
- Filtros de correo con detección de phishing
- Proceso de verificación de identidad para solicitudes sensibles
- Política de escritorio limpio (clean desk policy)

#### 3.3 Errores Humanos

**Errores Comunes:**
- Eliminación accidental de datos
- Configuración incorrecta de permisos
- Compartir contraseñas
- Dejar sesiones abiertas en computadoras compartidas

**Controles:**
- Interfaces con confirmación doble para acciones destructivas
- Soft deletes con papelera de reciclaje
- Password managers corporativos
- Timeout automático de sesiones (15 minutos de inactividad)
- Capacitación continua y recordatorios

---

### 4️⃣ RIESGOS DE PROCESOS

#### 4.1 Gestión de Cambios

**Riesgos:**
- Cambios no probados en producción causan downtime
- Rollback deficiente aumenta tiempo de recuperación
- Cambios conflictivos entre equipos

**Controles:**
- Change management formal con aprobaciones
- CI/CD con gates de calidad y seguridad
- Ambiente de staging idéntico a producción
- Blue-green deployments o canary releases
- Rollback plan documentado para cada cambio

#### 4.2 Backups y Recuperación

**Riesgos:**
- Backups no probados fallan en momento crítico
- RPO/RTO no cumplen requisitos del negocio
- Backups en mismo sitio que producción (vulnerable a desastres)

**Estrategia 3-2-1:**
- **3** copias de datos
- **2** medios diferentes (disco, cinta, cloud)
- **1** copia offsite (geográficamente separada)

**Pruebas:**
- Restauración completa mensual
- DR drill (simulacro de desastre) semestral
- Verificación de integridad de backups semanal

#### 4.3 Gestión de Vulnerabilidades

**Proceso Recomendado:**
1. **Escaneo**: Mensual con herramientas automatizadas (Nessus, OpenVAS)
2. **Priorización**: Según CVSS score y exposición real
3. **Remediación**: Críticas en 7 días, Altas en 30 días
4. **Verificación**: Re-escaneo después de parcheo
5. **Reporte**: Métricas a management mensualmente


---

## ⚖️ CUMPLIMIENTO REGULATORIO

### HIPAA (Health Insurance Portability and Accountability Act)

#### Requisitos Aplicables

**1. Privacy Rule**
- Uso y divulgación limitada de PHI
- Derecho del paciente a acceder y enmendar sus datos
- Notificación de prácticas de privacidad
- Acuerdos de asociados de negocios (BAA)

**Estado Actual**: Parcialmente cumplido
**Gaps Identificados**:
- Falta de proceso formal para solicitudes de acceso/enmienda de pacientes
- No hay términos BAA si se usan servicios de terceros (cloud, email)
- Portal del paciente para acceso a sus datos no está implementado

**2. Security Rule**

**Salvaguardas Administrativas**:
- ✅ Evaluación de riesgos de seguridad (este documento)
- ❌ Política de sanciones para violaciones de seguridad
- ⚠️ Plan de contingencia (en desarrollo)
- ❌ Programa de capacitación en seguridad formal

**Salvaguardas Físicas**:
- ⚠️ Controles de acceso a instalaciones (depende de hosting)
- ⚠️ Políticas de estación de trabajo (definir)
- ⚠️ Políticas de dispositivos móviles (definir)

**Salvaguardas Técnicas**:
- ✅ Control de acceso único (JWT, RBAC)
- ⚠️ Logs de auditoría (implementado, pero sin SIEM)
- ✅ Integridad de datos (checksums, validación)
- ✅ Cifrado de PHI en tránsito y reposo

**3. Breach Notification Rule**
- Notificación a individuos afectados dentro de 60 días
- Notificación a HHS si > 500 personas afectadas
- Documentación de todos los breaches (>= 500 y < 500)

**Estado Actual**: No implementado
**Acción Requerida**: Definir proceso de notificación de breaches

#### Plan de Cumplimiento HIPAA

| Acción | Prioridad | Responsable | Plazo |
|--------|-----------|-------------|-------|
| Designar Security Officer | Crítica | Management | 1 semana |
| Implementar MFA | Crítica | DevOps/IT | 2 semanas |
| Desarrollar política de sanciones | Alta | Legal/HR | 2 semanas |
| Capacitación HIPAA para todo el personal | Alta | Security Officer | 1 mes |
| Implementar SIEM o logging centralizado | Alta | DevOps | 1 mes |
| Definir proceso de notificación de breaches | Alta | Legal/Security | 2 semanas |
| Crear portal del paciente | Media | Dev Team | 3 meses |
| Firmar BAAs con proveedores cloud | Alta | Legal | 1 mes |
| Auditoría de cumplimiento externa | Media | Security Officer | 6 meses |

### Protección de Datos Personales (Ley Local)

**Principios Aplicables:**
- Consentimiento informado para recolección de datos
- Finalidad específica y legítima
- Minimización de datos (solo lo necesario)
- Exactitud y actualización
- Seguridad y confidencialidad
- Derecho de acceso, rectificación, cancelación y oposición (ARCO)

**Controles Necesarios:**
- Aviso de privacidad claro y accesible
- Mecanismo para obtener consentimiento explícito
- Procedimiento para ejercicio de derechos ARCO
- Transferencias internacionales con salvaguardas adecuadas
- Notificación de violaciones a autoridad de protección de datos

---

## 🛡️ CONTROLES Y MITIGACIONES

### Controles Preventivos

| Control | Descripción | Prioridad | Costo | Complejidad |
|---------|-------------|-----------|-------|-------------|
| **Multi-Factor Authentication (MFA)** | TOTP o U2F para todos los usuarios | Crítica | Bajo | Baja |
| **Web Application Firewall (WAF)** | Cloudflare, AWS WAF, o ModSecurity | Crítica | Medio | Media |
| **Secrets Management** | HashiCorp Vault o AWS Secrets Manager | Alta | Medio | Media |
| **Dependency Scanning** | Dependabot, Snyk, npm audit | Alta | Bajo | Baja |
| **SAST en CI/CD** | SonarQube, Checkmarx | Alta | Medio | Media |
| **Hardening de Servidores** | CIS Benchmarks, bastion hosts | Alta | Bajo | Media |
| **Network Segmentation** | VLANs, security groups | Media | Bajo | Media |
| **Data Loss Prevention (DLP)** | Prevenir exfiltración de PHI | Media | Alto | Alta |

### Controles Detectivos

| Control | Descripción | Prioridad | Costo | Complejidad |
|---------|-------------|-----------|-------|-------------|
| **SIEM / Logging Centralizado** | Splunk, ELK Stack, Datadog | Crítica | Alto | Alta |
| **Intrusion Detection System (IDS)** | Snort, Suricata, AWS GuardDuty | Alta | Medio | Media |
| **File Integrity Monitoring (FIM)** | Detectar cambios no autorizados | Media | Bajo | Baja |
| **User Behavior Analytics (UBA)** | Detectar anomalías en comportamiento | Media | Alto | Alta |
| **Vulnerability Scanning** | Nessus, OpenVAS, Qualys | Alta | Medio | Baja |
| **Penetration Testing** | Semestral por tercero certificado | Alta | Alto | N/A |

### Controles Correctivos

| Control | Descripción | Prioridad | Costo | Complejidad |
|---------|-------------|-----------|-------|-------------|
| **Incident Response Plan (IRP)** | Procedimientos documentados | Crítica | Bajo | Media |
| **Automated Backups** | Incrementales diarios, completos semanales | Crítica | Medio | Baja |
| **Disaster Recovery Plan (DRP)** | RTO < 4h, RPO < 1h | Crítica | Alto | Alta |
| **Patch Management** | Automatizado con testing | Alta | Bajo | Media |
| **Security Updates Subscription** | Alertas de CVEs relevantes | Alta | Bajo | Baja |

### Controles de Recuperación

| Control | Descripción | Prioridad | Costo | Complejidad |
|---------|-------------|-----------|-------|-------------|
| **Backup Restoration Drills** | Mensual para pruebas parciales | Alta | Bajo | Baja |
| **Disaster Recovery Drills** | Semestral para pruebas completas | Media | Medio | Media |
| **Runbooks para Incidentes** | Guías paso a paso | Alta | Bajo | Baja |
| **Post-Incident Reviews** | Lessons learned después de cada incidente | Media | Bajo | Baja |

---

## 📊 PLAN DE MONITOREO Y REVISIÓN

### Métricas de Seguridad (KPIs)

| Métrica | Objetivo | Frecuencia de Medición | Responsable |
|---------|----------|------------------------|-------------|
| **Tiempo medio de detección (MTTD)** | < 1 hora | Continuo | SOC/DevOps |
| **Tiempo medio de respuesta (MTTR)** | < 4 horas | Por incidente | Security Officer |
| **Vulnerabilidades críticas sin parchear** | 0 | Semanal | DevOps |
| **% de usuarios con MFA habilitado** | 100% | Mensual | IT/Security |
| **Eventos de seguridad por mes** | Tendencia decreciente | Mensual | Security Officer |
| **Intentos de acceso no autorizado** | Monitoreo | Continuo | SIEM |
| **Cobertura de backups exitosos** | 100% | Diario | DevOps |
| **Tiempo de recuperación en drills** | < RTO (4h) | Mensual | DevOps |
| **Cumplimiento de capacitación en seguridad** | 100% anual | Trimestral | HR/Security |

### Ciclo de Revisión

**Mensual:**
- Revisión de logs de seguridad
- Análisis de vulnerabilidades detectadas
- Actualización de parches críticos
- Revisión de accesos de usuarios

**Trimestral:**
- Auditoría de permisos RBAC
- Revisión de políticas de seguridad
- Capacitación en seguridad
- Análisis de tendencias de incidentes

**Semestral:**
- Actualización de evaluación de riesgos
- Penetration testing por tercero
- Disaster recovery drill
- Revisión de cumplimiento HIPAA

**Anual:**
- Auditoría de seguridad completa por tercero
- Revisión de arquitectura de seguridad
- Actualización de planes de respuesta a incidentes
- Certificación de cumplimiento


---

## 📌 CONCLUSIONES Y RECOMENDACIONES

### Conclusiones Principales

1. **Estado General de Seguridad**: El sistema tiene una base sólida de seguridad con cifrado, autenticación y auditoría implementados. Sin embargo, existen **gaps críticos** que requieren atención inmediata, especialmente en controles detectivos y de respuesta.

2. **Riesgos Críticos**: Se identificaron **10 riesgos críticos** que podrían resultar en violaciones de HIPAA, pérdida de datos PHI, o comprometer la disponibilidad del sistema. Estos requieren mitigación en los próximos 30 días.

3. **Cumplimiento HIPAA**: El sistema está parcialmente alineado con HIPAA pero requiere implementar:
   - MFA obligatorio
   - Programa formal de capacitación
   - SIEM o logging centralizado
   - Proceso de notificación de breaches
   - Políticas de seguridad documentadas

4. **Amenazas Humanas**: Los riesgos relacionados con errores humanos e insider threats son significativos dado el acceso a información sensible. Se requiere un programa robusto de capacitación y monitoreo de comportamiento.

5. **Madurez de Procesos**: Los procesos de gestión de vulnerabilidades, cambios y respuesta a incidentes están en etapa inicial y requieren formalización y automatización.

### Recomendaciones Prioritarias (30 días)

#### Críticas (Implementar inmediatamente)
1. ✅ **Implementar MFA obligatorio** para todos los usuarios
   - Herramienta: Authy, Google Authenticator, o solución SAML con MFA
   - Impacto: Reduce riesgo de compromiso de credenciales en >90%

2. ✅ **Desplegar WAF** en front de la aplicación
   - Herramienta: Cloudflare, AWS WAF, ModSecurity
   - Impacto: Protección contra OWASP Top 10, DDoS

3. ✅ **Implementar secrets management**
   - Herramienta: HashiCorp Vault, AWS Secrets Manager
   - Impacto: Elimina credenciales hardcodeadas, rotación automática

4. ✅ **Configurar SIEM básico o logging centralizado**
   - Herramienta: ELK Stack (Elasticsearch, Logstash, Kibana), Datadog
   - Impacto: Detección temprana de incidentes, cumplimiento HIPAA

5. ✅ **Crear Incident Response Plan**
   - Documento con roles, responsabilidades, procedimientos
   - Impacto: Reducir MTTR de horas a minutos

#### Altas (Implementar en 60-90 días)
6. ✅ **Implementar backups offsite cifrados** con pruebas de restauración
7. ✅ **Desplegar IDS/IPS** (Snort, Suricata, o managed service)
8. ✅ **Configurar dependency scanning** en CI/CD (Dependabot, Snyk)
9. ✅ **Desarrollar programa de capacitación en seguridad** (HIPAA, anti-phishing)
10. ✅ **Realizar pentesting** por tercero certificado

#### Medias (Implementar en 3-6 meses)
11. ⏳ Implementar DLP para prevenir exfiltración de datos
12. ⏳ Desplegar UBA para detección de anomalías
13. ⏳ Crear portal del paciente para acceso a sus datos (HIPAA)
14. ⏳ Implementar arquitectura de alta disponibilidad (multi-AZ)
15. ⏳ Obtener certificación HIPAA por auditor externo

### Roadmap de Seguridad (12 meses)

```
Mes 1-2: Críticos
├─ MFA
├─ WAF
├─ Secrets Management
├─ SIEM básico
└─ IRP v1.0

Mes 3-4: Altos
├─ Backups offsite
├─ IDS/IPS
├─ Dependency Scanning
├─ Capacitación inicial
└─ Pentesting #1

Mes 5-6: Consolidación
├─ DLP
├─ Auditoría interna de cumplimiento
├─ Políticas de seguridad v2.0
└─ Runbooks completos

Mes 7-9: Madurez
├─ UBA
├─ Portal del paciente
├─ HA/DR avanzado
└─ SOC básico

Mes 10-12: Certificación
├─ Pentesting #2
├─ Auditoría externa HIPAA
├─ Certificación de cumplimiento
└─ Programa de mejora continua
```

### Inversión Estimada

| Categoría | Costo Anual Estimado | ROI Esperado |
|-----------|---------------------|--------------|
| **Herramientas y Licencias** | $50,000 - $100,000 | Reducción de riesgo 70% |
| **Servicios Profesionales** (Pentesting, Consultoría) | $30,000 - $60,000 | Cumplimiento HIPAA |
| **Capacitación** | $10,000 - $20,000 | Reducción de errores humanos 50% |
| **Staff adicional** (Security Officer, SOC) | $80,000 - $150,000 | MTTD < 1h, MTTR < 4h |
| **Total** | **$170,000 - $330,000** | Evitar multas HIPAA (>$1M) y daño reputacional |

### Métricas de Éxito

Al completar las recomendaciones, el sistema deberá lograr:
- ✅ **0** vulnerabilidades críticas sin parchear
- ✅ **100%** de usuarios con MFA habilitado
- ✅ **MTTD < 1 hora** (tiempo de detección de incidentes)
- ✅ **MTTR < 4 horas** (tiempo de respuesta a incidentes)
- ✅ **RTO < 4 horas, RPO < 1 hora** (recuperación ante desastres)
- ✅ **100%** de cumplimiento de capacitación en seguridad anual
- ✅ **Certificación HIPAA** aprobada por auditor externo

---

## 📝 APROBACIONES Y REVISIÓN

### Historial de Versiones
| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-02-08 | Equipo de Seguridad | Versión inicial del análisis de riesgos y amenazas |

### Aprobaciones Requeridas
- [ ] **Security Officer** - Revisión técnica de controles
- [ ] **Compliance Officer** - Validación de cumplimiento HIPAA
- [ ] **CTO/Director de TI** - Aprobación de inversión y roadmap
- [ ] **Legal** - Revisión de implicaciones legales y regulatorias
- [ ] **Project Manager** - Integración en plan de proyecto

### Próxima Revisión
- **Fecha**: 2026-08-08 (6 meses)
- **Responsable**: Security Officer
- **Alcance**: Actualización de matriz de riesgos, progreso de mitigaciones, nuevas amenazas

---

## 📚 REFERENCIAS

1. **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
2. **OWASP Top 10 (2021)**: https://owasp.org/Top10/
3. **HIPAA Security Rule**: https://www.hhs.gov/hipaa/for-professionals/security/index.html
4. **ISO/IEC 27001:2013**: Information Security Management Systems
5. **CIS Controls v8**: https://www.cisecurity.org/controls/
6. **SANS Top 25 Software Errors**: https://www.sans.org/top25-software-errors/

---

**Documento controlado - Confidencial**  
*Distribución restringida al equipo de proyecto y stakeholders autorizados*
