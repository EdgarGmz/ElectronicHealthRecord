const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

// Convierte escala 1-10 a escala 1-5-9 (según documento AMEF-FMEA)
const sev10to159 = (s) => (s <= 3 ? 1 : s <= 6 ? 5 : 9);
const occ10to159 = (o) => (o <= 3 ? 1 : o <= 6 ? 5 : 9);
const det10to159 = (d) => (d <= 2 ? 1 : d <= 5 ? 5 : 9); // Alta detección = 1, Baja = 9

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
  ['Las escalas de Severidad, Ocurrencia y Detectabilidad están en la hoja "Tablas".'],
  ['Las definiciones de cada columna del FMEA están en la hoja "Ayuda".'],
  ['RPN = Severidad × Ocurrencia × Detectabilidad. Los valores pueden modificarse según criterio del equipo.'],
];

const wsPortada = XLSX.utils.aoa_to_sheet(portada);
wsPortada['!cols'] = [{ wch: 8 }, { wch: 70 }];
XLSX.utils.book_append_sheet(wb, wsPortada, 'Portada');

// ========== HOJA 2: TABLAS (según AMEF-FMEA.xlsx) ==========
const tablas = [
  ['Severidad / Impacto', '', ''],
  ['Desc', 'Valor', 'Definicion'],
  ['Alta', 9, 'Si el riesgo no se controla, es posible obtener una calificacion de "Reprobado"'],
  ['', '', 'Si el riesgo no se controla, el proyecto se retrasa de 10 a 20 dias o mas'],
  ['', '', 'Si el riesgo no se controla, se tendran costos de 300.00 pesos o mas'],
  ['Media', 5, 'Si el riesgo no se controla, es posible obtener una calificacion de 8'],
  ['', '', 'Si el riesgo no se controla, el proyecto se retrasa de 5 a 10 dias'],
  ['', '', 'Si el riesgo no se controla, se tendran costos de 150.00 a 300.00 pesos'],
  ['Baja', 1, 'Si el riesgo no se controla, es posible obtener una calificacion entre 9 y 10'],
  ['', '', 'Si el riesgo no se controla, el proyecto se retrasa de 1 a 5 dias'],
  ['', '', 'Si el riesgo no se controla, se tendran costos de 50.00 a 150.00 pesos'],
  ['', '', ''],
  ['Ocurrencia / Probabilidad', '', ''],
  ['Desc', 'Valor', 'Definicion'],
  ['Alta', 9, 'El riesgo, falla o sintoma sucedieron o estan sucediendo por mas de 5 veces'],
  ['Media', 5, 'El riesgo, falla o sintoma sucedieron o estan sucediendo entre 2 y 5 veces'],
  ['Baja', 1, 'El riesgo, falla o sintoma sucedieron o estan sucediendo entre 1 y 2 veces'],
  ['', '', ''],
  ['Detectabilidad', '', ''],
  ['Desc', 'Valor', 'Definicion'],
  ['Alta', 1, 'Se tienen los controles y procesos para detectar con anticipacion el riesgo o falla'],
  ['Media', 5, 'Se tienen controles, pero el proceso no se sigue correctamente'],
  ['Baja', 9, 'No se tienen controles ni procesos para detectar con anticipacion el riesgo o falla'],
];

const wsTablas = XLSX.utils.aoa_to_sheet(tablas);
wsTablas['!cols'] = [{ wch: 28 }, { wch: 8 }, { wch: 75 }];
XLSX.utils.book_append_sheet(wb, wsTablas, 'Tablas');

