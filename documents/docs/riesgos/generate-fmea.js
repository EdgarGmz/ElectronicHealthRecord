const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

// ========== HOJA 1: PORTADA ==========
const portada = [
  ['FMEA / AMEF - GESTIÓN DE RIESGOS DEL PROYECTO'],
  [],
  ['NOMBRE DEL PROYECTO'],
  ['Electronic Health Record (EHR) System'],
  ['Sistema de Registro de Salud Electrónico - Departamentos Enfermería y Psicología'],
  [],
  ['INTEGRANTES DEL PROYECTO'],
  ['Edgar Tiburcio Gómez Morán - Project Manager & Tech Lead'],
  ['[Integrante 2] - Backend Developer'],
  ['[Integrante 3] - Backend Developer'],
  ['[Integrante 4] - Frontend Developer'],
  ['[Integrante 5] - Frontend Developer'],
  ['[Integrante 6] - UI/UX Designer'],
  ['[Integrante 7] - QA Engineer'],
  ['(Modificar los nombres según los integrantes reales del equipo)'],
  [],
  ['DEFINICIÓN DE PROBABILIDAD (Ocurrencia) - Escala 1-10'],
  ['Escala', 'Descripción', 'Frecuencia estimada'],
  [1, 'Remoto', 'Menos de 1 en 1,000,000'],
  [2, 'Muy baja', 'Menos de 1 en 100,000'],
  [3, 'Baja', '1 en 100,000'],
  [4, 'Baja-media', '1 en 10,000'],
  [5, 'Media', '1 en 1,000'],
  [6, 'Media-alta', '1 en 500'],
  [7, 'Alta', '1 en 100'],
  [8, 'Muy alta', '1 en 20'],
  [9, 'Muy alta+', '1 en 10'],
  [10, 'Casi seguro', 'Mayor de 1 en 10'],
  [],
  ['DEFINICIÓN DE IMPACTO (Severidad) - Escala 1-10'],
  ['Escala', 'Descripción', 'Efecto'],
  [1, 'Insignificante', 'Sin efecto en seguridad, cumplimiento ni operación'],
  [2, 'Muy bajo', 'Molestia menor, sin impacto real'],
  [3, 'Bajo', 'Inconveniente temporal, bajo costo de resolución'],
  [4, 'Bajo-medio', 'Daño menor a reputación o productividad'],
  [5, 'Medio', 'Interrupción de servicios, pérdida de productividad'],
  [6, 'Medio-alto', 'Daño significativo a confianza o cumplimiento'],
  [7, 'Alto', 'Violación regulatoria (ej. HIPAA), daño reputacional mayor'],
  [8, 'Muy alto', 'Pérdida masiva de datos PHI, demandas legales'],
  [9, 'Crítico', 'Catástrofe operativa o legal, cierre del servicio'],
  [10, 'Catastrófico', 'Pérdida total, impacto en vidas o institución'],
  [],
  ['DEFINICIÓN DE DETECTABILIDAD - Escala 1-10'],
  ['Escala', 'Descripción'],
  [1, 'Muy alta detección - Casi siempre se detecta antes del impacto'],
  [2, 'Alta detección'],
  [3, 'Detección buena'],
  [4, 'Detección media-alta'],
  [5, 'Detección media'],
  [6, 'Detección media-baja'],
  [7, 'Detección baja'],
  [8, 'Baja detección'],
  [9, 'Muy baja - Rara vez se detecta a tiempo'],
  [10, 'No detectable - No hay control que lo detecte'],
  [],
  ['ÍNDICE RPN (Número de Prioridad de Riesgo) = Severidad x Ocurrencia x Detectabilidad'],
  ['Los valores de esta hoja y de la hoja "Tablas FMEA" pueden ser modificados por el equipo según criterio acordado.'],
];

const wsPortada = XLSX.utils.aoa_to_sheet(portada);
wsPortada['!cols'] = [{ wch: 8 }, { wch: 50 }, { wch: 45 }];
XLSX.utils.book_append_sheet(wb, wsPortada, 'Portada');

// ========== HOJA 2: TABLAS FMEA ==========
const headers = [
  'No.',
  'Proceso / Función',
  'Modo de Falla Potencial (Riesgo)',
  'Efecto(s) Potencial(es) de la Falla',
  'Severidad (Impacto) 1-10',
  'Causa Potencial de Falla',
  'Ocurrencia (Probabilidad) 1-10',
  'Procesos de control actuales',
  'Detectabilidad 1-10',
  'RPN (SxOxD)',
  'Acciones recomendadas',
  'Responsable',
];

