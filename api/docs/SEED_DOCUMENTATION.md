# 🌱 Documentación del Script de Seed

## Descripción General

El script de seed (`prisma/seed.ts`) es una herramienta diseñada para poblar la base de datos con datos realistas de prueba, simulando un entorno de producción. Utiliza la librería `@faker-js/faker` para generar datos consistentes y la función `bcrypt` para hashear contraseñas de forma segura.

## 🎯 Propósito

Este script es esencial para:

- **Desarrollo Frontend**: Proporciona datos realistas para desarrollar y probar la interfaz de usuario
- **Pruebas de Rendimiento**: Permite realizar pruebas de carga y estrés con un volumen significativo de datos
- **Onboarding de Desarrolladores**: Elimina el problema del "huevo y la gallina" al proporcionar un entorno completo desde el inicio
- **Testing de Consultas**: Asegura que las consultas complejas y reportes funcionen correctamente con datos realistas
- **Demostración**: Facilita la demostración del sistema con datos completos

## 📊 Datos Generados

### Resumen de Entidades

El script genera datos para las siguientes entidades, respetando todas las relaciones y restricciones:

| Entidad | Cantidad | Descripción |
|---------|----------|-------------|
| `Career` | 10 | Carreras universitarias |
| `User` | 61+ | Usuarios con diferentes roles |
| `Patient` | 49+ | Registros de pacientes vinculados a usuarios |
| `PsychologistCareer` | 6+ | Asignaciones de psicólogos a carreras |
| `EmergencyContact` | 75+ | 1-2 contactos por paciente |
| `MedicalRecord` | 49+ | Un registro médico por paciente |
| `PsychologyRecord` | 49+ | Un registro psicológico por expediente médico |
| `TherapySession` | 470+ | 5-15 sesiones por registro psicológico |
| `TreatmentPlan` | 75+ | Planes de tratamiento |
| `PsychometricEvaluation` | 56+ | 1-3 evaluaciones para subconjunto de pacientes |
| `NursingConsultation` | 130+ | 2-10 consultas para subconjunto de pacientes |
| `NursingProcedure` | 75+ | 1-2 procedimientos por algunas consultas |
| `Medication` | 30 | Catálogo de medicamentos comunes |
| `Prescription` | 22+ | Prescripciones para 20-30% de pacientes |
| `MedicationAdministration` | 39+ | Administraciones de medicamentos |
| `Appointment` | 620+ | 5-20 citas por paciente |
| `ProfessionalSchedule` | 35+ | Horarios para todos los profesionales |
| `Interconsultation` | 9+ | Interconsultas entre departamentos |
| `Notification` | 275+ | 2-7 notificaciones por usuario |

### Distribución de Roles

Los usuarios se crean con la siguiente distribución:

- **~80%** Pacientes/Estudiantes
- **~10%** Psicólogos
- **~5%** Enfermeras
- **1** Coordinador de Psicología
- **1** Coordinador de Enfermería
- **1** Administrador del Sistema

## 🚀 Uso

### Ejecución Básica

Para poblar la base de datos con datos de prueba:

```bash
npx prisma db seed
```

### Primera Vez

Si es la primera vez que ejecutas el script en una base de datos recién migrada:

```bash
# 1. Aplicar migraciones
npx prisma migrate deploy

# 2. Ejecutar seed
npx prisma db seed
```

### Reiniciar y Repoblar

Para eliminar todos los datos actuales y repoblar desde cero:

```bash
npx prisma migrate reset
```

Este comando:
1. Elimina toda la base de datos
2. Aplica todas las migraciones
3. Ejecuta automáticamente el script de seed

## 🔐 Cuentas de Prueba

El script crea las siguientes cuentas predefinidas:

### Administrador

```
Email: admin@ehr-system.com
Password: Password123!
Rol: admin
```

### Coordinadores

```
Email: coord.psicologia@ehr-system.com
Password: Password123!
Rol: psychology_coordinator
```

```
Email: coord.enfermeria@ehr-system.com
Password: Password123!
Rol: nursing_coordinator
```

### Profesionales

```
Email: psicologo1@ehr-system.com (hasta psicologo6@ehr-system.com)
Password: Password123!
Rol: psychologist
```

```
Email: enfermera1@ehr-system.com (hasta enfermera3@ehr-system.com)
Password: Password123!
Rol: nurse
```

### Pacientes

```
Email: estudiante1@ehr-system.com (hasta estudiante49@ehr-system.com)
Password: Password123!
Rol: patient
```

**⚠️ Importante:** Estas contraseñas son solo para desarrollo. **Nunca** uses estas credenciales en producción.

## 🔄 Idempotencia

El script de seed es **idempotente**, lo que significa que puede ejecutarse múltiples veces sin crear registros duplicados.

### Comportamiento

- **Primera ejecución**: Crea todos los datos desde cero
- **Ejecuciones subsiguientes**: Detecta que ya existen datos y muestra un mensaje informativo sin crear duplicados

### Mensaje cuando ya existen datos

```
⚠️  Database already contains 61 users.
   To re-seed, first reset the database with: npx prisma migrate reset
   Or manually delete existing data.
```