// ========== HOJA 3: AYUDA (según AMEF-FMEA.xlsx) ==========
const ayuda = [
  ['Proceso/Función', 'En un proyecto de TI, se recomienda usar los procesos o areas de conocimiento de la Administracion de Proyectos como Inicio, Planeacion, Ejecucion, Monitoreo y Control, Cierre, Gestion de Tiempo, Gestion de Recursos Humanos, Gestion de Costos, Gestion de Comunicacion, Gestion del alcance por mencionar algunos. Tambien se recomienda usar las fases de desarrollo como Analisis, Diseño, Codificacion, Pruebas e Implementacion'],
  ['Modo de Falla Potencial', 'Descripcion de lo que puede fallar en el proceso definido, tanto de equipos que no esten a tiempo o fallas en la configuracion, tambien de conocimientos y habilidades de las personas, procesos no definidos o no estan claros, problemas de comunicación entre el equipo o el cliente, falta de trabajo en equipo, falta de seguimiento del Administrador de proyectos, No se toman decisiones en tiempo, No existe un plan, cambios de alcance del cliente (cada vez se piden mas cosas)'],
  ['Severidad', 'Especificar la severidad de la falla en base al impacto que tendra sobre el proyecto. Ver la tabla de clasificacion de severidad'],
  ['Efecto(s) Potencial(es) de la Falla', 'Especificar el efecto que tendrá la falla mencionada: Normalmente afecta el tiempo, calidad, costo o alcance. Es importante especificar "cuanto" afecta, por ejemplo: Retraso de 3 días en la ruta critica'],
  ['Ocurrencia', 'Especificar la frecuencia de los sintomas o la frecuencia sobre fallas similares previas del mismo proyecto o de otros proyectos. Ver la tabla de clasificacion de ocurrencia'],
  ['Proceso(s) de control actual(es)', 'Especificar si se tiene algun control actual para asegurar que no haya falla o bien identificar sintomas de la falla que ayuden a hacer acciones preventivas. Por ejemplo, si las personas del equipo no conocen PHP, tener ya un plan de entrenamiento definido para que puedan tomarlo previamente o al menos en paralelo cuando esten codificando'],
  ['Detectabilidad', 'En base a los controles que se tengan, se identifica si podemos identificar la falla de manera fácil o no tenemos manera de identificarlo. Ver la tabla de clasificacion de detectabilidad'],
  ['RPN', 'Risk Priority Number. Es el numero que dará prioridad a los riesgos. Es importante generar acciones para los riesgos con el numero mas alto para bajar de mejor manera el riesgo de TODO el proyecto'],
  ['Acciones recomendadas', 'Especificar las acciones/actividades a realizar para eliminar, mitigar, transferir el riesgo de esta falla'],
  ['Responsable', 'Definir el responsable del equipo que dará seguimiento a las acciones a realizar. Pueden ser varios responsables, dependiendo de la falla'],
  ['Acciones tomadas en (fecha)', 'Especificar la fecha en que las acciones deben quedar listas. En esta fecha debemos calcular nuevamente el RPN actualizando Severidad, Ocurrencia y Detectabilidad'],
  ['', ''],
];

const wsAyuda = XLSX.utils.aoa_to_sheet(ayuda);
wsAyuda['!cols'] = [{ wch: 32 }, { wch: 140 }];
XLSX.utils.book_append_sheet(wb, wsAyuda, 'Ayuda');