const riesgos = [
  [1, 'Análisis', 'Requisitos incompletos o ambiguos', 'Retrabajo en diseño y desarrollo; fallas en producción', 6, 'Falta de participación de usuarios/stakeholders; documentación insuficiente', 5, 'Reuniones con Dept. Psicología y Enfermería; documento de requisitos', 4, 120, 'Validación formal con clientes; trazabilidad requisitos-casos de prueba', 'PM / Tech Lead'],
  [2, 'Análisis', 'Riesgos de seguridad no identificados', 'Vulnerabilidades en sistema; violación HIPAA o PHI', 8, 'Análisis de riesgos superficial; no considerar OWASP/HIPAA desde inicio', 4, 'Documento de análisis de riesgos y amenazas', 5, 160, 'Threat modeling en fase de diseño; revisión con TI', 'PM / Backend Dev 1'],
  [3, 'Diseño', 'Arquitectura insegura o no escalable', 'Fallas de rendimiento; brechas de seguridad difíciles de corregir', 7, 'Decisiones de arquitectura sin revisión; falta de estándares', 4, 'Documentación API OpenAPI; diseño de BD', 5, 140, 'Revisión de arquitectura (security review); documentar decisiones', 'PM / Tech Lead'],
  [4, 'Diseño', 'API o esquema de BD mal definidos', 'Cambios costosos en codificación; incompatibilidad frontend-backend', 6, 'Especificación OpenAPI incompleta; ER no normalizado', 5, 'OpenAPI 3.0; diagrama ER; Prisma schema', 3, 90, 'Validar API con equipo frontend; revisión de esquema con backend', 'Backend Dev 1'],
  [5, 'Codificación', 'Inyección SQL o XSS', 'Fuga de datos PHI; robo de sesiones; compromiso de integridad', 9, 'Validación/sanitización insuficiente; consultas dinámicas', 3, 'TypeORM; express-validator; Helmet CSP', 4, 108, 'Consultas parametrizadas; sanitización en cliente y servidor; WAF', 'Backend Dev 1 y 2'],
  [6, 'Codificación', 'Credenciales o secretos en repositorio', 'Acceso no autorizado a sistemas; compromiso de cuentas', 8, 'Commits con .env o claves; falta de gestión de secretos', 5, '.gitignore; no hardcodear secretos', 6, 240, 'HashiCorp Vault o variables de entorno; escaneo en CI (detect-secrets)', 'PM / Backend Dev 1'],
  [7, 'Codificación', 'Control de acceso RBAC insuficiente', 'Acceso no autorizado a expedientes; escalación de privilegios', 8, 'Endpoints sin validación de rol; lógica de permisos incompleta', 4, 'Middleware authorizeRoles; roles en JWT', 5, 160, 'Tests de autorización en CI; revisión de cada endpoint protegido', 'Backend Dev 1'],
  [8, 'Codificación', 'Vulnerabilidades en dependencias (npm)', 'Explotación de CVEs conocidos; compromiso de la aplicación', 7, 'Dependencias desactualizadas o con vulnerabilidades', 6, 'npm audit; lock file', 5, 210, 'Dependabot/Snyk; actualizaciones regulares; parchear críticos en < 7 días', 'Backend Dev 1 y 2'],
  [9, 'Pruebas', 'Bugs críticos no detectados', 'Fallas en producción; pérdida de datos o indisponibilidad', 7, 'Cobertura de pruebas insuficiente; no pruebas E2E de flujos críticos', 5, 'Jest; tests unitarios e integración; manual E2E', 6, 210, 'Aumentar cobertura; automatizar E2E (Playwright/Cypress); pruebas de regresión', 'QA Engineer / Frontend Dev 2'],
  [10, 'Pruebas', 'Pruebas de seguridad inexistentes', 'Vulnerabilidades en producción; violación de cumplimiento', 8, 'No SAST/DAST; no pentesting ni revisión OWASP', 6, 'Revisión manual de código', 7, 336, 'SAST (SonarQube); DAST (OWASP ZAP); pentesting semestral', 'QA Engineer / Backend Dev 1'],
  [11, 'Pruebas', 'Rendimiento no validado bajo carga', 'Sistema lento o caído con 22+ usuarios concurrentes', 6, 'No load testing; no definir métricas de rendimiento', 5, 'Pruebas manuales', 6, 180, 'Load testing (k6/Artillery); definir SLA ≤3s; monitoreo en producción', 'QA Engineer'],
  [12, 'Implementación', 'Pérdida de BD sin recuperación', 'Pérdida total de expedientes PHI; imposible cumplir HIPAA', 10, 'Backups inexistentes o no probados; sin replicación', 3, 'Backups programados (definir en implementación)', 5, 150, 'Backups incrementales; replicación; pruebas de restauración mensuales; RTO < 4h', 'Backend Dev 1 / PM'],
  [13, 'Implementación', 'Configuración CORS/firewall incorrecta', 'API expuesta a orígenes no autorizados; ataques cross-origin', 6, 'CORS con wildcard; reglas de firewall permisivas', 4, 'CORS configurado en Express', 5, 120, 'Whitelist estricta de orígenes; no usar * en producción', 'Backend Dev 1'],
  [14, 'Implementación', 'Certificados SSL/TLS vencidos', 'Interrupción del servicio; avisos de inseguridad al usuario', 5, 'Renovación manual; sin monitoreo de vencimiento', 4, 'HTTPS configurado', 6, 120, 'Let\'s Encrypt + certbot; alertas 30 días antes de vencimiento', 'Backend Dev 1 / Dept. TI'],
  [15, 'Documentación', 'Documentación de API desactualizada', 'Integración incorrecta; retrasos en desarrollo y soporte', 5, 'OpenAPI no actualizado con cambios en código', 6, 'openapi.yaml en repo', 4, 120, 'Generar OpenAPI desde código o CI que exija actualización', 'Backend Dev 1'],
  [16, 'Documentación', 'Falta de documentación de seguridad', 'Desarrolladores introducen vulnerabilidades; onboarding lento', 5, 'No hay guías de secure coding ni runbooks de incidentes', 6, 'Documento de análisis de riesgos', 5, 150, 'Secure coding guidelines; runbooks de respuesta a incidentes', 'PM / Backend Dev 1'],
  [17, 'Administración de proyectos', 'Plazos no cumplidos', 'Entrega tardía; desconfianza del cliente o profesor', 5, 'Estimaciones optimistas; dependencias no gestionadas', 6, 'Plan de Trabajo MS Project; reuniones semanales', 3, 90, 'Buffer en cronograma; revisión de avance cada viernes; priorización', 'PM'],
  [18, 'Administración de proyectos', 'Alcance no controlado (scope creep)', 'Retrabajo; retrasos; calidad comprometida', 6, 'Requisitos que cambian sin control; aceptar cambios sin evaluar', 5, 'Acta de constitución; hitos definidos', 5, 150, 'Proceso de cambio formal; aprobación de stakeholders para cambios mayores', 'PM'],
  [19, 'Administración de proyectos', 'Falta de respuesta a incidentes', 'Tiempo de recuperación largo; daño extendido', 7, 'No hay IRP; equipo no sabe cómo actuar ante incidente', 5, 'Logs y auditoría', 7, 245, 'Plan de respuesta a incidentes documentado; simulacros semestrales', 'PM / Backend Dev 1'],
  [20, 'Implementación', 'Datos PHI en logs o mensajes de error', 'Exposición de información sensible; violación HIPAA', 8, 'Logs con datos personales; stack traces al cliente', 5, 'Manejo de errores genérico al cliente', 6, 240, 'Logs sin PHI; mensajes genéricos al usuario; revisión de todos los log points', 'Backend Dev 1 y 2'],
];

const rowsFmea = [headers, ...riesgos.map((r) => r.map((c) => (typeof c === 'number' ? c : String(c))))];
const wsTablas = XLSX.utils.aoa_to_sheet(rowsFmea);
wsTablas['!cols'] = [
  { wch: 4 },
  { wch: 22 },
  { wch: 38 },
  { wch: 42 },
  { wch: 10 },
  { wch: 42 },
  { wch: 12 },
  { wch: 38 },
  { wch: 12 },
  { wch: 10 },
  { wch: 48 },
  { wch: 22 },
];
XLSX.utils.book_append_sheet(wb, wsTablas, 'Tablas FMEA');

const outPath = path.join(__dirname, 'FMEA – Electronic Health Record.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Archivo creado:', outPath);
