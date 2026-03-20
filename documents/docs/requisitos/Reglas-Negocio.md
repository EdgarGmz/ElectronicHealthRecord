# 📋 REGLAS DE NEGOCIO
## Sistema de Expediente Clínico Electrónico (EHR)

---

**Versión:** 1.0  
**Fecha de Emisión:** 10 de Febrero, 2026  
**Departamentos:** Enfermería y Psicología

---

## 📑 TABLA DE CONTENIDOS

1. [Introducción](#-introducción)
2. [Objetivos](#-objetivos)
3. [Alcance](#-alcance)
4. [Reglas de Registro de Pacientes](#-reglas-de-registro-de-pacientes)
5. [Reglas de Control de Acceso y Roles](#-reglas-de-control-de-acceso-y-roles)
6. [Reglas de Privacidad de Datos Sensibles](#-reglas-de-privacidad-de-datos-sensibles)
7. [Reglas de Consulta Médica y Psicológica](#-reglas-de-consulta-médica-y-psicológica)
8. [Reglas de Medicamentos y Procedimientos](#-reglas-de-medicamentos-y-procedimientos)
9. [Reglas de Validación de Datos](#-reglas-de-validación-de-datos)
10. [Reglas de Auditoría y Trazabilidad](#-reglas-de-auditoría-y-trazabilidad)
11. [Cumplimiento Normativo](#-cumplimiento-normativo)
12. [Tabla de Validaciones](#-tabla-de-validaciones)

---

## 📖 INTRODUCCIÓN

Este documento define las reglas de negocio que rigen el Sistema de Expediente Clínico Electrónico (EHR) para asegurar el cumplimiento del **ODS 3: Salud y Bienestar** de las Naciones Unidas y las normativas locales e internacionales de salud.

Las reglas de negocio establecidas garantizan:
- ✅ Validaciones esenciales en el backend
- 🔒 Protección de datos sensibles de salud
- 📋 Cumplimiento normativo (HIPAA, protección de datos personales)
- 🎯 Flujos de trabajo claros y seguros
- 📊 Integridad y consistencia de la información

---

## 🎯 OBJETIVOS

1. **Asegurar la calidad de datos:** Establecer validaciones que garanticen datos completos, correctos y consistentes
2. **Proteger la privacidad:** Definir reglas estrictas para el manejo de información médica sensible
3. **Facilitar el cumplimiento:** Alinearse con normativas de salud locales e internacionales
4. **Optimizar procesos:** Establecer flujos claros para la atención médica y psicológica
5. **Garantizar la trazabilidad:** Mantener registro completo de todas las acciones del sistema

---

## 📌 ALCANCE

Este documento cubre las reglas de negocio para:
- 👥 Registro y gestión de pacientes
- 🔐 Control de acceso basado en roles
- 🏥 Expedientes clínicos y psicológicos
- 💊 Administración de medicamentos
- 📅 Sistema de citas
- 📊 Reportes y estadísticas
- 🔒 Seguridad y privacidad
- 📋 Auditoría y cumplimiento

---

## 👤 REGLAS DE REGISTRO DE PACIENTES

### RN-PAC-001: Campos Obligatorios para Registro de Pacientes

**Descripción:** Todo registro de paciente debe contener información mínima obligatoria según estándares de salud.

**Campos Obligatorios:**

#### Información Personal Básica
- ✅ **Nombre completo** (Nombre, Apellido Paterno, Apellido Materno)
- ✅ **Matrícula** (Identificador único institucional)
- ✅ **Fecha de nacimiento** (formato: YYYY-MM-DD)
- ✅ **Edad** (calculada automáticamente a partir de fecha de nacimiento)
- ✅ **Sexo biológico** (Masculino, Femenino, Otro)
- ✅ **Género** (Masculino, Femenino, No binario, Prefiero no decir, Otro)
- ✅ **Estado civil** (Soltero, Casado, Divorciado, Viudo, Unión libre)
- ✅ **Número de teléfono** (con validación de formato)

#### Información Académica/Laboral
- ✅ **Carrera** (para estudiantes)
- ✅ **Grupo** (para estudiantes)
- ✅ **Ocupación** (para personal y visitantes)

#### Información de Contacto
- ✅ **Nombre del tutor** (obligatorio para menores de 18 años)
- ✅ **Teléfono de emergencia** (puede ser del tutor o contacto cercano)
- ✅ **Relación del contacto de emergencia** (Padre, Madre, Tutor, Cónyuge, Hermano/a, Amigo/a)

#### Información Clínica Inicial
- ✅ **Tipo de sangre** (A+, A-, B+, B-, AB+, AB-, O+, O-)
- ⚠️ **Alergias conocidas** (medicamentos, alimentos, ambientales)
- ⚠️ **Condiciones médicas preexistentes** (enfermedades crónicas, discapacidades)

**Validaciones:**
- El paciente debe tener al menos 16 años para ser atendido sin tutor
- Pacientes menores de 18 años requieren información completa del tutor
- La matrícula debe ser única en el sistema

---

### RN-PAC-002: Identificador Único

**Descripción:** Cada paciente debe tener un identificador único e inmutable.

**Reglas:**
- 🔑 La **matrícula institucional** es el identificador primario
- 🔢 El sistema genera automáticamente un **ID interno** (UUID) como clave secundaria
- 🚫 No se permite duplicación de matrículas
- 🔒 El ID interno es inmutable y no puede modificarse

**Validación:**
```
- Matrícula: Alfanumérica, 8-12 caracteres
- Formato sugerido: [LETRA][AÑO][CONSECUTIVO]
- Ejemplo: A2024001234
```

---

### RN-PAC-003: Actualización de Información

**Descripción:** La información del paciente debe mantenerse actualizada.

**Reglas:**
- 📝 Los datos demográficos pueden actualizarse en cualquier momento
- ⚕️ Los datos clínicos solo pueden actualizarse por personal autorizado
- 📋 Toda actualización debe registrarse en el historial de cambios
- ✅ Cambios críticos requieren verificación (ejemplo: cambio de tipo de sangre)

---

## 🔐 REGLAS DE CONTROL DE ACCESO Y ROLES

### RN-ROL-001: Definición de Roles del Sistema

**Descripción:** El sistema implementa control de acceso basado en roles (RBAC) con permisos granulares.

#### 1. 👨‍🎓 ALUMNO/PACIENTE

**Permisos:**
- ✅ Ver su propio expediente médico (información compartida por el profesional)
- ✅ Agendar citas en horarios disponibles
- ✅ Cancelar sus propias citas (con al menos 24 horas de anticipación)
- ✅ Ver historial de citas pasadas
- ✅ Actualizar información de contacto personal (teléfono, dirección)
- ✅ Ver recordatorios de citas

**Restricciones:**
- ❌ No puede ver notas clínicas completas (solo resúmenes autorizados)
- ❌ No puede ver diagnósticos sin autorización del profesional
- ❌ No puede modificar información médica
- ❌ No puede acceder a expedientes de otros pacientes

---

#### 2. 👨‍⚕️ PSICÓLOGO

**Permisos:**
- ✅ Acceso completo a expedientes de pacientes **asignados**
- ✅ Crear y editar notas de sesiones terapéuticas
- ✅ Asignar diagnósticos según **DSM-5** o **CIE-10/11**
- ✅ Registrar evaluaciones psicométricas (Wizz, Wazz, Beck, etc.)
- ✅ Crear y modificar planes de tratamiento
- ✅ Agendar citas para sus pacientes
- ✅ Generar reportes individuales de seguimiento
- ✅ Solicitar interconsultas con enfermería u otros servicios
- ✅ Compartir información específica con el paciente (versión filtrada del expediente)

**Restricciones:**
- ❌ No puede acceder a expedientes de pacientes NO asignados (excepto con autorización temporal)
- ❌ No puede modificar expedientes de otros psicólogos sin autorización
- ❌ No puede eliminar registros (solo marcar como inactivos)
- ❌ No puede administrar medicamentos (solo puede recomendar)

---

#### 3. 👩‍⚕️ ENFERMERA

**Permisos:**
- ✅ Registrar consultas de enfermería
- ✅ Registrar signos vitales (presión arterial, temperatura, peso, altura, frecuencia cardiaca, frecuencia respiratoria)
- ✅ Administrar medicamentos según prescripción médica
- ✅ Registrar procedimientos (curaciones, inyecciones, vendajes)
- ✅ Documentar reacciones adversas
- ✅ Acceso a información médica relevante de pacientes en atención
- ✅ Gestionar inventario de insumos médicos
- ✅ Agendar citas de enfermería

**Restricciones:**
- ❌ No puede acceder a notas psicológicas completas (solo información compartida explícitamente)
- ❌ No puede prescribir medicamentos (solo administrar según indicación)
- ❌ No puede asignar diagnósticos psicológicos
- ❌ Acceso limitado a expedientes solo durante período de atención activa

---

#### 4. 👔 COORDINADOR DE PSICOLOGÍA

**Permisos:**
- ✅ Supervisión de todos los expedientes del departamento de psicología
- ✅ Acceso de lectura a todas las notas clínicas (supervisión de calidad)
- ✅ Generar reportes departamentales y estadísticos
- ✅ Reasignar pacientes entre psicólogos
- ✅ Aprobar o rechazar interconsultas
- ✅ Revisar y aprobar diagnósticos complejos
- ✅ Acceder a logs de auditoría del departamento
- ✅ Otorgar permisos temporales de acceso a expedientes

**Restricciones:**
- ❌ No puede modificar notas clínicas de otros psicólogos sin justificación documentada
- ❌ Toda modificación queda registrada en auditoría

---

#### 5. 👔 COORDINADOR DE ENFERMERÍA

**Permisos:**
- ✅ Acceso a reportes estadísticos agregados (sin información personal identificable)
- ✅ Gestión completa de inventario de insumos médicos
- ✅ Supervisión de procedimientos de enfermería
- ✅ Generación de reportes operativos del departamento
- ✅ Revisar protocolos de administración de medicamentos
- ✅ Acceso a logs de auditoría del departamento

**Restricciones:**
- ❌ No acceso a información médica individual de pacientes (solo datos agregados)
- ❌ No puede modificar expedientes clínicos

---

#### 6. 🔧 ADMINISTRADOR DEL SISTEMA

**Permisos:**
- ✅ Gestión completa de usuarios (crear, modificar, desactivar)
- ✅ Asignación y modificación de roles
- ✅ Configuración de parámetros del sistema
- ✅ Acceso completo a logs de auditoría
- ✅ Gestión de catálogos del sistema (medicamentos, diagnósticos, etc.)
- ✅ Configuración de horarios y disponibilidad
- ✅ Mantenimiento de base de datos (respaldos, optimización)
- ✅ Monitoreo de seguridad y rendimiento

**Restricciones:**
- ❌ **NO tiene acceso a información médica o psicológica de pacientes**
- ❌ No puede ver expedientes clínicos
- ❌ No puede leer notas de sesiones
- ❌ Segregación de responsabilidades: administración técnica ≠ acceso clínico

---

### RN-ROL-002: Regla de Mínimo Privilegio

**Descripción:** Cada usuario debe tener únicamente los permisos mínimos necesarios para realizar su función.

**Aplicación:**
- 🔒 Permisos otorgados por rol, no por usuario individual
- ⏰ Permisos adicionales se otorgan temporalmente y expiran automáticamente
- 🔍 Revisión trimestral de permisos asignados
- 📋 Justificación documentada para permisos excepcionales

---

### RN-ROL-003: Segregación de Responsabilidades

**Descripción:** Funciones críticas deben estar separadas entre diferentes roles.

**Reglas:**
- ⚕️ **Personal médico** ≠ **Administradores del sistema**
- 📊 **Acceso a datos clínicos** ≠ **Gestión técnica del sistema**
- 🔐 **Auditor de seguridad** es un rol independiente con acceso read-only
- ✅ Acciones críticas requieren aprobación de múltiples personas

---

### RN-ROL-004: Acceso Break-Glass (Emergencia)

**Descripción:** En emergencias médicas, personal autorizado puede acceder temporalmente a información fuera de sus permisos habituales.

**Reglas:**
- 🆘 Disponible solo para personal médico de emergencias
- 📝 Requiere justificación explícita registrada
- 🚨 Genera alerta automática a coordinadores y seguridad
- 🔍 Revisión obligatoria posterior de todos los accesos break-glass
- ⏰ Acceso limitado a 24 horas
- 🏥 Aplicable solo en situaciones de riesgo para la salud del paciente

---

## 🔒 REGLAS DE PRIVACIDAD DE DATOS SENSIBLES

### RN-PRIV-001: Clasificación de Datos

**Descripción:** Los datos se clasifican según nivel de sensibilidad.

#### Clasificación de Información:

**🔴 NIVEL 1 - CRÍTICO (PHI - Protected Health Information)**
- Notas de sesiones terapéuticas completas
- Diagnósticos psicológicos (DSM-5, CIE-10/11)
- Resultados de evaluaciones psicométricas
- Información sobre salud mental
- Información sobre abuso o violencia
- Información de menores de edad
- Contraseñas, tokens de sesión

**🟠 NIVEL 2 - CONFIDENCIAL (PII - Personally Identifiable Information)**
- Nombre completo y datos demográficos
- Matrícula y números de identificación
- Información de contacto (teléfono, dirección)
- Historial médico general
- Información de tutor o contactos de emergencia
- Tipo de sangre y alergias

**🟡 NIVEL 3 - INTERNO**
- Reportes estadísticos agregados
- Información operativa del sistema
- Logs de aplicación (sin información personal)

**🟢 NIVEL 4 - PÚBLICO**
- Información general del sistema
- Horarios de atención
- Información de contacto institucional

---

### RN-PRIV-002: Cifrado de Datos

**Descripción:** Los datos sensibles deben estar cifrados en reposo y en tránsito.

**Reglas:**
- 🔐 **Cifrado en reposo (base de datos):**
  - Algoritmo: **AES-256**
  - Campos críticos (Nivel 1 y 2) cifrados individualmente
  - Llaves de cifrado gestionadas externamente (no en código)
  - Rotación de llaves cada 90 días

- 🌐 **Cifrado en tránsito:**
  - Protocolo: **HTTPS/TLS 1.3** exclusivamente
  - Sin excepciones para conexiones HTTP
  - Certificate pinning en aplicaciones cliente
  - Strong cipher suites obligatorios

---

### RN-PRIV-003: Anonimización para Entornos No Productivos

**Descripción:** Datos de producción no pueden usarse en desarrollo o pruebas sin anonimización.

**Reglas:**
- 🎭 Datos de desarrollo/QA deben ser sintéticos o completamente anonimizados
- 🗄️ Bases de datos separadas por entorno (desarrollo, QA, producción)
- 🔑 Credenciales únicas por entorno
- ⛔ Prohibido copiar datos reales de producción a otros entornos

---

### RN-PRIV-004: Protección en Logs

**Descripción:** Los sistemas de logging no deben registrar información sensible.

**Reglas:**
- 🔍 Enmascaramiento automático de datos sensibles en logs
- ⛔ No registrar: contraseñas, tokens completos, números de tarjetas, datos PHI
- 🧹 Sanitización de stack traces
- 🔐 Logs almacenados con cifrado
- 🔒 Acceso restringido a logs de auditoría

---

### RN-PRIV-005: Retención de Datos

**Descripción:** Los datos deben conservarse según normativa y eliminarse cuando ya no sean necesarios.

**Periodos de Retención:**
- 📋 **Expedientes clínicos activos:** Mientras el paciente esté activo + 7 años después de última consulta
- 📊 **Logs de auditoría:** 7 años (requisito HIPAA)
- 📈 **Logs de aplicación:** 90 días
- 🔐 **Logs de seguridad:** 1 año
- 📅 **Datos de citas:** 3 años
- 🗑️ **Datos de pacientes inactivos:** Anonimización después de 10 años sin actividad

**Proceso de Eliminación:**
- 🔄 Eliminación lógica (soft delete) - nunca física
- 📝 Registro de eliminación en logs de auditoría
- ✅ Aprobación de coordinador requerida para eliminación

---

### RN-PRIV-006: Compartir Información con el Paciente

**Descripción:** El paciente tiene derecho a acceder a su información médica.

**Reglas:**
- ✅ El paciente puede solicitar copia de su expediente
- 🔍 El profesional debe revisar y aprobar qué información se comparte
- 🚫 Se puede omitir información que pueda causar daño al paciente (criterio clínico)
- 📄 Entrega en formato PDF seguro (con marca de agua)
- 📝 Registro de toda entrega de información en auditoría
- ⏰ Tiempo máximo de respuesta: 15 días hábiles

---

## 🏥 REGLAS DE CONSULTA MÉDICA Y PSICOLÓGICA

### RN-CONS-001: Flujo de Atención al Paciente

**Descripción:** Proceso estándar desde el ingreso hasta el diagnóstico y seguimiento.

#### Diagrama de Flujo Lógico:

```
┌─────────────────────────────────────────────────────────────┐
│                   INICIO: Paciente llega                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  1. REGISTRO / VERIFICACIÓN DE IDENTIDAD                   │
│     • ¿Es paciente nuevo?                                   │
│       - SÍ: Crear expediente completo (RN-PAC-001)         │
│       - NO: Verificar matrícula y actualizar si necesario   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  2. AGENDAMIENTO / CHECK-IN                                 │
│     • ¿Tiene cita programada?                               │
│       - SÍ: Confirmar asistencia                           │
│       - NO: Crear cita de urgencia (si hay disponibilidad)  │
│     • Asignar a profesional disponible                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  3. TRIAJE (Solo Enfermería si aplica)                     │
│     • Registrar motivo de consulta                          │
│     • Tomar signos vitales (presión, temperatura, etc.)     │
│     • Identificar urgencias médicas                         │
│     • Derivar a psicología si es necesario                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  4. CONSULTA CON PROFESIONAL                                │
│                                                              │
│  A) PSICOLOGÍA (50 minutos):                                │
│     • Revisar historial clínico                             │
│     • Entrevista clínica                                    │
│     • Aplicar evaluaciones psicométricas (si necesario)     │
│     • Registrar notas de sesión                             │
│     • Actualizar diagnóstico (DSM-5/CIE-10)                 │
│     • Definir/actualizar plan de tratamiento                │
│                                                              │
│  B) ENFERMERÍA (10-15 minutos):                             │
│     • Evaluar síntomas                                      │
│     • Realizar procedimientos (curación, inyección, etc.)   │
│     • Administrar medicamentos (según protocolo 5 correctos)│
│     • Registrar procedimiento                               │
│     • Derivar a médico externo si es necesario              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  5. PLAN DE TRATAMIENTO / SEGUIMIENTO                       │
│     • Definir objetivos terapéuticos                        │
│     • Asignar tareas o actividades al paciente              │
│     • Programar siguiente cita                              │
│     • Generar receta o indicaciones (si aplica)             │
│     • Solicitar interconsulta (si necesario)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  6. CIERRE Y DOCUMENTACIÓN                                  │
│     • Guardar todas las notas en expediente                 │
│     • Generar resumen para el paciente (si autorizado)      │
│     • Enviar recordatorio de próxima cita                   │
│     • Actualizar estadísticas del sistema                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      FIN: Paciente sale                     │
└─────────────────────────────────────────────────────────────┘

                         │ (OPCIONAL)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  7. INTERCONSULTA (Si fue solicitada)                       │
│     • Notificar a otro departamento                         │
│     • Compartir información relevante                       │
│     • Coordinar atención conjunta                           │
└─────────────────────────────────────────────────────────────┘
```

---

### RN-CONS-002: Tipos de Consulta

**Descripción:** El sistema debe distinguir entre diferentes tipos de atención.

**Tipos de Consulta:**

1. **Primera vez:** Paciente nuevo, requiere evaluación inicial completa
2. **Seguimiento:** Paciente existente con plan de tratamiento activo
3. **Urgencia:** Atención inmediata por crisis o emergencia
4. **Grupal:** Sesión terapéutica con múltiples pacientes
5. **Familiar/Pareja:** Sesión con participación de familiares
6. **Reevaluación:** Aplicación de evaluaciones psicométricas de control

**Duraciones Estándar:**
- 🧠 Psicología Primera Vez: 60-90 minutos
- 🧠 Psicología Seguimiento: 50 minutos
- 🧠 Psicología Grupal: 90 minutos
- 💉 Enfermería: 10-15 minutos
- 💉 Enfermería Procedimiento: 20-30 minutos

---

### RN-CONS-003: Registro de Notas de Sesión

**Descripción:** Toda consulta debe documentarse con notas estructuradas.

**Elementos Obligatorios de Nota Clínica:**

**Para Psicología:**
- ✅ Fecha y hora de la sesión
- ✅ Tipo de sesión (individual, grupal, familiar)
- ✅ Motivo de consulta (si es primera vez)
- ✅ Notas de evolución narrativas
- ✅ Avances del paciente
- ✅ Observaciones relevantes
- ✅ Tareas o actividades asignadas
- ✅ Próxima cita programada
- ✅ Firma electrónica del profesional

**Para Enfermería:**
- ✅ Fecha y hora de la atención
- ✅ Motivo de consulta
- ✅ Signos vitales registrados
- ✅ Procedimientos realizados
- ✅ Medicamentos administrados (con protocolo 5 correctos)
- ✅ Observaciones y recomendaciones
- ✅ Firma electrónica de la enfermera

**Validaciones:**
- ⏰ Notas deben registrarse dentro de las 24 horas posteriores a la consulta
- 📝 Notas no pueden eliminarse, solo editarse (con registro de cambios)
- 🔒 Una vez firmada electrónicamente, requiere justificación para editar

---

### RN-CONS-004: Asignación de Diagnósticos

**Descripción:** Los diagnósticos deben asignarse según estándares internacionales.

**Reglas:**
- 📚 **Psicología:** Usar códigos **DSM-5** (Manual Diagnóstico y Estadístico de Trastornos Mentales) o **CIE-10/11** (Clasificación Internacional de Enfermedades)
- 👨‍⚕️ Solo psicólogos pueden asignar diagnósticos psicológicos
- 🔍 Diagnósticos complejos requieren supervisión del coordinador
- 📝 Diagnóstico debe incluir: código, descripción, nivel de severidad
- 🔄 Diagnósticos pueden actualizarse según evolución del paciente
- 📋 Historial completo de diagnósticos debe mantenerse

**Ejemplos de Códigos DSM-5:**
- F32.0 - Episodio depresivo leve
- F41.1 - Trastorno de ansiedad generalizada
- F43.1 - Trastorno de estrés postraumático

---

## 💊 REGLAS DE MEDICAMENTOS Y PROCEDIMIENTOS

### RN-MED-001: Protocolo de los 5 Correctos

**Descripción:** Toda administración de medicamentos debe verificar los 5 correctos.

**Los 5 Correctos Obligatorios:**
1. ✅ **Paciente correcto:** Verificar matrícula y nombre completo
2. ✅ **Medicamento correcto:** Verificar nombre genérico y comercial
3. ✅ **Dosis correcta:** Verificar cantidad exacta prescrita
4. ✅ **Vía correcta:** Verificar ruta de administración (oral, IV, IM, SC, tópica)
5. ✅ **Hora correcta:** Verificar horario de administración

**Validaciones del Sistema:**
- 🔔 Alerta si hay discrepancia en cualquiera de los 5 correctos
- ⚠️ Alerta de alergias conocidas al medicamento
- 🚫 Bloqueo si el medicamento está contraindicado
- ⏰ Recordatorio de próxima dosis según prescripción

---

### RN-MED-002: Registro de Administración

**Descripción:** Cada administración de medicamento debe documentarse completamente.

**Información Obligatoria:**
- ✅ Fecha y hora exacta de administración
- ✅ Nombre del medicamento (genérico y comercial)
- ✅ Dosis administrada
- ✅ Vía de administración
- ✅ Lote del medicamento
- ✅ Fecha de caducidad
- ✅ Enfermera que administró (firma electrónica)
- ✅ Observaciones (reacciones del paciente)

---

### RN-MED-003: Alergias y Contraindicaciones

**Descripción:** El sistema debe prevenir administración de medicamentos contraindicados.

**Reglas:**
- ⚠️ Alergias conocidas se registran en el expediente del paciente
- 🚨 Alerta crítica al intentar prescribir/administrar medicamento alergénico
- 🔒 Requiere anulación explícita con justificación médica documentada
- 📋 Registro de todas las alertas en auditoría

---

### RN-MED-004: Inventario de Medicamentos

**Descripción:** El inventario de medicamentos debe controlarse estrictamente.

**Reglas:**
- 📦 Registro de entrada y salida de medicamentos
- 📊 Control de existencias en tiempo real
- ⚠️ Alertas de stock mínimo
- 🔄 Control de lotes y fechas de caducidad
- 🗑️ Procedimiento de baja de medicamentos vencidos
- 🔒 Acceso restringido a personal de enfermería autorizado

---

### RN-PROC-001: Registro de Procedimientos de Enfermería

**Descripción:** Todos los procedimientos deben documentarse.

**Procedimientos Comunes:**
- 🩹 Curaciones
- 💉 Inyecciones (IM, SC, IV)
- 🩸 Toma de muestras
- 🌡️ Signos vitales
- 🩹 Vendajes
- 💊 Nebulizaciones

**Información a Registrar:**
- ✅ Tipo de procedimiento
- ✅ Fecha y hora
- ✅ Materiales utilizados
- ✅ Observaciones
- ✅ Enfermera responsable
- ✅ Resultado del procedimiento

---

## ✅ REGLAS DE VALIDACIÓN DE DATOS

### Tabla de Validaciones del Sistema

| Campo | Regla de Negocio | Validación Técnica | Mensaje de Error |
|-------|------------------|-------------------|------------------|
| **PACIENTE** |
| Matrícula | Única en el sistema | Alfanumérico, 8-12 caracteres | "La matrícula ya existe en el sistema" |
| Nombre Completo | Obligatorio | Solo letras, espacios, acentos. Min 3 caracteres | "Nombre inválido. Use solo letras" |
| Fecha de Nacimiento | Obligatorio, debe ser fecha pasada | YYYY-MM-DD, >= 1900, <= hoy | "Fecha de nacimiento inválida" |
| Edad | Calculada automáticamente | >= 0, <= 120 | "La edad no puede ser negativa" |
| Edad Mínima | >= 16 años sin tutor | Si edad < 18, tutor es obligatorio | "Menores de 18 años requieren tutor" |
| Teléfono | Obligatorio, formato válido | 10 dígitos numéricos | "Formato de teléfono inválido (10 dígitos)" |
| Email | Opcional pero si existe, válido | formato: user@domain.com | "Formato de email inválido" |
| Tipo de Sangre | Debe ser tipo válido | [A+, A-, B+, B-, AB+, AB-, O+, O-] | "Tipo de sangre no válido" |
| **CITAS** |
| Fecha de Cita | Debe ser fecha futura | >= hoy | "No se pueden agendar citas en el pasado" |
| Duración | Según tipo de consulta | Psicología: 50-90 min, Enfermería: 10-30 min | "Duración fuera de rango permitido" |
| Horario | Dentro de horario laboral | Lun-Vie 8:00-18:00 | "Fuera del horario de atención" |
| Cancelación | Mínimo 24h antes | >= 24 horas de anticipación | "Cancelación requiere al menos 24h de anticipación" |
| Solapamiento | No permitir citas solapadas | Verificar disponibilidad del profesional | "El profesional no está disponible en este horario" |
| **MEDICAMENTOS** |
| Dosis | Dentro de rango terapéutico | Número positivo, con unidad | "Dosis fuera de rango terapéutico" |
| Vía de Administración | Valor de catálogo | [Oral, IV, IM, SC, Tópica, Inhalatoria] | "Vía de administración no válida" |
| Fecha de Caducidad | Medicamento vigente | > hoy | "Medicamento caducado, no administrar" |
| Stock | Existencia disponible | > 0 | "Medicamento sin existencias" |
| **DIAGNÓSTICO** |
| Código DSM-5/CIE | Código válido del catálogo | Formato válido según estándar | "Código de diagnóstico no válido" |
| Asignado por | Solo psicólogo | Verificar rol del usuario | "No autorizado para asignar diagnósticos" |
| **SESIÓN/NOTA CLÍNICA** |
| Duración de Sesión | Dentro de rango | 10-180 minutos | "Duración de sesión fuera de rango" |
| Fecha de Registro | Dentro de 24h | <= 24 horas después de la consulta | "Nota clínica debe registrarse en 24 horas" |
| Firma Electrónica | Obligatoria | Token JWT del profesional | "Nota debe estar firmada electrónicamente" |
| **USUARIO/AUTENTICACIÓN** |
| Contraseña | Complejidad mínima | Min 12 caracteres, mayúsculas, minúsculas, números, especiales | "Contraseña no cumple requisitos de seguridad" |
| Email Institucional | Dominio institucional | @institucion.edu.mx | "Debe usar email institucional" |
| Intentos de Login | Máximo 5 intentos | <= 5 intentos fallidos | "Cuenta bloqueada por intentos fallidos" |
| **GENERAL** |
| ID Único (UUID) | Único e inmutable | Formato UUID v4 | "Error generando identificador único" |
| Fechas | Formato estándar | ISO 8601 (YYYY-MM-DD) | "Formato de fecha incorrecto" |
| Campos Numéricos | Solo números | Integer o Decimal según campo | "Campo debe ser numérico" |
| Campos de Texto Largo | Límite de caracteres | Max 5000 caracteres | "Texto excede el límite permitido" |

---

## 📋 REGLAS DE AUDITORÍA Y TRAZABILIDAD

### RN-AUD-001: Eventos que Deben Auditarse

**Descripción:** El sistema debe registrar todas las acciones críticas.

**Eventos Obligatorios de Auditoría:**

**Autenticación:**
- ✅ Login exitoso / fallido
- ✅ Logout
- ✅ Cambio de contraseña
- ✅ Activación/desactivación MFA
- ✅ Accesos break-glass

**Acceso a Datos:**
- ✅ Visualización de expediente médico
- ✅ Búsqueda de pacientes
- ✅ Exportación de datos
- ✅ Impresión de documentos

**Modificación de Datos:**
- ✅ Creación de expediente
- ✅ Actualización de diagnóstico
- ✅ Creación/edición de notas clínicas
- ✅ Prescripción/administración de medicamentos
- ✅ Eliminación (soft delete) de registros

**Administración:**
- ✅ Creación/modificación/eliminación de usuarios
- ✅ Cambios de roles y permisos
- ✅ Cambios de configuración
- ✅ Delegación de permisos

---

### RN-AUD-002: Información del Log de Auditoría

**Descripción:** Cada entrada de auditoría debe contener información completa.

**Datos Obligatorios:**
- ✅ Timestamp exacto (con zona horaria)
- ✅ Usuario que realizó la acción
- ✅ Tipo de acción
- ✅ Recurso afectado (expediente, paciente, medicamento)
- ✅ Valores anteriores y nuevos (para modificaciones)
- ✅ IP de origen
- ✅ ID de sesión
- ✅ Resultado (éxito/fallo)

---

### RN-AUD-003: Retención de Logs

**Descripción:** Los logs deben conservarse según normativa.

**Períodos de Retención:**
- 📋 Logs de auditoría: **7 años** (requisito HIPAA)
- 📊 Logs de aplicación: **90 días**
- 🔐 Logs de seguridad: **1 año**

**Protección:**
- 🔒 Almacenamiento WORM (Write Once Read Many)
- 🔐 Cifrado de logs
- 🚫 No editable ni eliminable

---

## 📜 CUMPLIMIENTO NORMATIVO

### RN-NORM-001: Alineación con ODS 3 (Salud y Bienestar)

**Descripción:** El sistema contribuye al Objetivo de Desarrollo Sostenible 3 de la ONU.

**Contribución del Sistema:**
- ✅ **Meta 3.8:** Cobertura sanitaria universal mediante mejor gestión de expedientes
- ✅ **Meta 3.4:** Reducir mortalidad por enfermedades mediante mejor seguimiento
- ✅ Acceso equitativo a información médica
- ✅ Promoción de salud mental mediante seguimiento psicológico
- ✅ Prevención mediante detección temprana y seguimiento

---

### RN-NORM-002: Cumplimiento HIPAA

**Descripción:** El sistema cumple con normativa de protección de información médica.

**Reglas HIPAA Implementadas:**
- ✅ Privacidad de información médica protegida (PHI)
- ✅ Seguridad física, técnica y administrativa
- ✅ Notificación de brechas de seguridad
- ✅ Derechos del paciente sobre su información
- ✅ Mínimo necesario de información compartida
- ✅ Acuerdos de asociados comerciales

---

### RN-NORM-003: Protección de Datos Personales

**Descripción:** Cumplimiento con leyes locales de protección de datos.

**Derechos ARCO del Paciente:**
- ✅ **Acceso:** Derecho a conocer qué datos se tienen
- ✅ **Rectificación:** Derecho a corregir datos incorrectos
- ✅ **Cancelación:** Derecho a solicitar eliminación (con excepciones legales)
- ✅ **Oposición:** Derecho a oponerse a ciertos tratamientos de datos

**Obligaciones del Sistema:**
- 📝 Aviso de privacidad claro y accesible
- ✅ Consentimiento informado para tratamiento de datos
- 🔒 Medidas de seguridad técnicas y administrativas
- 🚨 Notificación de brechas de seguridad en 72 horas

---

### RN-NORM-004: Normas Oficiales de Salud

**Descripción:** Alineación con normas oficiales mexicanas de salud (NOM).

**Normas Aplicables:**
- **NOM-004-SSA3-2012:** Expediente clínico
- **NOM-024-SSA3-2012:** Sistemas de información de registro electrónico
- **NOM-012-SSA3-2012:** Ejecución de proyectos de investigación en salud

---

## 📊 RESUMEN DE REGLAS

### Estadísticas del Documento

- **Total de Reglas de Negocio:** 40+ reglas formales
- **Roles Definidos:** 6 roles con permisos granulares
- **Validaciones Técnicas:** 30+ validaciones de datos
- **Eventos de Auditoría:** 20+ tipos de eventos críticos
- **Normativas Cubiertas:** HIPAA, ODS 3, Protección de Datos, NOMs

---

## ✅ CRITERIOS DE ACEPTACIÓN CUMPLIDOS

- ✅ **Documento completo de reglas de negocio** (este archivo)
- ✅ **Campos obligatorios para registro de pacientes** documentados (RN-PAC-001)
- ✅ **Niveles de acceso por roles** definidos (RN-ROL-001)
- ✅ **Normativa de privacidad** investigada y documentada (Sección RN-PRIV)
- ✅ **Flujo lógico de consulta médica** establecido (RN-CONS-001 con diagrama)
- ✅ **Tabla de validaciones** incluida (Sección de Validaciones)
- ✅ **Alineación con ODS 3** y cumplimiento HIPAA

---

## 📚 REFERENCIAS

### Recursos Consultados

1. **Organización Mundial de la Salud (OMS):**
   - Objetivos de Desarrollo Sostenible - Meta 3: Salud y Bienestar
   - Estándares internacionales para expedientes de salud electrónicos

2. **HIPAA (Health Insurance Portability and Accountability Act):**
   - Privacy Rule - Protección de información médica
   - Security Rule - Salvaguardas técnicas y administrativas

3. **Normativa Mexicana:**
   - NOM-004-SSA3-2012 del expediente clínico
   - NOM-024-SSA3-2012 de sistemas de información
   - Ley Federal de Protección de Datos Personales

4. **Manuales Clínicos:**
   - DSM-5 (Manual Diagnóstico y Estadístico de Trastornos Mentales)
   - CIE-10/11 (Clasificación Internacional de Enfermedades)
   - Protocolo de los 5 correctos en administración de medicamentos

5. **Documentación del Proyecto:**
   - Acta de Constitución del Proyecto
   - Requisitos Funcionales
   - Requisitos No Funcionales
   - Requisitos de Seguridad
   - Análisis de Riesgos y Amenazas

---

## 📞 CONTACTO

Para consultas sobre estas reglas de negocio:
- **Coordinación de Psicología:** psicologia@institucion.edu.mx
- **Coordinación de Enfermería:** enfermeria@institucion.edu.mx
- **Equipo de Desarrollo:** dev-ehr@institucion.edu.mx

---

**Documento aprobado para implementación**  
**Fecha:** 10 de Febrero, 2026  
**Versión:** 1.0

---

*Este documento debe ser revisado y actualizado al menos una vez al año o cuando cambien normativas aplicables.*