// ========== HOJA 4: FMEA (estructura según AMEF-FMEA.xlsx) ==========
const fmeaTitle = [
  ['AMEF/FMEA - Analisis de Modo de Falla y Efecto / Failure Mode and Effect Analysis', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', '', 'Resultados de las Acciones Tomadas', '', '', '', ''],
  ['Proceso/Función', 'Modo de Falla Potencial', 'Efecto(s) Potencial(es) de la Falla', 'Sev', 'Causa Potencial de la falla / Mecanismo de Falla', 'Occ', 'Proceso(s) de control actual(es)', 'Det', 'RPN', 'Acciones Recomendadas', 'Responsable', 'Acciones tomadas en (fecha)', 'Sev', 'Occ', 'Det', 'RPN'],
];

// Datos de riesgos: [Proceso, ModoFalla, Efecto, Sev(1-10), Causa, Occ(1-10), Control, Det(1-10), Acciones, Responsable]
const riesgosData = [
  ['Análisis', 'Requisitos incompletos o ambiguos', 'Retrabajo en diseño y desarrollo; fallas en producción', 6, 'Falta de participación de usuarios/stakeholders; documentación insuficiente', 5, 'Reuniones con Dept. Psicología y Enfermería; documento de requisitos', 4, 'Validación formal con clientes; trazabilidad requisitos-casos de prueba', 'PM / Tech Lead'],
  ['Análisis', 'Riesgos de seguridad no identificados', 'Vulnerabilidades en sistema; violación HIPAA o PHI', 8, 'Análisis de riesgos superficial; no considerar OWASP/HIPAA desde inicio', 4, 'Documento de análisis de riesgos y amenazas', 5, 'Threat modeling en fase de diseño; revisión con TI', 'PM / Backend Dev 1'],
  ['Diseño', 'Arquitectura insegura o no escalable', 'Fallas de rendimiento; brechas de seguridad difíciles de corregir', 7, 'Decisiones de arquitectura sin revisión; falta de estándares', 4, 'Documentación API OpenAPI; diseño de BD', 5, 'Revisión de arquitectura (security review); documentar decisiones', 'PM / Tech Lead'],
  ['Diseño', 'API o esquema de BD mal definidos', 'Cambios costosos en codificación; incompatibilidad frontend-backend', 6, 'Especificación OpenAPI incompleta; ER no normalizado', 5, 'OpenAPI 3.0; diagrama ER; Prisma schema', 3, 'Validar API con equipo frontend; revisión de esquema con backend', 'Backend Dev 1'],
  ['Codificación', 'Inyección SQL o XSS', 'Fuga de datos PHI; robo de sesiones; compromiso de integridad', 9, 'Validación/sanitización insuficiente; consultas dinámicas', 3, 'TypeORM; express-validator; Helmet CSP', 4, 'Consultas parametrizadas; sanitización en cliente y servidor; WAF', 'Backend Dev 1 y 2'],
  ['Codificación', 'Credenciales o secretos en repositorio', 'Acceso no autorizado a sistemas; compromiso de cuentas', 8, 'Commits con .env o claves; falta de gestión de secretos', 5, '.gitignore; no hardcodear secretos', 6, 'HashiCorp Vault o variables de entorno; escaneo en CI (detect-secrets)', 'PM / Backend Dev 1'],
  ['Codificación', 'Control de acceso RBAC insuficiente', 'Acceso no autorizado a expedientes; escalación de privilegios', 8, 'Endpoints sin validación de rol; lógica de permisos incompleta', 4, 'Middleware authorizeRoles; roles en JWT', 5, 'Tests de autorización en CI; revisión de cada endpoint protegido', 'Backend Dev 1'],
  ['Codificación', 'Vulnerabilidades en dependencias (npm)', 'Explotación de CVEs conocidos; compromiso de la aplicación', 7, 'Dependencias desactualizadas o con vulnerabilidades', 6, 'npm audit; lock file', 5, 'Dependabot/Snyk; actualizaciones regulares; parchear críticos en < 7 días', 'Backend Dev 1 y 2'],
  ['Pruebas', 'Bugs críticos no detectados', 'Fallas en producción; pérdida de datos o indisponibilidad', 7, 'Cobertura de pruebas insuficiente; no pruebas E2E de flujos críticos', 5, 'Jest; tests unitarios e integración; manual E2E', 6, 'Aumentar cobertura; automatizar E2E (Playwright/Cypress); pruebas de regresión', 'QA Engineer / Frontend Dev 2'],
  ['Pruebas', 'Pruebas de seguridad inexistentes', 'Vulnerabilidades en producción; violación de cumplimiento', 8, 'No SAST/DAST; no pentesting ni revisión OWASP', 6, 'Revisión manual de código', 7, 'SAST (SonarQube); DAST (OWASP ZAP); pentesting semestral', 'QA Engineer / Backend Dev 1'],
  ['Pruebas', 'Rendimiento no validado bajo carga', 'Sistema lento o caído con 22+ usuarios concurrentes', 6, 'No load testing; no definir métricas de rendimiento', 5, 'Pruebas manuales', 6, 'Load testing (k6/Artillery); definir SLA ≤3s; monitoreo en producción', 'QA Engineer'],
  ['Implementación', 'Pérdida de BD sin recuperación', 'Pérdida total de expedientes PHI; imposible cumplir HIPAA', 10, 'Backups inexistentes o no probados; sin replicación', 3, 'Backups programados (definir en implementación)', 5, 'Backups incrementales; replicación; pruebas de restauración mensuales; RTO < 4h', 'Backend Dev 1 / PM'],
  ['Implementación', 'Configuración CORS/firewall incorrecta', 'API expuesta a orígenes no autorizados; ataques cross-origin', 6, 'CORS con wildcard; reglas de firewall permisivas', 4, 'CORS configurado en Express', 5, 'Whitelist estricta de orígenes; no usar * en producción', 'Backend Dev 1'],
  ['Implementación', 'Certificados SSL/TLS vencidos', 'Interrupción del servicio; avisos de inseguridad al usuario', 5, 'Renovación manual; sin monitoreo de vencimiento', 4, 'HTTPS configurado', 6, "Let's Encrypt + certbot; alertas 30 días antes de vencimiento", 'Backend Dev 1 / Dept. TI'],
  ['Documentación', 'Documentación de API desactualizada', 'Integración incorrecta; retrasos en desarrollo y soporte', 5, 'OpenAPI no actualizado con cambios en código', 6, 'openapi.yaml en repo', 4, 'Generar OpenAPI desde código o CI que exija actualización', 'Backend Dev 1'],
  ['Documentación', 'Falta de documentación de seguridad', 'Desarrolladores introducen vulnerabilidades; onboarding lento', 5, 'No hay guías de secure coding ni runbooks de incidentes', 6, 'Documento de análisis de riesgos', 5, 'Secure coding guidelines; runbooks de respuesta a incidentes', 'PM / Backend Dev 1'],
  ['Administración de proyectos', 'Plazos no cumplidos', 'Entrega tardía; desconfianza del cliente o profesor', 5, 'Estimaciones optimistas; dependencias no gestionadas', 6, 'Plan de Trabajo MS Project; reuniones semanales', 3, 'Buffer en cronograma; revisión de avance cada viernes; priorización', 'PM'],
  ['Administración de proyectos', 'Alcance no controlado (scope creep)', 'Retrabajo; retrasos; calidad comprometida', 6, 'Requisitos que cambian sin control; aceptar cambios sin evaluar', 5, 'Acta de constitución; hitos definidos', 5, 'Proceso de cambio formal; aprobación de stakeholders para cambios mayores', 'PM'],
  ['Administración de proyectos', 'Falta de respuesta a incidentes', 'Tiempo de recuperación largo; daño extendido', 7, 'No hay IRP; equipo no sabe cómo actuar ante incidente', 5, 'Logs y auditoría', 7, 'Plan de respuesta a incidentes documentado; simulacros semestrales', 'PM / Backend Dev 1'],
  ['Implementación', 'Datos PHI en logs o mensajes de error', 'Exposición de información sensible; violación HIPAA', 8, 'Logs con datos personales; stack traces al cliente', 5, 'Manejo de errores genérico al cliente', 6, 'Logs sin PHI; mensajes genéricos al usuario; revisión de todos los log points', 'Backend Dev 1 y 2'],
];

const fmeaRows = riesgosData.map((r) => {
  const sev = sev10to159(r[3]);
  const occ = occ10to159(r[5]);
  const det = det10to159(r[7]);
  const rpn = sev * occ * det;
  return [
    r[0],  // Proceso/Función
    r[1],  // Modo de Falla Potencial
    r[2],  // Efecto(s) Potencial(es)
    sev,   // Sev (1,5,9)
    r[4],  // Causa Potencial
    occ,   // Occ (1,5,9)
    r[6],  // Procesos de control actuales
    det,   // Det (1,5,9)
    rpn,   // RPN
    r[8],  // Acciones Recomendadas
    r[9],  // Responsable
    '',    // Acciones tomadas en (fecha)
    '',    // Sev (resultado)
    '',    // Occ (resultado)
    '',    // Det (resultado)
    '',    // RPN (resultado)
  ];
});

const fmeaData = [...fmeaTitle, ...fmeaRows];
const wsFmea = XLSX.utils.aoa_to_sheet(fmeaData);
wsFmea['!cols'] = [
  { wch: 24 }, { wch: 36 }, { wch: 42 }, { wch: 5 }, { wch: 44 },
  { wch: 5 }, { wch: 38 }, { wch: 5 }, { wch: 6 }, { wch: 48 },
  { wch: 22 }, { wch: 22 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 6 },
];
XLSX.utils.book_append_sheet(wb, wsFmea, 'FMEA');

const outPath = path.join(__dirname, 'FMEA – Electronic Health Record.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Archivo creado:', outPath);