## 🛠️ Personalización

### Modificar la Cantidad de Datos

Puedes ajustar las constantes en `prisma/seed.ts`:

```typescript
const MIN_PATIENTS = 50;  // Cambia esto para más/menos pacientes
```

### Agregar Nuevas Entidades

Para agregar seed para nuevas entidades:

1. Crea una función `seed[NombreEntidad]` siguiendo el patrón existente
2. Agrégala a la función `main()` en el orden apropiado según dependencias
3. Usa `faker` para generar datos realistas
4. Respeta las relaciones de clave foránea

Ejemplo:

```typescript
async function seedNewEntity(relatedData: any[]) {
  console.log('🆕 Seeding New Entity...');
  
  for (const item of relatedData) {
    await prisma.newEntity.create({
      data: {
        name: faker.person.fullName(),
        relatedId: item.id,
        // ... más campos
      },
    });
  }
  
  console.log('✅ Created new entities');
}
```

## 🔒 Seguridad

### Hashing de Contraseñas

Todas las contraseñas se hashean con `bcrypt` usando 10 rondas de salt:

```typescript
const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
```

### Datos Generados

- Los datos son **completamente ficticios** y generados por Faker
- No se utilizan datos reales de personas
- Los números de teléfono, correos, y nombres son aleatorios
- Los datos médicos son solo ejemplos ilustrativos

## 📝 Datos Generados por Categoría

### Carreras Universitarias

Se crean 10 carreras reales:
- Ingeniería en Sistemas Computacionales (ISC)
- Ingeniería Industrial (IND)
- Ingeniería Electrónica (IEL)
- Ingeniería Mecánica (IMC)
- Arquitectura (ARQ)
- Licenciatura en Administración (LAD)
- Contador Público (CP)
- Ingeniería Civil (ICL)
- Ingeniería Química (IQM)
- Licenciatura en Biología (LBI)

### Medicamentos

Se incluye un catálogo de 30 medicamentos comunes con:
- Nombre comercial y genérico
- Categoría farmacológica
- Formas de dosificación
- Vías de administración
- Contraindicaciones y efectos secundarios (cuando aplica)

Ejemplos:
- Paracetamol (Analgésico)
- Amoxicilina (Antibiótico)
- Sertraline (SSRI - Antidepresivo)
- Insulina Glargina (Tratamiento de diabetes)

### Datos Médicos

Los datos médicos generados incluyen:
- Tipos de sangre realistas (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Alergias e historial médico simulado
- Signos vitales con valores dentro de rangos normales
- Diagnósticos en formato DSM-5 y CIE-10
- Notas clínicas descriptivas

### Citas y Consultas

Las citas se generan con:
- **Estados variados**: completed, cancelled, scheduled, no_show
- **80% citas pasadas**, 20% futuras
- **Distribución temporal**: Fechas distribuidas a lo largo del último año
- **Duración realista**: 30, 45, 50 o 60 minutos

## 🐛 Troubleshooting

### Error: "Table does not exist"

Si recibes errores sobre tablas que no existen:

```bash
# Asegúrate de que todas las migraciones estén aplicadas
npx prisma migrate deploy

# O resetea completamente
npx prisma migrate reset
```

### Error: "Unique constraint failed"

Esto indica que estás intentando crear datos duplicados. Para resolverlo:

```bash
# Opción 1: Resetear la base de datos
npx prisma migrate reset

# Opción 2: Eliminar datos manualmente
npx prisma studio  # y eliminar registros desde la UI
```

### El seed tarda mucho tiempo

Esto es normal. Crear 1000+ registros con relaciones complejas puede tomar 1-3 minutos. Si necesitas menos datos:

1. Edita `prisma/seed.ts`
2. Reduce `MIN_PATIENTS` a un valor menor (ej., 20)
3. Vuelve a ejecutar el seed

## 📚 Referencias

- [Prisma Seeding Guide](https://www.prisma.io/docs/guides/database/seed-database)
- [Faker.js Documentation](https://fakerjs.dev/)
- [Bcrypt NPM Package](https://www.npmjs.com/package/bcrypt)

## 🤝 Contribución

Si deseas mejorar el script de seed:

1. Mantén la idempotencia
2. Asegúrate de que los datos sean consistentes con las relaciones
3. Utiliza Faker para todos los datos generados
4. Documenta cualquier cambio en esta guía
5. Prueba el script en una base de datos limpia antes de hacer commit

## ⚡ Tips de Rendimiento

- El script usa operaciones `create` simples para máxima compatibilidad
- Para bases de datos muy grandes (>10,000 registros), considera usar `createMany` donde sea posible
- El script ejecuta operaciones en el orden correcto de dependencias para evitar errores de FK
- Las operaciones son secuenciales para mantener la consistencia de datos

## 📝 Changelog

### v1.0.0 - 2024-02-15

- ✅ Implementación inicial del script de seed
- ✅ Soporte para 19 entidades principales
- ✅ Generación de 1000+ registros
- ✅ Idempotencia básica
- ✅ Hashing de contraseñas con bcrypt
- ✅ Datos realistas con Faker
- ✅ Relaciones consistentes entre entidades
