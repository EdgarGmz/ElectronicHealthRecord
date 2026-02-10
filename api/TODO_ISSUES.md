# Lista de Tareas Pendientes para la API (Roadmap de Desarrollo)

Este documento lista las tareas pendientes para el desarrollo de la API, organizadas por fases, con un plazo estimado para su finalización antes de **finales de febrero de 2026**. El objetivo es tener la API en un estado impecable antes de iniciar el desarrollo del frontend en marzo.

---

## Fase 1: Completar la Lógica de Negocio Central (Implementación de Placeholders)

- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Expedientes Médicos**.
- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Citas**.
- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Medicamentos/Prescripciones**.
- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Sesiones Terapéuticas**.
- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Evaluaciones Psicométricas**.
- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Interconsultas**.
- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Reportes**.
- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Registros de Auditoría**.
- [ ]  **Implementar todos los endpoints y la lógica de negocio** para el módulo de **Notificaciones**.
- [ ]  **Implementar validaciones de solicitudes detalladas** en todos los controladores relevantes usando `express-validator` y, si es necesario, `class-validator`/`Zod` para DTOs.

---

## Fase 2: Calidad del Código y Pruebas Rigurosas

- [ ]  **Desarrollar pruebas unitarias completas** para todas las capas de servicio (lógica de negocio).
- [ ]  **Desarrollar pruebas de integración** para todos los controladores y flujos críticos de la API utilizando Supertest.
- [ ]  **Asegurar una cobertura de pruebas mínima del 80%** (o un objetivo superior) para las rutas de código críticas.
- [ ]  **Revisar y aplicar las reglas de ESLint y Prettier** para garantizar una calidad y estilo de código consistentes.

---

## Fase 3: Seguridad y Optimización

- [ ]  **Implementar el "token blacklisting"** (por ejemplo, usando Redis) para invalidar JWTs cuando un usuario cierra sesión o en caso de compromiso.
- [ ]  **Asegurar un manejo robusto de errores** en todos los endpoints, utilizando la clase `AppError` personalizada y el middleware global de errores.
- [ ]  **Implementar mecanismos de caché** (por ejemplo, con `ioredis` para Redis) para datos accedidos frecuentemente o para operaciones costosas.
- [ ]  **Optimizar las consultas de Prisma** para prevenir problemas de N+1 y asegurar una recuperación de datos eficiente.
- [ ]  **Implementar un registro de auditoría detallado** para todas las acciones críticas del usuario y eventos del sistema.

---

## Fase 4: Funcionalidades Avanzadas y Preparación para Producción

- [ ]  **Implementar funcionalidades de manejo de archivos** (carga, procesamiento, generación) utilizando Multer, Sharp, PDFKit y Puppeteer donde sea requerido (ej., subida de documentos de pacientes, generación de informes en PDF).
- [ ]  **Integrar Nodemailer** para el envío de correos electrónicos transaccionales (ej., restablecimiento de contraseñas, notificaciones importantes).
- [ ]  **Implementar funcionalidades de comunicación en tiempo real** utilizando Socket.io si los requisitos del proyecto incluyen actualizaciones en vivo o chat.
- [ ]  **Configurar e implementar tareas programadas** (ej., generación de informes diarios, recordatorios de citas) utilizando `node-cron` o `node-schedule`.

---

## Fase 5: Documentación y Despliegue (Deployment)

- [ ]  **Generar la documentación de referencia completa de la API** utilizando TypeDoc.
- [ ]  **Actualizar `API_DOCUMENTATION.md`** con ejemplos detallados, modelos de datos y guías de uso para todos los endpoints implementados.
- [ ]  **Preparar los scripts de construcción para producción** y optimizar la aplicación para el despliegue (ej., minimización de código, configuración de variables de entorno específicas de producción).
- [ ]  **"Dockerizar" la aplicación** (crear `Dockerfile` y `docker-compose.yml`) para garantizar entornos consistentes en desarrollo, pruebas y producción.
- [ ]  **Seleccionar y configurar un proveedor de la nube** (ej., AWS, Google Cloud, Azure, Heroku) para alojar la API y la base de datos.
- [ ]  **Configurar un pipeline de CI/CD** (Integración Continua/Despliegue Continuo) para automatizar las pruebas, la construcción y el despliegue.
- [ ]  **Configurar monitoreo, agregación de logs y alertas** para el entorno de producción para garantizar la estabilidad y el rendimiento.

---

## Fase 6: Mantenimiento y Evolución (Post-entrega)

- [ ]  **Planificar e implementar estrategias de respaldo y restauración de la base de datos.**
- [ ]  **Establecer un plan de mantenimiento** para actualizaciones regulares, parches de seguridad y ajustes de rendimiento.
