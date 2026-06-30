import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/es_MX';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Constants for data generation
const SALT_ROUNDS = 10;
const STUDENTS_PER_CAREER = 50;

// (ROLE_DISTRIBUTION / STAFF_BASE_COUNT unused after seedDev/seedProd; kept for reference)

// Default password for all seeded users (dev and prod). Documented in README.
const DEFAULT_SEED_PASSWORD = 'Password123!';
const ROBUST_MIN_PER_TABLE = 100;

const STAFF_SEED_DATA = [
  { firstName: 'Edgar Tiburcio', lastName: 'Gomez Moran', email: '22038@virtual.utsc.edu.mx', role: 'admin' as const, enrollmentNumber: '22038', sex: 'male' },
  { firstName: 'Carlos Alexis', lastName: 'Rodriguez Garcia', email: '22051@virtual.utsc.edu.mx', role: 'coordinador_psicologia' as const, enrollmentNumber: '22051', sex: 'male' },
  { firstName: 'Orlando De Jesus', lastName: 'Casas Davila', email: '22034@virtual.utsc.edu.mx', role: 'coordinador_enfermeria' as const, enrollmentNumber: '22034', sex: 'male' },
  { firstName: 'Daniela Mayte', lastName: 'Guevara Castillo', email: '20651@virtual.utsc.edu.mx', role: 'psicologo' as const, enrollmentNumber: '20651', sex: 'female' },
  { firstName: 'Juan Enrique', lastName: 'Castillo Ontiveros', email: '22035@virtual.utsc.edu.mx', role: 'enfermero' as const, enrollmentNumber: '22035', sex: 'male' }
] as const;

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

const usedUsernames = new Set<string>();

function generateUsername(firstName: string, lastName: string): string {
  const cleanName = firstName.trim().split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanLastName = lastName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const consonants = cleanLastName.replace(/[aeiouáéíóúü\s]/gi, '');
  const suffix = consonants.substring(0, 3);
  const capitalizedFirst = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  const capitalizedSuffix = suffix.toUpperCase(); // keeping consonants uppercase like Gmz, Rdg, etc.
  return `${capitalizedFirst}${capitalizedSuffix}`;
}

function generateUniqueUsername(firstName: string, lastName: string): string {
  const base = generateUsername(firstName, lastName);
  let username = base;
  let counter = 1;
  while (usedUsernames.has(username)) {
    username = `${base}${counter}`;
    counter++;
  }
  usedUsernames.add(username);
  return username;
}

// Helper function to get a random element from an array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random elements from an array
function randomElements<T>(array: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Seed Careers
async function seedCareers() {
  console.log('🎓 Seeding Careers...');
  
  const careers = [
    { name: 'TSU. Gestión Institucional Educativa y Curricular', code: 'TSU-GIEC' },
    { name: 'TSU. Innovación de Negocios y Mercadotecnia', code: 'TSU-INM' },
    { name: 'TSU. Mantenimiento Industrial', code: 'TSU-MI' },
    { name: 'TSU. Sistemas Productivos', code: 'TSU-SP' },
    { name: 'TSU. Mecatrónica', code: 'TSU-MEC' },
    { name: 'TSU. Desarrollo y Gestión de Software', code: 'TSU-DGS' },
    { name: 'Lic. Gestión Institucional Educativa y Curricular', code: 'LIC-GIEC' },
    { name: 'Lic. Innovación de Negocios y Mercadotecnia', code: 'LIC-INM' },
    { name: 'Ing. Mantenimiento Industrial', code: 'ING-MI' },
    { name: 'Ing. Sistemas Productivos', code: 'ING-SP' },
    { name: 'Ing. Mecatrónica', code: 'ING-MEC' },
    { name: 'Ing. Desarrollo y Gestión de Software', code: 'ING-DGS' },
  ];

  const createdCareers = [];
  for (const career of careers) {
    const created = await prisma.career.upsert({
      where: { name: career.name },
      update: {},
      create: {
        name: career.name,
        code: career.code,
        isActive: true,
      },
    });
    createdCareers.push(created);
  }

  console.log(`✅ Created ${createdCareers.length} careers`);
  return createdCareers;
}

// (seedUsers original ya no se usa; la lógica se movió a seedDev con datos específicos)

// Seed Patients (50 students per career; each user is assigned to career by index)
async function seedPatients(patientUsers: any[], careers: any[]) {
  console.log('🏥 Seeding Patient records...');

  const patients = [];
  const maritalStatuses = ['single', 'married', 'divorced', 'widowed'];

  for (let i = 0; i < patientUsers.length; i++) {
    const user = patientUsers[i];
    const careerIndex = Math.floor(i / STUDENTS_PER_CAREER);
    const career = careers[careerIndex];

    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        patientType: 'student',
        maritalStatus: randomElement(maritalStatuses),
        guardianName: Math.random() > 0.5 ? faker.person.fullName() : undefined,
        guardianPhone: faker.string.numeric(10),
        careerId: career.id,
        group: faker.string.alphanumeric(3).toUpperCase(),
        trimester: Math.floor(Math.random() * 12) + 1,
      },
    });
    patients.push(patient);
  }

  console.log(`✅ Created ${patients.length} patient records (${STUDENTS_PER_CAREER} students × ${careers.length} careers)`);
  return patients;
}

// Seed Psychologist-Career assignments
async function seedPsychologistCareers(psychologists: any[], careers: any[]) {
  console.log('🧠 Seeding Psychologist-Career assignments...');

  const assignments = [];
  const availableCareers = [...careers];

  for (let i = 0; i < Math.min(psychologists.length, careers.length); i++) {
    const psychologist = psychologists[i];
    const career = availableCareers[i];

    const assignment = await prisma.psychologistCareer.upsert({
      where: {
        psychologistId_careerId: {
          psychologistId: psychologist.id,
          careerId: career.id,
        },
      },
      update: {},
      create: {
        psychologistId: psychologist.id,
        careerId: career.id,
      },
    });
    assignments.push(assignment);
  }

  console.log(`✅ Created ${assignments.length} psychologist-career assignments`);
  return assignments;
}

// Seed Emergency Contacts
async function seedEmergencyContacts(patients: any[]) {
  console.log('🚨 Seeding Emergency Contacts...');

  const relationships = ['Padre', 'Madre', 'Hermano/a', 'Esposo/a', 'Tío/a', 'Abuelo/a', 'Primo/a', 'Amigo/a'];
  let totalContacts = 0;

  for (const patient of patients) {
    const numContacts = Math.floor(Math.random() * 2) + 1; // 1-2 contacts

    for (let i = 0; i < numContacts; i++) {
      await prisma.emergencyContact.create({
        data: {
          patientId: patient.id,
          name: faker.person.fullName(),
          relationship: randomElement(relationships),
          phone: faker.string.numeric(10),
          phoneSecondary: Math.random() > 0.5 ? faker.string.numeric(10) : undefined,
          priority: i + 1,
        },
      });
      totalContacts++;
    }
  }

  console.log(`✅ Created ${totalContacts} emergency contacts`);
}

// Seed Medical Records
async function seedMedicalRecords(patients: any[], admin: any) {
  console.log('📋 Seeding Medical Records...');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const medicalRecords = [];

  for (const patient of patients) {
    const medicalRecord = await prisma.medicalRecord.upsert({
      where: { patientId: patient.id },
      update: {},
      create: {
        patientId: patient.id,
        bloodType: randomElement(bloodTypes),
        allergies: Math.random() > 0.7 ? faker.lorem.sentence() : null,
        chronicConditions: Math.random() > 0.8 ? faker.lorem.sentence() : null,
        currentMedications: Math.random() > 0.7 ? faker.lorem.sentence() : null,
        familyHistory: Math.random() > 0.5 ? faker.lorem.sentences(2) : null,
        notes: Math.random() > 0.6 ? faker.lorem.paragraph() : null,
        createdBy: admin.id,
        updatedBy: admin.id,
      },
    });
    medicalRecords.push(medicalRecord);
  }

  console.log(`✅ Created ${medicalRecords.length} medical records`);
  return medicalRecords;
}

// Seed Psychology Records
async function seedPsychologyRecords(medicalRecords: any[], psychologists: any[]) {
  console.log('🧠 Seeding Psychology Records...');

  const riskLevels = ['none', 'low', 'medium', 'high'];
  const psychologyRecords = [];

  for (const medicalRecord of medicalRecords) {
    const assignedPsychologist = psychologists.length > 0 ? randomElement(psychologists) : null;
    
    const psychologyRecord = await prisma.psychologyRecord.upsert({
      where: { medicalRecordId: medicalRecord.id },
      update: {},
      create: {
        medicalRecordId: medicalRecord.id,
        initialEvaluationDate: faker.date.past({ years: 1 }),
        chiefComplaint: faker.lorem.sentence(),
        psychologicalHistory: faker.lorem.paragraph(),
        psychiatricHistory: Math.random() > 0.7 ? faker.lorem.paragraph() : null,
        substanceUse: Math.random() > 0.8 ? faker.lorem.sentence() : null,
        suicideRiskLevel: randomElement(riskLevels),
        violenceRiskLevel: randomElement(riskLevels),
        currentDiagnosisDsm5: Math.random() > 0.5 ? `F${Math.floor(Math.random() * 90) + 10}.${Math.floor(Math.random() * 9)}` : null,
        currentDiagnosisCie10: Math.random() > 0.5 ? `Z${Math.floor(Math.random() * 90) + 10}.${Math.floor(Math.random() * 9)}` : null,
        supportNetwork: faker.lorem.paragraph(),
        assignedPsychologistId: assignedPsychologist?.id,
      },
    });
    psychologyRecords.push(psychologyRecord);
  }

  console.log(`✅ Created ${psychologyRecords.length} psychology records`);
  return psychologyRecords;
}

// Seed Moods — clasificación clínica: frecuencia en consulta (ánimo vs emoción)
const DEFAULT_MOODS = [
  // 1. Muy comunes (día a día)
  { code: 'anxious_apprehensive', name: 'Ansioso / Aprehensivo', emoji: '😰', category: 'very_common', displayOrder: 1 },
  { code: 'down_dysthymic', name: 'Decaído / Distímico', emoji: '😔', category: 'very_common', displayOrder: 2 },
  { code: 'stressed_overwhelmed', name: 'Estresado / Abrumado', emoji: '😫', category: 'very_common', displayOrder: 3 },
  { code: 'irritable', name: 'Irritable', emoji: '😤', category: 'very_common', displayOrder: 4 },
  { code: 'sad', name: 'Triste', emoji: '😢', category: 'very_common', displayOrder: 5 },
  { code: 'tired', name: 'Cansado', emoji: '😴', category: 'very_common', displayOrder: 6 },
  { code: 'depressive', name: 'Depresivo', emoji: '🫠', category: 'very_common', displayOrder: 7 },
  { code: 'stressed', name: 'Estresado', emoji: '😓', category: 'very_common', displayOrder: 8 },
  // 2. Estados positivos (buenos estados de ánimo)
  { code: 'calm', name: 'Calmado', emoji: '😌', category: 'positive', displayOrder: 9 },
  { code: 'happy', name: 'Feliz', emoji: '😊', category: 'positive', displayOrder: 10 },
  { code: 'hopeful', name: 'Esperanzado', emoji: '🌟', category: 'positive', displayOrder: 11 },
  { code: 'content', name: 'Contento', emoji: '🙂', category: 'positive', displayOrder: 12 },
  { code: 'motivated', name: 'Motivado', emoji: '💪', category: 'positive', displayOrder: 13 },
  { code: 'at_ease', name: 'Tranquilo', emoji: '🧘', category: 'positive', displayOrder: 14 },
  { code: 'optimistic', name: 'Optimista', emoji: '☀️', category: 'positive', displayOrder: 15 },
  { code: 'relieved', name: 'Aliviado', emoji: '😮‍💨', category: 'positive', displayOrder: 16 },
  { code: 'serene', name: 'Sereno', emoji: '🌿', category: 'positive', displayOrder: 17 },
  // 3. Comunes (procesos de adaptación)
  { code: 'melancholic_nostalgic', name: 'Melancólico / Nostálgico', emoji: '🥹', category: 'common', displayOrder: 18 },
  { code: 'insecure_hesitant', name: 'Inseguro / Dubitativo', emoji: '😕', category: 'common', displayOrder: 19 },
  { code: 'ambivalent', name: 'Ambivalente', emoji: '⚖️', category: 'common', displayOrder: 20 },
  // 4. Menos comunes (específicos o complejos)
  { code: 'euthymic', name: 'Eutímico', emoji: '🙂', category: 'less_common', displayOrder: 21 },
  { code: 'anhedonic', name: 'Anhedónico', emoji: '🫥', category: 'less_common', displayOrder: 22 },
  { code: 'expansive_hypomanic', name: 'Expansivo / Hipomaníaco', emoji: '😄', category: 'less_common', displayOrder: 23 },
  { code: 'dissociative', name: 'Disociativo', emoji: '🌫️', category: 'less_common', displayOrder: 24 },
  // 5. Raros o atípicos
  { code: 'alexithymic', name: 'Alexitímico', emoji: '😐', category: 'rare', displayOrder: 25 },
  { code: 'abulic', name: 'Abúlico', emoji: '😴', category: 'rare', displayOrder: 26 },
  { code: 'ecstatic', name: 'Extático', emoji: '🤩', category: 'rare', displayOrder: 27 },
  // 6. Carga social (pareja, familia, trabajo)
  { code: 'guilty', name: 'Culpable', emoji: '😣', category: 'social_load', displayOrder: 28 },
  { code: 'ashamed', name: 'Avergonzado', emoji: '😳', category: 'social_load', displayOrder: 29 },
  { code: 'resentful', name: 'Resentido', emoji: '😒', category: 'social_load', displayOrder: 30 },
  { code: 'lonely', name: 'Solitario', emoji: '🏝️', category: 'social_load', displayOrder: 31 },
  // 7. Desorientación (crisis de vida)
  { code: 'lost_disoriented', name: 'Perdido / Desorientado', emoji: '🌀', category: 'disorientation', displayOrder: 32 },
  { code: 'frustrated', name: 'Frustrado', emoji: '😩', category: 'disorientation', displayOrder: 33 },
  { code: 'indifferent', name: 'Indiferente', emoji: '😑', category: 'disorientation', displayOrder: 34 },
  // 8. Alta intensidad (picos emocionales)
  { code: 'euphoric', name: 'Eufórico', emoji: '🎉', category: 'high_intensity', displayOrder: 35 },
  { code: 'terrified_panicky', name: 'Aterrado / Pánico', emoji: '😱', category: 'high_intensity', displayOrder: 36 },
  { code: 'hostile', name: 'Hostil', emoji: '😠', category: 'high_intensity', displayOrder: 37 },
];

async function seedMoods() {
  console.log('😊 Seeding Moods (clasificación clínica)...');
  for (const m of DEFAULT_MOODS) {
    await prisma.mood.upsert({
      where: { code: m.code },
      update: { name: m.name, emoji: m.emoji, category: m.category, displayOrder: m.displayOrder },
      create: m,
    });
  }
  console.log(`✅ Created/updated ${DEFAULT_MOODS.length} moods`);
  return DEFAULT_MOODS.map((x) => x.code);
}

// Seed Therapy Sessions
async function seedTherapySessions(psychologyRecords: any[], _psychologists: any[], moodCodes: string[]) {
  console.log('💬 Seeding Therapy Sessions...');

  let totalSessions = 0;

  for (const psychologyRecord of psychologyRecords) {
    if (!psychologyRecord.assignedPsychologistId) continue;

    const numSessions = Math.floor(Math.random() * 11) + 5; // 5-15 sessions
    const startDate = psychologyRecord.initialEvaluationDate || new Date();

    for (let i = 0; i < numSessions; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + (i * 7)); // Weekly sessions

      const selectedMoods = randomElements(moodCodes, 1, 2);
      const moodValue = selectedMoods.join(',');

      const therapySession = await prisma.therapySession.upsert({
        where: {
          psychologyRecordId_sessionNumber: {
            psychologyRecordId: psychologyRecord.id,
            sessionNumber: i + 1,
          },
        },
        update: {
          sessionDate,
          sessionDuration: 50,
          mood: moodValue,
          evolutionNotes: faker.lorem.paragraph(),
          patientProgress: faker.lorem.sentence(),
          assignedTasks: Math.random() > 0.3 ? faker.lorem.sentence() : null,
          observations: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          nextSessionPlan: Math.random() > 0.4 ? faker.lorem.sentence() : null,
          therapistId: psychologyRecord.assignedPsychologistId,
        },
        create: {
          psychologyRecordId: psychologyRecord.id,
          sessionNumber: i + 1,
          sessionDate,
          sessionDuration: 50,
          mood: moodValue,
          evolutionNotes: faker.lorem.paragraph(),
          patientProgress: faker.lorem.sentence(),
          assignedTasks: Math.random() > 0.3 ? faker.lorem.sentence() : null,
          observations: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          nextSessionPlan: Math.random() > 0.4 ? faker.lorem.sentence() : null,
          therapistId: psychologyRecord.assignedPsychologistId,
        },
      });

      if (therapySession) totalSessions++;
    }
  }

  console.log(`✅ Created ${totalSessions} therapy sessions`);
}

// Asignar moods a sesiones existentes (vacías o con códigos antiguos)
async function updateExistingSessionsMoods(moodCodes: string[]) {
  if (moodCodes.length === 0) return;
  console.log('🔄 Asignando estados de ánimo a sesiones existentes...');
  const sessions = await prisma.therapySession.findMany({ select: { id: true, mood: true } });
  const validCodes = new Set(moodCodes);
  let updated = 0;
  for (const session of sessions) {
    const current = session.mood?.trim() || '';
    const currentCodes = current ? current.split(',').map((c) => c.trim()).filter(Boolean) : [];
    const needsUpdate = currentCodes.length === 0 || currentCodes.some((c) => !validCodes.has(c));
    if (!needsUpdate) continue;
    const selectedMoods = randomElements(moodCodes, 1, 2);
    const moodValue = selectedMoods.join(',');
    await prisma.therapySession.update({
      where: { id: session.id },
      data: { mood: moodValue },
    });
    updated++;
  }
  console.log(`✅ Actualizadas ${updated} sesiones con estados de ánimo`);
}

// Seed Treatment Plans
async function seedTreatmentPlans(psychologyRecords: any[]) {
  console.log('📝 Seeding Treatment Plans...');

  const approaches = ['Cognitive-Behavioral', 'Psychodynamic', 'Humanistic', 'Systemic', 'Integrative'];
  const statuses = ['active', 'completed', 'on_hold', 'cancelled'];
  let totalPlans = 0;

  for (const psychologyRecord of psychologyRecords) {
    if (!psychologyRecord.assignedPsychologistId) continue;

    // Check if record has sessions
    const sessionsCount = await prisma.therapySession.count({
      where: { psychologyRecordId: psychologyRecord.id },
    });

    if (sessionsCount === 0) continue;

    const numPlans = Math.floor(Math.random() * 2) + 1; // 1-2 plans

    for (let i = 0; i < numPlans; i++) {
      const startDate = faker.date.past({ years: 1 });
      const endDate = Math.random() > 0.3 ? faker.date.future({ years: 1, refDate: startDate }) : null;

      await prisma.treatmentPlan.create({
        data: {
          psychologyRecordId: psychologyRecord.id,
          startDate,
          endDate,
          therapeuticApproach: randomElement(approaches),
          goals: faker.lorem.paragraph(),
          interventions: faker.lorem.paragraph(),
          status: randomElement(statuses),
          createdBy: psychologyRecord.assignedPsychologistId,
        },
      });
      totalPlans++;
    }
  }

  console.log(`✅ Created ${totalPlans} treatment plans`);
}

// Seed Psychometric Evaluations
async function seedPsychometricEvaluations(psychologyRecords: any[], _psychologists: any[]) {
  console.log('📊 Seeding Psychometric Evaluations...');

  const evaluationTypes = ['Beck Depression Inventory', 'Hamilton Anxiety Scale', 'MMPI-2', 'Rorschach', 'WAIS-IV', 'SCL-90-R'];
  let totalEvaluations = 0;

  // Only create evaluations for a subset (50-70%)
  const recordsWithEvaluations = randomElements(psychologyRecords, 
    Math.floor(psychologyRecords.length * 0.5), 
    Math.floor(psychologyRecords.length * 0.7)
  );

  for (const psychologyRecord of recordsWithEvaluations) {
    if (!psychologyRecord.assignedPsychologistId) continue;

    const numEvaluations = Math.floor(Math.random() * 3) + 1; // 1-3 evaluations

    for (let i = 0; i < numEvaluations; i++) {
      await prisma.psychometricEvaluation.create({
        data: {
          psychologyRecordId: psychologyRecord.id,
          evaluationType: randomElement(evaluationTypes),
          applicationDate: faker.date.past({ years: 1 }),
          rawScore: Math.random() * 100,
          standardScore: Math.random() * 100,
          percentile: Math.floor(Math.random() * 100) + 1,
          interpretation: faker.lorem.paragraph(),
          administeredBy: psychologyRecord.assignedPsychologistId,
          fileUrl: Math.random() > 0.5 ? `/files/psychometric/${faker.string.uuid()}.pdf` : null,
        },
      });
      totalEvaluations++;
    }
  }

  console.log(`✅ Created ${totalEvaluations} psychometric evaluations`);
}

// Seed Nursing Consultations
async function seedNursingConsultations(medicalRecords: any[], nurses: any[]) {
  console.log('💉 Seeding Nursing Consultations...');

  let totalConsultations = 0;
  const consultations = [];

  // Only create consultations for a subset (30-50%)
  const recordsWithConsultations = randomElements(medicalRecords,
    Math.floor(medicalRecords.length * 0.3),
    Math.floor(medicalRecords.length * 0.5)
  );

  for (const medicalRecord of recordsWithConsultations) {
    if (nurses.length === 0) continue;

    const numConsultations = Math.floor(Math.random() * 9) + 2; // 2-10 consultations

    for (let i = 0; i < numConsultations; i++) {
      const consultation = await prisma.nursingConsultation.create({
        data: {
          medicalRecordId: medicalRecord.id,
          consultationDate: faker.date.past({ years: 1 }),
          chiefComplaint: faker.lorem.sentence(),
          vitalSignsTemperature: 36 + Math.random() * 2.5, // 36-38.5°C
          vitalSignsBloodPressureSys: 100 + Math.floor(Math.random() * 40), // 100-140
          vitalSignsBloodPressureDia: 60 + Math.floor(Math.random() * 30), // 60-90
          vitalSignsHeartRate: 60 + Math.floor(Math.random() * 40), // 60-100
          vitalSignsRespiratoryRate: 12 + Math.floor(Math.random() * 8), // 12-20
          vitalSignsOxygenSaturation: 95 + Math.floor(Math.random() * 5), // 95-100
          vitalSignsWeight: 50 + Math.random() * 50, // 50-100 kg
          vitalSignsHeight: 150 + Math.random() * 40, // 150-190 cm
          physicalExamination: faker.lorem.paragraph(),
          diagnosis: Math.random() > 0.3 ? faker.lorem.sentence() : null,
          treatmentPlan: faker.lorem.paragraph(),
          observations: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          nurseId: randomElement(nurses).id,
        },
      });
      consultations.push(consultation);
      totalConsultations++;
    }
  }

  console.log(`✅ Created ${totalConsultations} nursing consultations`);
  return consultations;
}

// Seed Nursing Procedures
async function seedNursingProcedures(consultations: any[], nurses: any[]) {
  console.log('🩹 Seeding Nursing Procedures...');

  const procedureTypes = ['Wound Dressing', 'Blood Draw', 'Injection', 'Vital Signs', 'Catheterization', 'IV Administration'];
  let totalProcedures = 0;

  // Only some consultations have procedures
  const consultationsWithProcedures = randomElements(consultations,
    Math.floor(consultations.length * 0.3),
    Math.floor(consultations.length * 0.5)
  );

  for (const consultation of consultationsWithProcedures) {
    if (nurses.length === 0) continue;

    const numProcedures = Math.floor(Math.random() * 2) + 1; // 1-2 procedures

    for (let i = 0; i < numProcedures; i++) {
      await prisma.nursingProcedure.create({
        data: {
          nursingConsultationId: consultation.id,
          procedureType: randomElement(procedureTypes),
          procedureDate: consultation.consultationDate,
          description: faker.lorem.paragraph(),
          materialsUsed: faker.lorem.sentence(),
          observations: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          performedBy: consultation.nurseId,
        },
      });
      totalProcedures++;
    }
  }

  console.log(`✅ Created ${totalProcedures} nursing procedures`);
}

// Seed Medications
async function seedMedications() {
  console.log('💊 Seeding Medications...');

  const medications = [
    { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Analgesic', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', dosageForms: 'Capsule', route: 'Oral' },
    { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', dosageForms: 'Capsule', route: 'Oral' },
    { name: 'Metformin 850mg', genericName: 'Metformin', category: 'Antidiabetic', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', category: 'Statin', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Losartan 50mg', genericName: 'Losartan', category: 'Antihypertensive', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Sertraline 50mg', genericName: 'Sertraline', category: 'SSRI', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Fluoxetine 20mg', genericName: 'Fluoxetine', category: 'SSRI', dosageForms: 'Capsule', route: 'Oral' },
    { name: 'Alprazolam 0.5mg', genericName: 'Alprazolam', category: 'Benzodiazepine', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Diazepam 5mg', genericName: 'Diazepam', category: 'Benzodiazepine', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Clonazepam 2mg', genericName: 'Clonazepam', category: 'Benzodiazepine', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Loratadine 10mg', genericName: 'Loratadine', category: 'Antihistamine', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Antihistamine', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'Bronchodilator', dosageForms: 'Inhaler', route: 'Inhalation' },
    { name: 'Captopril 25mg', genericName: 'Captopril', category: 'ACE Inhibitor', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Enalapril 10mg', genericName: 'Enalapril', category: 'ACE Inhibitor', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Levothyroxine 100mcg', genericName: 'Levothyroxine', category: 'Thyroid Hormone', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', category: 'Antibiotic', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Ranitidine 150mg', genericName: 'Ranitidine', category: 'H2 Blocker', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Prednisone 5mg', genericName: 'Prednisone', category: 'Corticosteroid', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Insulin Glargine', genericName: 'Insulin Glargine', category: 'Insulin', dosageForms: 'Injectable', route: 'Subcutaneous' },
    { name: 'Aspirin 100mg', genericName: 'Acetylsalicylic Acid', category: 'Antiplatelet', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Clopidogrel 75mg', genericName: 'Clopidogrel', category: 'Antiplatelet', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Warfarin 5mg', genericName: 'Warfarin', category: 'Anticoagulant', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Risperidone 2mg', genericName: 'Risperidone', category: 'Antipsychotic', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Quetiapine 100mg', genericName: 'Quetiapine', category: 'Antipsychotic', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Lithium Carbonate 300mg', genericName: 'Lithium Carbonate', category: 'Mood Stabilizer', dosageForms: 'Tablet', route: 'Oral' },
    { name: 'Valproic Acid 500mg', genericName: 'Valproic Acid', category: 'Anticonvulsant', dosageForms: 'Tablet', route: 'Oral' },
  ];

  const createdMedications = [];
  for (const med of medications) {
    const medication = await prisma.medication.upsert({
      where: { 
        name_genericName: {
          name: med.name,
          genericName: med.genericName,
        }
      },
      update: {},
      create: {
        name: med.name,
        genericName: med.genericName,
        category: med.category,
        dosageForms: med.dosageForms,
        commonDosages: faker.lorem.sentence(),
        administrationRoutes: med.route,
        contraindications: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        sideEffects: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        isActive: true,
        stock: Math.floor(Math.random() * 80) + 5, // 5-85 units for variety (alto/medio/bajo)
      },
    });
    createdMedications.push(medication);
  }

  console.log(`✅ Created ${createdMedications.length} medications`);
  return createdMedications;
}

// Seed Prescriptions
async function seedPrescriptions(patients: any[], medications: any[], nurses: any[], psychologists: any[]) {
  console.log('📋 Seeding Prescriptions...');

  const prescribers = [...nurses, ...psychologists];
  if (prescribers.length === 0) return;

  // 20-30% of patients get prescriptions
  const patientsWithPrescriptions = randomElements(patients,
    Math.floor(patients.length * 0.2),
    Math.floor(patients.length * 0.3)
  );

  const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'Every 12 hours', 'As needed'];
  const routes = ['Oral', 'Topical', 'Inhalation', 'Subcutaneous', 'Intramuscular'];
  const statuses = ['active', 'completed', 'discontinued'];
  let totalPrescriptions = 0;

  for (const patient of patientsWithPrescriptions) {
    const numPrescriptions = Math.floor(Math.random() * 3) + 1; // 1-3 prescriptions

    for (let i = 0; i < numPrescriptions; i++) {
      const startDate = faker.date.past({ years: 1 });
      const endDate = Math.random() > 0.3 ? faker.date.future({ years: 1, refDate: startDate }) : null;

      await prisma.prescription.create({
        data: {
          patientId: patient.id,
          medicationId: randomElement(medications).id,
          prescribedBy: randomElement(prescribers).id,
          dosage: `${Math.floor(Math.random() * 500) + 50}mg`,
          frequency: randomElement(frequencies),
          route: randomElement(routes),
          duration: Math.random() > 0.5 ? `${Math.floor(Math.random() * 30) + 7} days` : null,
          startDate,
          endDate,
          instructions: faker.lorem.sentence(),
          status: randomElement(statuses),
        },
      });
      totalPrescriptions++;
    }
  }

  console.log(`✅ Created ${totalPrescriptions} prescriptions`);
}

// Seed Medication Administration
async function seedMedicationAdministration(consultations: any[], medications: any[], nurses: any[]) {
  console.log('💉 Seeding Medication Administration...');

  if (nurses.length === 0) return;

  // Only some consultations have medication administration
  const consultationsWithMeds = randomElements(consultations,
    Math.floor(consultations.length * 0.2),
    Math.floor(consultations.length * 0.4)
  );

  const routes = ['Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical'];
  let totalAdministrations = 0;

  for (const consultation of consultationsWithMeds) {
    const numMeds = Math.floor(Math.random() * 2) + 1; // 1-2 medications

    for (let i = 0; i < numMeds; i++) {
      // Five rights verification
      const allVerified = Math.random() > 0.1; // 90% properly verified

      await prisma.medicationAdministration.create({
        data: {
          nursingConsultationId: consultation.id,
          medicationId: randomElement(medications).id,
          dosage: `${Math.floor(Math.random() * 500) + 50}mg`,
          route: randomElement(routes),
          administrationDate: consultation.consultationDate,
          administeredBy: consultation.nurseId,
          patientVerified: allVerified || Math.random() > 0.05,
          medicationVerified: allVerified || Math.random() > 0.05,
          dosageVerified: allVerified || Math.random() > 0.05,
          routeVerified: allVerified || Math.random() > 0.05,
          timeVerified: allVerified || Math.random() > 0.05,
          adverseReaction: Math.random() > 0.9 ? faker.lorem.sentence() : null,
          observations: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        },
      });
      totalAdministrations++;
    }
  }

  console.log(`✅ Created ${totalAdministrations} medication administrations`);
}

// Seed Appointments
async function seedAppointments(patients: any[], psychologists: any[], nurses: any[]) {
  console.log('📅 Seeding Appointments...');

  const professionals = [...psychologists, ...nurses];
  if (professionals.length === 0) return;

  const appointmentTypes = ['initial_consultation', 'follow_up', 'emergency', 'routine'];
  let totalAppointments = 0;

  // Seed: crear algunas citas "completed" alineadas con therapy sessions
  // para que en UI se oculten Cancelar/Reagendar cuando la cita asociada ya terminó.
  const therapySessionsForCompletion = await prisma.therapySession.findMany({
    select: {
      sessionDate: true,
      therapistId: true,
      psychologyRecord: {
        select: {
          medicalRecord: {
            select: {
              patientId: true,
            },
          },
        },
      },
    },
  });

  const sessionsToMarkCompleted = therapySessionsForCompletion
    .filter(() => Math.random() > 0.85) // ~15%
    .slice(0, Math.min(40, therapySessionsForCompletion.length));

  for (const s of sessionsToMarkCompleted) {
    const patientId = s.psychologyRecord?.medicalRecord?.patientId;
    if (!patientId || !s.therapistId || !s.sessionDate) continue;

    await prisma.appointment.create({
      data: {
        patientId,
        professionalId: s.therapistId,
        appointmentType: randomElement(appointmentTypes),
        department: 'psychology',
        scheduledDate: s.sessionDate,
        // Mantener dentro de la nueva regla (max 90).
        durationMinutes: [45, 50, 60][Math.floor(Math.random() * 3)],
        status: 'completed',
        cancellationReason: null,
        notes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        createdBy: s.therapistId,
      },
    });
    totalAppointments++;
  }

  for (const patient of patients) {
    const numAppointments = Math.floor(Math.random() * 16) + 5; // 5-20 appointments

    for (let i = 0; i < numAppointments; i++) {
      const isPast = Math.random() > 0.2; // 80% past appointments
      const appointmentDate = isPast 
        ? faker.date.past({ years: 1 })
        : faker.date.future({ years: 1 });

      const status = isPast 
        ? randomElement(['completed', 'cancelled', 'no_show'])
        : 'scheduled';

      const professional = randomElement(professionals);
      const department = professional.role === 'psicologo' ? 'psychology' : 'nursing';

      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          professionalId: professional.id,
          appointmentType: randomElement(appointmentTypes),
          department,
          scheduledDate: appointmentDate,
          durationMinutes: [30, 45, 50, 60][Math.floor(Math.random() * 4)],
          status,
          cancellationReason: status === 'cancelled' ? faker.lorem.sentence() : null,
          notes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          createdBy: professional.id,
        },
      });
      totalAppointments++;
    }
  }

  console.log(`✅ Created ${totalAppointments} appointments`);
}

// Seed Professional Schedules
async function seedProfessionalSchedules(psychologists: any[], nurses: any[]) {
  console.log('⏰ Seeding Professional Schedules...');

  const professionals = [...psychologists, ...nurses];
  let totalSchedules = 0;

  for (const professional of professionals) {
    // Create schedules for 3-5 days a week
    const workDays = randomElements([1, 2, 3, 4, 5], 3, 5);

    for (const dayOfWeek of workDays) {
      const startHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
      const endHour = 16 + Math.floor(Math.random() * 3); // 4-6 PM

      await prisma.professionalSchedule.create({
        data: {
          professionalId: professional.id,
          dayOfWeek,
          startTime: new Date(`2000-01-01T${startHour.toString().padStart(2, '0')}:00:00`),
          endTime: new Date(`2000-01-01T${endHour.toString().padStart(2, '0')}:00:00`),
          isActive: true,
        },
      });
      totalSchedules++;
    }
  }

  console.log(`✅ Created ${totalSchedules} professional schedules`);
}

// Seed Interconsultations
async function seedInterconsultations(patients: any[], psychologists: any[], nurses: any[]) {
  console.log('🔄 Seeding Interconsultations...');

  if (psychologists.length === 0 || nurses.length === 0) return;

  // Create interconsultations for 10-20% of patients
  const patientsWithInterconsults = randomElements(patients,
    Math.floor(patients.length * 0.1),
    Math.floor(patients.length * 0.2)
  );

  const urgencyLevels = ['routine', 'urgent', 'emergency'];
  const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
  let totalInterconsultations = 0;

  for (const patient of patientsWithInterconsults) {
    const fromPsych = Math.random() > 0.5;
    const fromProf = fromPsych ? randomElement(psychologists) : randomElement(nurses);
    const toProf = fromPsych ? randomElement(nurses) : randomElement(psychologists);

    const status = randomElement(statuses);
    const isResponded = status === 'completed' || status === 'in_progress';

    await prisma.interconsultation.create({
      data: {
        patientId: patient.id,
        fromDepartment: fromPsych ? 'psychology' : 'nursing',
        toDepartment: fromPsych ? 'nursing' : 'psychology',
        fromProfessionalId: fromProf.id,
        toProfessionalId: toProf.id,
        reason: faker.lorem.sentence(),
        relevantInformation: faker.lorem.paragraph(),
        urgency: randomElement(urgencyLevels),
        status,
        response: isResponded ? faker.lorem.paragraph() : null,
        respondedBy: isResponded ? toProf.id : null,
        respondedAt: isResponded ? faker.date.recent({ days: 7 }) : null,
      },
    });
    totalInterconsultations++;
  }

  console.log(`✅ Created ${totalInterconsultations} interconsultations`);
}

// Seed Notifications
async function seedNotifications(users: any[]) {
  console.log('🔔 Seeding Notifications...');

  const notificationTypes = [
    'appointment_reminder',
    'appointment_confirmation',
    'appointment_cancellation',
    'new_message',
    'task_assignment',
    'system_alert',
  ];

  const priorities = ['low', 'normal', 'high'];
  let totalNotifications = 0;

  for (const user of users) {
    const numNotifications = Math.floor(Math.random() * 6) + 2; // 2-7 notifications

    for (let i = 0; i < numNotifications; i++) {
      const isRead = Math.random() > 0.4; // 60% read

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: randomElement(notificationTypes),
          title: faker.lorem.sentence({ min: 3, max: 6 }),
          message: faker.lorem.paragraph(),
          relatedEntityType: Math.random() > 0.5 ? 'appointment' : null,
          relatedEntityId: Math.random() > 0.5 ? faker.string.uuid() : null,
          priority: randomElement(priorities),
          isRead,
          readAt: isRead ? faker.date.recent({ days: 7 }) : null,
        },
      });
      totalNotifications++;
    }
  }

  console.log(`✅ Created ${totalNotifications} notifications`);
}

async function ensureMinimumMoods(target: number) {
  let count = await prisma.mood.count();
  let cursor = count + 1;
  const categories = ['very_common', 'common', 'positive', 'less_common', 'rare'];
  while (count < target) {
    const suffix = String(cursor).padStart(3, '0');
    const code = `seed_mood_${suffix}`;
    await prisma.mood.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: `Estado de animo ${suffix}`,
        emoji: '🙂',
        category: randomElement(categories),
        displayOrder: cursor,
      },
    });
    cursor += 1;
    count = await prisma.mood.count();
  }
}

async function ensureMinimumPsychologistCareers(target: number) {
  const careers = await prisma.career.findMany({ select: { id: true } });
  const psychologists = await prisma.user.findMany({ where: { role: 'psicologo' }, select: { id: true } });
  let count = await prisma.psychologistCareer.count();
  if (careers.length === 0 || psychologists.length === 0) return;

  for (const psychologist of psychologists) {
    for (const career of careers) {
      if (count >= target) return;
      await prisma.psychologistCareer.upsert({
        where: {
          psychologistId_careerId: {
            psychologistId: psychologist.id,
            careerId: career.id,
          },
        },
        update: {},
        create: {
          psychologistId: psychologist.id,
          careerId: career.id,
        },
      });
      count = await prisma.psychologistCareer.count();
    }
  }
}

async function ensureMinimumAppointmentReminders(target: number) {
  const appointments = await prisma.appointment.findMany({ select: { id: true, scheduledDate: true } });
  if (appointments.length === 0) return;

  const reminderTypes = ['email', 'sms', 'push'];
  const statuses = ['pending', 'sent', 'failed'];
  let count = await prisma.appointmentReminder.count();
  let cursor = 0;
  while (count < target) {
    const appointment = appointments[cursor % appointments.length];
    const base = new Date(appointment.scheduledDate);
    base.setHours(base.getHours() - 24);
    await prisma.appointmentReminder.create({
      data: {
        appointmentId: appointment.id,
        reminderType: reminderTypes[cursor % reminderTypes.length],
        scheduledFor: base,
        sentAt: Math.random() > 0.3 ? faker.date.recent({ days: 15 }) : null,
        status: statuses[cursor % statuses.length],
      },
    });
    cursor += 1;
    count = await prisma.appointmentReminder.count();
  }
}

async function ensureMinimumWaitingList(target: number) {
  const patients = await prisma.patient.findMany({ select: { id: true } });
  const professionals = await prisma.user.findMany({
    where: { role: { in: ['psicologo', 'enfermero'] } },
    select: { id: true },
  });
  if (patients.length === 0) return;

  const priorities = ['low', 'medium', 'high'];
  const statuses = ['waiting', 'contacted', 'scheduled'];
  let count = await prisma.waitingList.count();
  let cursor = 0;
  while (count < target) {
    const patient = patients[cursor % patients.length];
    await prisma.waitingList.create({
      data: {
        patientId: patient.id,
        department: cursor % 2 === 0 ? 'psychology' : 'nursing',
        preferredProfessionalId: professionals.length > 0 ? randomElement(professionals).id : null,
        requestedDate: faker.date.recent({ days: 40 }),
        priority: priorities[cursor % priorities.length],
        reason: faker.lorem.sentence(),
        status: statuses[cursor % statuses.length],
      },
    });
    cursor += 1;
    count = await prisma.waitingList.count();
  }
}

async function seedWaitingListDev(patients: any[], careers: any[], psychologists: any[]) {
  console.log('👥 Seeding Waiting List for DEV (5 per career)...');
  let count = 0;
  
  for (let careerIndex = 0; careerIndex < careers.length; careerIndex++) {
    const career = careers[careerIndex];
    const careerPatients = patients.filter((p) => p.careerId === career.id);
    const targetPatients = careerPatients.slice(0, 5);
    
    for (const patient of targetPatients) {
      const psychologist = psychologists.length > 0 ? randomElement(psychologists) : null;
      await prisma.waitingList.create({
        data: {
          patientId: patient.id,
          department: 'psicologia',
          preferredProfessionalId: psychologist ? psychologist.id : null,
          requestedDate: faker.date.recent({ days: 5 }),
          priority: 'media',
          status: 'espera',
          reason: `El alumno solicita agendar cita desde el Kiosko para ${randomElement([
            'consulta por estrés académico',
            'apoyo por problemas personales',
            'orientación vocacional',
            'ansiedad ante exámenes',
            'seguimiento de proceso anterior',
          ])}`,
          createdAt: faker.date.recent({ days: 5 }),
        },
      });
      count++;
    }
  }
  console.log(`✅ Created ${count} waiting list entries (5 per career)`);
}

async function ensureMinimumNursingAttentions(target: number) {
  const patients = await prisma.patient.findMany({ select: { id: true } });
  const nurses = await prisma.user.findMany({ where: { role: 'enfermero' }, select: { id: true } });
  if (patients.length === 0 || nurses.length === 0) return;

  let count = await prisma.nursingAttention.count();
  let cursor = 0;
  while (count < target) {
    const patient = patients[cursor % patients.length];
    const nurse = nurses[cursor % nurses.length];
    await prisma.nursingAttention.create({
      data: {
        patientId: patient.id,
        nurseId: nurse.id,
        motive: faker.lorem.sentence(),
        vitalSigns: {
          temperature: Number((36 + Math.random() * 2.2).toFixed(1)),
          heartRate: 60 + Math.floor(Math.random() * 45),
          bloodPressure: `${100 + Math.floor(Math.random() * 35)}/${60 + Math.floor(Math.random() * 20)}`,
        },
        lightningDiagnosis: Math.random() > 0.4 ? faker.lorem.words(4) : null,
        treatment: faker.lorem.sentence(),
        observations: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        disposition: randomElement(['home', 'observation', 'referred']),
      },
    });
    cursor += 1;
    count = await prisma.nursingAttention.count();
  }
}

async function ensureMinimumPrescriptionAdministrations(target: number) {
  const prescriptions = await prisma.prescription.findMany({ select: { id: true } });
  const administrations = await prisma.medicationAdministration.findMany({ select: { id: true } });
  if (prescriptions.length === 0 || administrations.length === 0) return;

  let count = await prisma.prescriptionAdministration.count();
  let cursor = 0;
  const maxAttempts = target * 20;

  while (count < target && cursor < maxAttempts) {
    const prescription = prescriptions[cursor % prescriptions.length];
    const administration = administrations[(cursor * 7) % administrations.length];
    try {
      await prisma.prescriptionAdministration.create({
        data: {
          prescriptionId: prescription.id,
          medicationAdministrationId: administration.id,
        },
      });
      count = await prisma.prescriptionAdministration.count();
    } catch {
      // ignore duplicate unique pairs and continue trying
    }
    cursor += 1;
  }
}

async function ensureMinimumAuditLogs(target: number) {
  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) return;

  const patients = await prisma.patient.findMany({ select: { id: true } });
  const appointments = await prisma.appointment.findMany({ select: { id: true } });
  const therapySessions = await prisma.therapySession.findMany({ select: { id: true } });
  const nursingConsultations = await prisma.nursingConsultation.findMany({ select: { id: true } });

  const actions = ['LOGIN', 'CREATE', 'UPDATE', 'VIEW_RECORD', 'EXPORT', 'LOGOUT'];
  const tables = ['users', 'patients', 'appointments', 'therapy_sessions', 'nursing_consultations'];
  let count = await prisma.auditLog.count();
  let cursor = 0;
  while (count < target) {
    const table = tables[cursor % tables.length];
    let recordId = faker.string.uuid();

    if (table === 'users' && users.length > 0) {
      recordId = users[cursor % users.length].id;
    } else if (table === 'patients' && patients.length > 0) {
      recordId = patients[cursor % patients.length].id;
    } else if (table === 'appointments' && appointments.length > 0) {
      recordId = appointments[cursor % appointments.length].id;
    } else if (table === 'therapy_sessions' && therapySessions.length > 0) {
      recordId = therapySessions[cursor % therapySessions.length].id;
    } else if (table === 'nursing_consultations' && nursingConsultations.length > 0) {
      recordId = nursingConsultations[cursor % nursingConsultations.length].id;
    }

    await prisma.auditLog.create({
      data: {
        userId: users[cursor % users.length].id,
        action: actions[cursor % actions.length],
        tableName: table,
        recordId,
        oldValues: Math.random() > 0.5 ? { status: 'old' } : undefined,
        newValues: { status: 'new', idx: cursor },
        ipAddress: faker.internet.ipv4(),
        userAgent: `seed-agent/${cursor % 5}`,
      },
    });
    cursor += 1;
    count = await prisma.auditLog.count();
  }
}

async function ensureMinimumReports(target: number) {
  const users = await prisma.user.findMany({
    where: { role: { in: ['admin', 'coordinador_psicologia', 'coordinador_enfermeria'] } },
    select: { id: true },
  });
  if (users.length === 0) return;

  const types = ['statistics', 'consultations', 'diagnoses', 'attendance', 'inventory'];
  const departments = ['psychology', 'nursing'];
  let count = await prisma.report.count();
  let cursor = 0;
  while (count < target) {
    const periodStart = faker.date.past({ years: 1 });
    const periodEnd = faker.date.future({ years: 1, refDate: periodStart });
    await prisma.report.create({
      data: {
        reportType: types[cursor % types.length],
        department: departments[cursor % departments.length],
        periodStart,
        periodEnd,
        filters: { generatedBySeed: true, index: cursor },
        generatedBy: users[cursor % users.length].id,
        fileUrl: `/reports/seed-report-${String(cursor).padStart(3, '0')}.pdf`,
      },
    });
    cursor += 1;
    count = await prisma.report.count();
  }
}

async function ensureMinimumSystemSettings(target: number) {
  const users = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
  let count = await prisma.systemSetting.count();
  let cursor = count + 1;
  while (count < target) {
    const key = `seed.setting.${String(cursor).padStart(3, '0')}`;
    await prisma.systemSetting.create({
      data: {
        settingKey: key,
        settingValue: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        updatedBy: users.length > 0 ? users[0].id : null,
      },
    });
    cursor += 1;
    count = await prisma.systemSetting.count();
  }
}

async function ensureMinimumBlogPosts(target: number) {
  const users = await prisma.user.findMany({
    where: { role: { in: ['admin', 'psicologo', 'enfermero'] } },
    select: { id: true },
  });
  const categories = ['Salud Mental', 'Salud Fisica', 'Evento', 'Dia Especial'];
  let count = await prisma.blogPost.count();
  let cursor = 0;
  while (count < target) {
    await prisma.blogPost.create({
      data: {
        title: faker.lorem.sentence({ min: 4, max: 8 }),
        content: faker.lorem.paragraphs(3),
        category: categories[cursor % categories.length],
        authorId: users.length > 0 ? users[cursor % users.length].id : null,
        imageUrl: Math.random() > 0.5 ? `https://picsum.photos/seed/blog-${cursor}/800/400` : null,
        likes: Math.floor(Math.random() * 450),
      },
    });
    cursor += 1;
    count = await prisma.blogPost.count();
  }
}

async function ensureMinimumProfessionalSchedules(target: number) {
  const professionals = await prisma.user.findMany({
    where: { role: { in: ['psicologo', 'enfermero'] } },
    select: { id: true },
  });
  if (professionals.length === 0) return;

  let count = await prisma.professionalSchedule.count();
  let cursor = 0;
  while (count < target) {
    const pro = professionals[cursor % professionals.length];
    const startHour = 7 + (cursor % 4);
    const endHour = startHour + 8;
    await prisma.professionalSchedule.create({
      data: {
        professionalId: pro.id,
        dayOfWeek: (cursor % 7) + 1,
        startTime: new Date(`2000-01-01T${String(startHour).padStart(2, '0')}:00:00`),
        endTime: new Date(`2000-01-01T${String(endHour).padStart(2, '0')}:00:00`),
        isActive: true,
      },
    });
    cursor += 1;
    count = await prisma.professionalSchedule.count();
  }
}

async function ensureMinimumInterconsultations(target: number) {
  const patients = await prisma.patient.findMany({ select: { id: true } });
  const psychologists = await prisma.user.findMany({ where: { role: 'psicologo' }, select: { id: true } });
  const nurses = await prisma.user.findMany({ where: { role: 'enfermero' }, select: { id: true } });
  if (patients.length === 0 || psychologists.length === 0 || nurses.length === 0) return;

  const urgencies = ['routine', 'urgent', 'emergency'];
  const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
  let count = await prisma.interconsultation.count();
  let cursor = 0;
  while (count < target) {
    const fromPsych = cursor % 2 === 0;
    const fromProfessional = fromPsych ? psychologists[cursor % psychologists.length] : nurses[cursor % nurses.length];
    const toProfessional = fromPsych ? nurses[cursor % nurses.length] : psychologists[cursor % psychologists.length];
    const status = statuses[cursor % statuses.length];
    const responded = status === 'completed' || status === 'in_progress';

    await prisma.interconsultation.create({
      data: {
        patientId: patients[cursor % patients.length].id,
        fromDepartment: fromPsych ? 'psychology' : 'nursing',
        toDepartment: fromPsych ? 'nursing' : 'psychology',
        fromProfessionalId: fromProfessional.id,
        toProfessionalId: toProfessional.id,
        reason: faker.lorem.sentence(),
        relevantInformation: faker.lorem.paragraph(),
        urgency: urgencies[cursor % urgencies.length],
        status,
        response: responded ? faker.lorem.paragraph() : null,
        respondedBy: responded ? toProfessional.id : null,
        respondedAt: responded ? faker.date.recent({ days: 10 }) : null,
      },
    });
    cursor += 1;
    count = await prisma.interconsultation.count();
  }
}

async function ensureRobustMinimums(target = ROBUST_MIN_PER_TABLE) {
  console.log(`📈 Ensuring robust minimum dataset (${target} rows per table when feasible)...`);

  await ensureMinimumMoods(target);
  await ensureMinimumPsychologistCareers(target);
  await ensureMinimumAppointmentReminders(target);
  await ensureMinimumWaitingList(target);
  await ensureMinimumNursingAttentions(target);
  await ensureMinimumPrescriptionAdministrations(target);
  await ensureMinimumProfessionalSchedules(target);
  await ensureMinimumInterconsultations(target);
  await ensureMinimumAuditLogs(target);
  await ensureMinimumReports(target);
  await ensureMinimumSystemSettings(target);
  await ensureMinimumBlogPosts(target);

  console.log('✅ Robust minimum dataset ensured');
}

async function printTableCounts() {
  const counts = {
    users: await prisma.user.count(),
    careers: await prisma.career.count(),
    patients: await prisma.patient.count(),
    psychologistCareers: await prisma.psychologistCareer.count(),
    emergencyContacts: await prisma.emergencyContact.count(),
    medicalRecords: await prisma.medicalRecord.count(),
    psychologyRecords: await prisma.psychologyRecord.count(),
    psychometricEvaluations: await prisma.psychometricEvaluation.count(),
    moods: await prisma.mood.count(),
    therapySessions: await prisma.therapySession.count(),
    treatmentPlans: await prisma.treatmentPlan.count(),
    nursingConsultations: await prisma.nursingConsultation.count(),
    nursingAttentions: await prisma.nursingAttention.count(),
    nursingProcedures: await prisma.nursingProcedure.count(),
    medications: await prisma.medication.count(),
    prescriptions: await prisma.prescription.count(),
    prescriptionAdministrations: await prisma.prescriptionAdministration.count(),
    medicationAdministrations: await prisma.medicationAdministration.count(),
    appointments: await prisma.appointment.count(),
    appointmentReminders: await prisma.appointmentReminder.count(),
    waitingList: await prisma.waitingList.count(),
    professionalSchedules: await prisma.professionalSchedule.count(),
    interconsultations: await prisma.interconsultation.count(),
    auditLogs: await prisma.auditLog.count(),
    reports: await prisma.report.count(),
    systemSettings: await prisma.systemSetting.count(),
    notifications: await prisma.notification.count(),
    blogPosts: await prisma.blogPost.count(),
  };
  console.log('📊 Table counts:', counts);
}

async function seedRobust() {
  await clearDatabase();
  await seedDev();
  await ensureRobustMinimums(ROBUST_MIN_PER_TABLE);
  await printTableCounts();

  const robustStaff = await prisma.user.findMany({
    where: {
      role: {
        not: 'patient',
      },
    },
    orderBy: {
      role: 'asc',
    },
  });

  console.log('\n🔑 TODOS LOS USUARIOS ADMINISTRATIVOS/CLÍNICOS EN ROBUST - CONTRASEÑA: ' + DEFAULT_SEED_PASSWORD);
  console.table(
    robustStaff.map((u) => ({
      'Nombre Completo': `${u.firstName} ${u.lastName}`,
      'Nombre de Usuario (Username)': u.username,
      'Correo Electrónico': u.email,
      'Rol': u.role,
    }))
  );

  console.log('✅ Seed ROBUST completed. All users have password: ' + DEFAULT_SEED_PASSWORD);
}

// ---------- Seed DEV: datos de prueba (usuarios fijos + 500 alumnos + datos relacionados) ----------
async function seedDev() {
  const careers = await seedCareers();
  const defaultPasswordHash = await hashPassword(DEFAULT_SEED_PASSWORD);
  usedUsernames.clear();

  const staffDev = STAFF_SEED_DATA;

  console.log('👤 Seeding DEV staff users (with password)...');
  const staffUsers: any[] = [];
  for (const s of staffDev) {
    const username = generateUniqueUsername(s.firstName, s.lastName);
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        passwordHash: defaultPasswordHash,
        username,
        isConfirmed: true,
        mustChangePassword: false,
        sex: s.sex,
        role: s.role,
      },
      create: {
        email: s.email,
        username,
        passwordHash: defaultPasswordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: new Date('1990-01-15'),
        role: s.role,
        enrollmentNumber: s.enrollmentNumber,
        sex: s.sex,
        phone: faker.string.numeric(10),
        isConfirmed: true,
        mustChangePassword: false,
      },
    });
    staffUsers.push(user);
  }
  console.log(`✅ Created/updated ${staffUsers.length} staff users`);

  console.log('👥 Seeding DEV student users (500, with password)...');
  const patientUsers: any[] = [];
  for (let i = 0; i < 500; i++) {
    const enrollment = String(1000 + i);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = generateUniqueUsername(firstName, lastName);
    const user = await prisma.user.upsert({
      where: { email: `alumno.${enrollment}@utcare.local` },
      update: {
        passwordHash: defaultPasswordHash,
        username,
        isConfirmed: true,
        mustChangePassword: false,
      },
      create: {
        email: `alumno.${enrollment}@utcare.local`,
        username,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName,
        dateOfBirth: faker.date.birthdate({ min: 18, max: 45, mode: 'age' }),
        role: 'patient',
        enrollmentNumber: enrollment,
        sex: Math.random() < 0.5 ? 'male' : 'female',
        phone: faker.string.numeric(10),
        isConfirmed: true,
        mustChangePassword: false,
      },
    });
    patientUsers.push(user);
  }
  console.log(`✅ Created ${patientUsers.length} student users`);

  const patients = await seedPatients(patientUsers, careers);
  const admin = staffUsers.find((u) => u.role === 'admin')!;
  const psychologists = staffUsers.filter((u) => u.role === 'psicologo');
  const nurses = staffUsers.filter((u) => u.role === 'enfermero');

  await seedPsychologistCareers(psychologists, careers);
  await seedEmergencyContacts(patients);
  const medicalRecords = await seedMedicalRecords(patients, admin);
  const psychologyRecords = await seedPsychologyRecords(medicalRecords, psychologists);
  const moodCodes = await seedMoods();
  await seedTherapySessions(psychologyRecords, psychologists, moodCodes);
  await updateExistingSessionsMoods(moodCodes);
  await seedTreatmentPlans(psychologyRecords);
  await seedPsychometricEvaluations(psychologyRecords, psychologists);
  const consultations = await seedNursingConsultations(medicalRecords, nurses);
  await seedNursingProcedures(consultations, nurses);
  const medications = await seedMedications();
  await seedPrescriptions(patients, medications, nurses, psychologists);
  await seedMedicationAdministration(consultations, medications, nurses);
  await seedAppointments(patients, [...psychologists, ...nurses], nurses);
  await seedProfessionalSchedules(psychologists, nurses);
  await seedWaitingListDev(patients, careers, psychologists);
  await seedInterconsultations(patients, psychologists, nurses);
  await seedNotifications([...staffUsers, ...patientUsers]);

  console.log('\n🔑 USUARIOS CREADOS (SEED: DEV) - CONTRASEÑA: ' + DEFAULT_SEED_PASSWORD);
  console.table(
    staffUsers.map((u) => ({
      'Nombre Completo': `${u.firstName} ${u.lastName}`,
      'Nombre de Usuario (Username)': u.username,
      'Correo Electrónico': u.email,
      'Rol': u.role
    }))
  );
  console.log(`\n👥 ALUMNOS (PACIENTES) CREADOS: 500 usuarios generados (ejemplo: ${patientUsers[0].username}, ${patientUsers[1].username}, etc.).`);

  console.log('✅ Seed DEV completed. All users have password: ' + DEFAULT_SEED_PASSWORD);
}

// ---------- Seed PROD: solo carreras + usuarios de staff (todos con contraseña) ----------
async function seedProd() {
  await seedCareers();
  await seedMoods();
  const defaultPasswordHash = await hashPassword(DEFAULT_SEED_PASSWORD);
  usedUsernames.clear();

  const staffProd = STAFF_SEED_DATA;

  // Eliminar cualquier usuario del personal anterior que no esté en la lista oficial
  const officialEmails = staffProd.map(s => s.email);
  await prisma.user.deleteMany({
    where: {
      email: { notIn: officialEmails },
      role: { not: 'patient' }
    }
  });

  console.log('👤 Seeding PROD staff users (with password)...');
  const createdProdUsers: any[] = [];
  for (const s of staffProd) {
    const username = generateUniqueUsername(s.firstName, s.lastName);
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        passwordHash: defaultPasswordHash,
        username,
        isConfirmed: true,
        mustChangePassword: false,
        sex: s.sex,
        role: s.role,
      },
      create: {
        email: s.email,
        username,
        passwordHash: defaultPasswordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: new Date('1985-06-01'),
        role: s.role,
        enrollmentNumber: s.enrollmentNumber || null,
        sex: s.sex || (Math.random() < 0.5 ? 'male' : 'female'),
        isConfirmed: true,
        mustChangePassword: false,
      },
    });
    createdProdUsers.push(user);
  }
  console.log(`✅ Created/updated ${staffProd.length} PROD staff users`);

  console.log('\n🔑 USUARIOS CREADOS (SEED: PROD) - CONTRASEÑA: ' + DEFAULT_SEED_PASSWORD);
  console.table(
    createdProdUsers.map((u) => ({
      'Nombre Completo': `${u.firstName} ${u.lastName}`,
      'Nombre de Usuario (Username)': u.username,
      'Correo Electrónico': u.email,
      'Rol': u.role
    }))
  );

  console.log('✅ Seed PROD completed. All users have password: ' + DEFAULT_SEED_PASSWORD);
}

// ============================================================
// =====================  SEED DEMO  ==========================
// ============================================================

// --- Frases clínicas en español ---
const ES_MOTIVOS_CONSULTA = [
  'El alumno refiere sentirse ansioso y con dificultad para concentrarse en clases.',
  'Paciente presenta cuadro de tristeza persistente desde el inicio del semestre.',
  'Refiere conflictos familiares que están afectando su rendimiento académico.',
  'Manifiesta dificultad para dormir y pensamientos recurrentes de preocupación.',
  'El alumno solicita orientación por estrés relacionado con carga académica excesiva.',
  'Presenta síntomas de ansiedad ante exámenes y evaluaciones parciales.',
  'Refiere episodios de irritabilidad y cambios bruscos de humor.',
  'El paciente manifiesta sentirse solo y sin motivación para continuar la carrera.',
  'Consulta por dificultades en las relaciones interpersonales con compañeros.',
  'El alumno solicita apoyo por duelo ante pérdida de familiar cercano.',
  'Presenta llanto fácil y sensación de desesperanza desde hace tres semanas.',
  'Refiere crisis de angustia con palpitaciones y sensación de ahogo.',
  'El paciente manifiesta pensamientos negativos recurrentes sobre su futuro.',
  'Acude por orientación vocacional; duda si continuar en la carrera actual.',
  'Presenta cuadro de agotamiento emocional y burnout estudiantil.',
  'Refiere dificultades económicas que están generando estrés significativo.',
  'El alumno manifiesta conflicto con pareja que afecta su concentración.',
  'Solicita apoyo psicológico por antecedente de bullying en semestres anteriores.',
  'Presenta síntomas físicos (cefalea, molestias gastrointestinales) asociados al estrés.',
  'Acude por primera vez expresando que "siente que algo no está bien".',
];

const ES_HISTORIAS_PSICOLOGICAS = [
  'El paciente reporta antecedentes de ansiedad desde la preparatoria, sin tratamiento previo. Niega episodios depresivos mayores. Refiere apoyo familiar moderado.',
  'Sin antecedentes psiquiátricos formales. Refiere periodos de tristeza estacional durante los meses de invierno. Cuenta con red de apoyo de amigos cercanos.',
  'Historia de tratamiento psicológico breve durante la adolescencia por problemas de conducta. Actualmente sin medicación. Dificultades de adaptación al entorno universitario.',
  'El alumno refiere haber experimentado episodios de ansiedad en el pasado sin recibir atención profesional. Familia con antecedentes de depresión materna.',
  'Sin historial de enfermedades mentales diagnosticadas. Personalidad introvertida. Tendencia a la somatización del estrés. Red de apoyo limitada a uno o dos amigos.',
  'Paciente con antecedente de crisis de pánico hace dos años, remitidas espontáneamente. Actualmente bajo estrés académico elevado. Refiere consumo ocasional de alcohol los fines de semana.',
  'El alumno ha manifestado dificultades emocionales recurrentes a lo largo de su historial académico. Primera vez que acude a un servicio de psicología. Familia lejana geográficamente.',
  'Sin antecedentes relevantes. Paciente con alta capacidad de resiliencia. Acude por situación puntual de duelo. Buen insight y disposición al proceso terapéutico.',
  'Historial de bajo rendimiento académico asociado a problemas emocionales no atendidos. Refiere sentirse incomprendido en el entorno familiar. Primera consulta en servicio universitario.',
  'El paciente reporta episodios de angustia intermitentes desde hace seis meses. Sin medicación actual. Refiere que la situación se intensificó tras cambio de ciudad para estudiar.',
];

const ES_NOTAS_EVOLUCION = [
  'Se establece alianza terapéutica adecuada. El paciente muestra disposición al diálogo y buena capacidad de introspección. Se trabajan técnicas de respiración diafragmática.',
  'El alumno reporta mejoría parcial en los síntomas de ansiedad. Se refuerzan estrategias de afrontamiento adaptativas y se revisa registro de pensamientos automáticos.',
  'Sesión centrada en identificación de distorsiones cognitivas. El paciente logra reconocer el pensamiento catastrófico como patrón predominante. Buena adherencia a las tareas.',
  'Se trabaja el duelo en etapa de aceptación. El paciente muestra avances significativos en la integración de la pérdida. Se refuerza la red de apoyo social.',
  'El alumno llegó con nivel de ansiedad elevado (8/10). Se realizó técnica de grounding y relajación progresiva de Jacobson. Al finalizar reporta nivel 4/10.',
  'Se identificaron factores estresores principales: carga académica, problemas económicos y conflictos familiares. Se priorizan y se establecen estrategias por jerarquía.',
  'El paciente muestra resistencia inicial. Se trabaja motivación al cambio y psicoeducación sobre el proceso terapéutico. Finaliza la sesión con mayor apertura.',
  'Sesión de seguimiento. El alumno reporta haber aplicado técnicas de manejo del estrés con resultados positivos. Se refuerza logro y se plantean nuevos objetivos.',
  'Se trabaja asertividad y comunicación efectiva en el contexto de relaciones interpersonales. Role-playing de situaciones conflictivas con compañeros.',
  'El paciente manifiesta mejoría en calidad del sueño tras implementar higiene del sueño. Se mantiene plan terapéutico. Próxima sesión en 15 días.',
];

const ES_PROGRESOS_PACIENTE = [
  'Muestra apertura y disposición creciente al proceso terapéutico.',
  'Ha logrado aplicar técnicas de regulación emocional en situaciones cotidianas.',
  'Reporta reducción en la frecuencia e intensidad de los episodios de ansiedad.',
  'Ha establecido rutinas de autocuidado: ejercicio, descanso y alimentación.',
  'Identifica sus patrones de pensamiento disfuncional con mayor facilidad.',
  'Mejora notable en la calidad del sueño y en los niveles de energía durante el día.',
  'Se observa mayor cohesión familiar y comunicación efectiva con sus padres.',
  'Ha retomado actividades que antes disfrutaba (deporte, música, convivencia social).',
  'Reporta rendimiento académico en recuperación. Entregó trabajos pendientes.',
  'Muestra mayor tolerancia a la frustración y menor reactividad emocional.',
];

const ES_TAREAS_ASIGNADAS = [
  'Llevar registro diario de pensamientos automáticos negativos y cuestionarlos.',
  'Practicar respiración diafragmática 10 minutos cada mañana antes de ir a clases.',
  'Realizar caminata de 30 minutos al día durante la siguiente semana.',
  'Redactar carta de despedida como ejercicio de elaboración del duelo.',
  'Hablar con un familiar o amigo de confianza sobre sus emociones actuales.',
  'Llevar agenda de actividades agradables y realizarlas al menos 3 veces por semana.',
  'Aplicar técnica de grounding en el momento en que aparezca la ansiedad.',
  'Practicar diálogo interno positivo frente al espejo por 5 minutos al día.',
];

const ES_PLANES_SIGUIENTE_SESION = [
  'Revisar registro de pensamientos y reforzar reestructuración cognitiva.',
  'Continuar con exposición gradual a situaciones que generan ansiedad.',
  'Abordar historia familiar y su influencia en patrones actuales de comportamiento.',
  'Trabajar manejo del tiempo y organización académica como factor de estrés.',
  'Profundizar en el módulo de habilidades sociales y comunicación asertiva.',
  'Cierre terapéutico y evaluación de logros al finalizar el proceso.',
  'Revisión de plan de acción ante posibles recaídas o situaciones de crisis.',
  'Evaluación de síntomas con escala de ansiedad y depresión para seguimiento.',
];

const ES_DIAGNOSTICOS_DSM5: string[] = [
  'F41.1 Trastorno de ansiedad generalizada',
  'F32.1 Episodio depresivo moderado',
  'F43.1 Trastorno de estrés postraumático',
  'F40.10 Fobia social',
  'F41.0 Trastorno de pánico sin agorafobia',
  'F43.2 Trastorno de adaptación con ánimo depresivo',
  'F60.3 Trastorno límite de la personalidad',
  'F33.0 Trastorno depresivo recurrente, episodio actual leve',
];

const ES_QUEJAS_ENFERMERIA = [
  'Paciente acude por cefalea intensa de 2 días de evolución.',
  'Presenta cuadro febril de 38.2°C asociado a faringitis.',
  'Refiere dolor abdominal difuso y náuseas de aparición súbita.',
  'Acude por revisión de tensión arterial; refiere mareos ocasionales.',
  'Presenta herida superficial en mano derecha que requiere curación.',
  'Refiere dolor lumbar de moderada intensidad tras actividad física.',
  'Acude por rinorrea, congestión nasal y malestar general de 3 días.',
  'Presenta erupción cutánea en antebrazo de causa no determinada.',
  'Refiere palpitaciones ocasionales y sensación de cansancio excesivo.',
  'Acude para toma de signos vitales de rutina y orientación sobre prevención.',
  'Presenta conjuntivitis con secreción purulenta en ojo derecho.',
  'Refiere esguince de tobillo izquierdo tras caída durante clase de educación física.',
];

const ES_DIAGNOSTICOS_ENFERMERIA = [
  'Cefalea tensional. Se administra analgésico y se indica reposo.',
  'Faringoamigdalitis aguda. Se refiere a médico general para valoración.',
  'Gastritis aguda. Se indica dieta blanda y antiácidos.',
  'Hipertensión leve. Se orienta sobre modificaciones en estilo de vida.',
  'Herida incisa superficial. Se realiza curación y se aplica antiséptico.',
  'Lumbalgia mecánica. Se indica reposo relativo y antiinflamatorio.',
  'Infección respiratoria alta. Medidas generales y analgesia.',
  'Dermatitis de contacto. Se indica antihistamínico y crema tópica.',
  'Arritmia sinusal a descartar. Se refiere a cardiología.',
  'Consulta preventiva. Signos vitales dentro de parámetros normales.',
];

const ES_OBSERVACIONES_ENFERMERIA = [
  'Paciente colaborador. Se le orienta sobre signos de alarma para regresar si hay deterioro.',
  'Se indican medidas de higiene y cuidado en casa. Próxima cita en 72 horas si persiste.',
  'Paciente ansioso durante la toma de signos vitales. Se le brinda orientación y tranquilidad.',
  'Sin datos de alarma al momento de la valoración. Se egresa en buenas condiciones generales.',
  'Se realiza curación satisfactoria. Se orienta sobre cuidados de la herida en casa.',
];

const ES_PLANES_TRATAMIENTO_ENF = [
  'Se administra paracetamol 500mg VO. Reposo de 24 horas. Hidratación abundante.',
  'Curación de herida con solución salina y clorhexidina. Cambio de apósito en 48 horas.',
  'Antihistamínico oral. Evitar contacto con agente irritante identificado.',
  'Control de signos vitales en 30 minutos. Registro en expediente. Referencia a médico si TA ≥ 140/90.',
  'Orientación nutricional y recomendaciones de actividad física moderada.',
];

const ES_ENFOQUES_TERAPEUTICOS = [
  'Cognitivo-Conductual',
  'Psicodinámico',
  'Humanista-Centrado en la Persona',
  'Sistémico Familiar',
  'Integrativo',
  'Mindfulness y Terapia de Aceptación y Compromiso (ACT)',
];

const ES_METAS_TRATAMIENTO = [
  'Reducir la frecuencia e intensidad de los episodios de ansiedad en un 60% en 8 semanas mediante técnicas cognitivo-conductuales.',
  'Desarrollar habilidades de regulación emocional y tolerancia a la angustia en el marco de la terapia dialéctica conductual.',
  'Elaborar el proceso de duelo y restablecer el funcionamiento adaptativo del paciente en sus áreas académica, social y familiar.',
  'Identificar y modificar patrones cognitivos disfuncionales que mantienen el estado depresivo y limitan el rendimiento académico.',
  'Fortalecer la autoestima y la asertividad del paciente mediante técnicas humanistas y de rol.',
  'Reducir síntomas de estrés postraumático mediante técnicas de exposición gradual y procesamiento emocional.',
];

const ES_INTERVENCIONES = [
  'Psicoeducación sobre el ciclo ansiedad-estrés. Técnica de respiración diafragmática. Registro de pensamientos automáticos. Reestructuración cognitiva.',
  'Técnicas de relajación progresiva de Jacobson. Mindfulness básico. Exposición gradual a situaciones temidas. Manejo de contingencias.',
  'Técnica de la silla vacía para el duelo. Narrativa de vida. Exploración de recursos internos y red de apoyo.',
  'Activación conductual. Registro de actividades agradables. Planificación de logros graduales. Psicoeducación sobre la depresión.',
  'Role-playing de situaciones sociales. Entrenamiento en habilidades asertivas. Técnica de solución de problemas.',
  'Psicoeducación sobre el trauma. Técnica EMDR básica. Grounding sensorial. Fortalecimiento de recursos resilientes.',
];

// --- Generador de email demo ---
const usedDemoEmails = new Set<string>();

function generateDemoEmail(firstName: string, lastName: string, domain: string): string {
  const cleanFirst = firstName.trim().split(' ')[0]
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const cleanLast = lastName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const consonants = cleanLast.replace(/[aeiouáéíóúü\s]/gi, '');
  const suffix = consonants.substring(0, 3).toLowerCase();
  const base = `${cleanFirst}${suffix}`;
  let email = `${base}@${domain}`;
  let counter = 1;
  while (usedDemoEmails.has(email)) {
    email = `${base}${counter}@${domain}`;
    counter++;
  }
  usedDemoEmails.add(email);
  return email;
}

// --- Seed Demo Patients ---
async function seedDemoPatients(careers: any[]) {
  console.log('👥 Seeding Demo patients (310 alumnos + 30 docentes)...');
  const defaultPasswordHash = await hashPassword(DEFAULT_SEED_PASSWORD);
  usedUsernames.clear();
  usedDemoEmails.clear();

  const ALUMNOS_POR_CARRERA = 26; // 12 × 26 = 312 alumnos
  const TOTAL_DOCENTES = 30;

  const estadosCiviles = ['soltero', 'casado', 'divorciado', 'viudo', 'unión libre'];
  const grupos = ['A', 'B', 'C', 'D'];
  const trimestres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const ocupacionesDocentes = [
    'Docente de Ingeniería de Software',
    'Docente de Matemáticas',
    'Docente de Física',
    'Docente de Comunicación',
    'Coordinador Académico',
    'Docente de Administración',
    'Docente de Inglés',
    'Docente de Redes y Telecomunicaciones',
    'Docente de Mecatrónica',
    'Docente de Mantenimiento Industrial',
  ];

  const alumnoUsers: any[] = [];
  const docenteUsers: any[] = [];
  const alumnoPatients: any[] = [];
  const docentePatients: any[] = [];

  // --- Alumnos ---
  for (let ci = 0; ci < careers.length; ci++) {
    const career = careers[ci];
    for (let i = 0; i < ALUMNOS_POR_CARRERA; i++) {
      const sex = Math.random() < 0.5 ? 'male' : 'female';
      const firstName = sex === 'male' ? faker.person.firstName('male') : faker.person.firstName('female');
      const lastName = `${faker.person.lastName()} ${faker.person.lastName()}`;
      const username = generateUniqueUsername(firstName, lastName);
      const email = generateDemoEmail(firstName, lastName, 'virtual.utsc.edu.mx');

      const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash: defaultPasswordHash, username, isConfirmed: true, mustChangePassword: false },
        create: {
          email,
          username,
          passwordHash: defaultPasswordHash,
          firstName,
          lastName,
          dateOfBirth: faker.date.birthdate({ min: 18, max: 30, mode: 'age' }),
          role: 'patient',
          enrollmentNumber: `${20000 + ci * ALUMNOS_POR_CARRERA + i}`,
          sex,
          phone: `${faker.string.numeric(2)}${faker.string.numeric(8)}`,
          isConfirmed: true,
          mustChangePassword: false,
        },
      });
      alumnoUsers.push(user);

      const patient = await prisma.patient.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          patientType: 'student',
          maritalStatus: randomElement(estadosCiviles),
          guardianName: Math.random() > 0.5 ? faker.person.fullName() : undefined,
          guardianPhone: faker.string.numeric(10),
          careerId: career.id,
          group: randomElement(grupos),
          trimester: randomElement(trimestres),
        },
      });
      alumnoPatients.push(patient);
    }
  }
  console.log(`  ✅ ${alumnoUsers.length} alumnos creados`);

  // --- Docentes ---
  for (let i = 0; i < TOTAL_DOCENTES; i++) {
    const sex = Math.random() < 0.5 ? 'male' : 'female';
    const firstName = sex === 'male' ? faker.person.firstName('male') : faker.person.firstName('female');
    const lastName = `${faker.person.lastName()} ${faker.person.lastName()}`;
    const username = generateUniqueUsername(firstName, lastName);
    const email = generateDemoEmail(firstName, lastName, 'utsc.edu.mx');

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: defaultPasswordHash, username, isConfirmed: true, mustChangePassword: false },
      create: {
        email,
        username,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName,
        dateOfBirth: faker.date.birthdate({ min: 28, max: 55, mode: 'age' }),
        role: 'patient',
        enrollmentNumber: `D${String(i + 1).padStart(4, '0')}`,
        sex,
        phone: `${faker.string.numeric(2)}${faker.string.numeric(8)}`,
        isConfirmed: true,
        mustChangePassword: false,
      },
    });
    docenteUsers.push(user);

    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        patientType: 'staff',
        maritalStatus: randomElement(estadosCiviles),
        careerId: careers[i % careers.length].id,
        occupation: randomElement(ocupacionesDocentes),
      },
    });
    docentePatients.push(patient);
  }
  console.log(`  ✅ ${docenteUsers.length} docentes creados`);

  const allPatientUsers = [...alumnoUsers, ...docenteUsers];
  const allPatients = [...alumnoPatients, ...docentePatients];

  console.log(`✅ Total pacientes demo: ${allPatients.length}`);
  return { allPatientUsers, allPatients };
}

// --- Seed Demo Blog Posts ---
async function seedDemoBlogPosts(authorId: string) {
  console.log('📰 Seeding Demo Blog Posts en español...');

  const posts = [
    {
      title: 'Ansiedad académica: señales de alerta y estrategias para manejarla',
      category: 'Salud Mental',
      content: `La ansiedad académica es uno de los motivos de consulta más frecuentes en los servicios de salud universitarios. Se manifiesta como un estado de preocupación persistente, dificultad para concentrarse, insomnio y síntomas físicos como taquicardia o tensión muscular, todo ello asociado a las exigencias del entorno escolar.

Reconocer las señales a tiempo es fundamental para buscar ayuda oportuna. Algunas de las más comunes son: bloqueo mental ante los exámenes, procrastinación excesiva, irritabilidad, y sensación constante de no ser suficientemente bueno.

Estrategias recomendadas:
• Técnicas de respiración diafragmática para reducir la activación fisiológica.
• Organización del tiempo mediante agenda y técnica Pomodoro.
• Ejercicio físico regular como regulador del sistema nervioso.
• Búsqueda de apoyo psicológico cuando los síntomas interfieren con el funcionamiento diario.

Recuerda: pedir ayuda es un acto de valentía, no de debilidad. En el Departamento de Psicología de nuestra universidad te esperamos con atención gratuita y confidencial.`,
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format',
      likes: 87,
    },
    {
      title: 'La importancia del sueño en la salud mental del estudiante universitario',
      category: 'Salud Mental',
      content: `El sueño es una función biológica esencial que muchos estudiantes universitarios sacrifican en aras de estudiar más horas. Sin embargo, la evidencia científica es clara: dormir menos de 7 horas afecta negativamente la memoria, la concentración, la regulación emocional y el sistema inmune.

Durante el sueño, el cerebro consolida la información aprendida durante el día mediante un proceso llamado consolidación mnémica. En otras palabras, trasnochar antes de un examen puede ser contraproducente.

Consejos de higiene del sueño:
• Establece un horario fijo para dormir y despertar, incluso los fines de semana.
• Evita pantallas (teléfono, computadora) al menos 30 minutos antes de dormir.
• Mantén tu cuarto oscuro, fresco y silencioso.
• Limita el consumo de cafeína después de las 3 pm.
• Si tienes pensamientos acelerados al acostarte, escríbelos en un papel para "descargarlos".

Priorizar el sueño no es perder el tiempo, es invertir en tu rendimiento académico y en tu bienestar emocional.`,
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format',
      likes: 64,
    },
    {
      title: 'Burnout estudiantil: cuando el esfuerzo se convierte en agotamiento',
      category: 'Salud Mental',
      content: `El síndrome de burnout, conocido popularmente como "quemarse", no es exclusivo del ámbito laboral. Los estudiantes universitarios son una población especialmente vulnerable, sobre todo aquellos que combinan estudios con trabajo o responsabilidades familiares.

El burnout estudiantil se caracteriza por tres dimensiones: agotamiento emocional (sentirse vaciado), despersonalización (volverse indiferente a los estudios y compañeros) y pérdida del sentido de eficacia académica.

¿Cómo identificarlo?
• Sientes que ya no te importan las materias que antes te emocionaban.
• El esfuerzo que haces ya no se traduce en resultados.
• Te sientes irritable, cansado y sin energía de forma constante.
• Has dejado de hacer actividades que antes disfrutabas.

Qué puedes hacer:
• Habla con un profesional de salud mental. No esperes a tocar fondo.
• Establece límites claros con tus compromisos académicos y personales.
• Activa tu red de apoyo: amigos, familia, compañeros.
• Considera un descanso estratégico si la situación lo amerita.

En el Departamento de Psicología contamos con atención especializada para acompañarte en este proceso.`,
      imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format',
      likes: 112,
    },
    {
      title: 'Alimentación saludable y bienestar emocional: la conexión que no puedes ignorar',
      category: 'Salud Fisica',
      content: `El eje intestino-cerebro es una de las áreas de investigación más fascinantes de la neurociencia moderna. Lo que comemos tiene un impacto directo en nuestra salud mental: el 90% de la serotonina (el neurotransmisor del bienestar) se produce en el intestino.

Una alimentación desequilibrada —alta en azúcares refinados, ultraprocesados y baja en frutas, verduras y proteínas de calidad— se ha asociado con mayor riesgo de depresión, ansiedad y fatiga crónica.

Recomendaciones prácticas para estudiantes:
• Desayuna siempre: el cerebro necesita glucosa para funcionar correctamente.
• Incluye proteínas en cada comida (huevo, leguminosas, pollo, pescado).
• Aumenta el consumo de omega-3: nueces, chía, linaza, salmón.
• Hidratación: beber 2 litros de agua al día mejora el estado de alerta y el humor.
• Reduce el consumo de bebidas energizantes: generan picos y caídas bruscas de energía.

Pequeños cambios en tu alimentación pueden marcar una gran diferencia en cómo te sientes día a día. Acude a nuestro servicio de enfermería para obtener orientación nutricional personalizada.`,
      imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format',
      likes: 76,
    },
    {
      title: 'Cómo manejar el estrés durante los períodos de exámenes',
      category: 'Salud Mental',
      content: `Los períodos de exámenes son momentos de alta exigencia que activan el sistema de estrés de nuestro organismo. Un nivel moderado de estrés puede ser positivo: nos mantiene alerta y motivados. Sin embargo, cuando el estrés se vuelve excesivo, deteriora la memoria, la concentración y el estado de ánimo.

Técnicas efectivas para manejar el estrés antes de los exámenes:

1. Planificación anticipada: estudia en sesiones cortas de 25-50 minutos con descansos de 5-10 minutos (técnica Pomodoro). Evita los maratones de estudio de última hora.

2. Movimiento físico: una caminata de 20 minutos libera endorfinas que reducen el cortisol (hormona del estrés) de forma natural.

3. Respiración 4-7-8: inhala 4 segundos, retén 7, exhala 8. Activa el sistema nervioso parasimpático.

4. Perspectiva: pregúntate "¿esto importará en 5 años?". Un examen no define tu valor como persona.

5. Sueño: no sacrifiques el descanso la noche anterior al examen. Dormir bien consolida la memoria.

Si sientes que el estrés te supera, no esperes: agenda una cita con nuestro equipo de psicología. Estamos aquí para apoyarte.`,
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b6f9b?w=800&auto=format',
      likes: 95,
    },
    {
      title: 'Actividad física y salud mental: más allá del ejercicio',
      category: 'Salud Fisica',
      content: `La relación entre actividad física y salud mental está avalada por décadas de investigación científica. Ejercitarse regularmente no solo beneficia al corazón y los músculos, sino que tiene efectos profundos y duraderos sobre el bienestar emocional y cognitivo.

¿Qué ocurre en el cerebro cuando hacemos ejercicio?
• Se liberan endorfinas, dopamina y serotonina: los neurotransmisores del bienestar.
• Se genera neuroplasticidad: el cerebro literalmente crece y crea nuevas conexiones.
• Se reduce el cortisol: la hormona principal del estrés crónico.
• Mejora la calidad del sueño y la función cognitiva (memoria, atención).

¿Cuánto ejercicio es suficiente?
La Organización Mundial de la Salud recomienda al menos 150 minutos de actividad moderada por semana. Pero incluso 20-30 minutos al día de caminata activa marcan una diferencia significativa.

Ideas para estudiantes universitarios:
• Usa las escaleras en vez del elevador.
• Únete a un equipo o club deportivo de la universidad.
• Practica yoga o pilates en casa con videos gratuitos.
• Camina o usa bicicleta para desplazarte al campus.

El movimiento es medicina. Encuentra la actividad que disfrutes y hazla parte de tu rutina.`,
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format',
      likes: 58,
    },
    {
      title: 'Primeros auxilios psicológicos: ¿qué hacer ante una crisis emocional?',
      category: 'Salud Mental',
      content: `Una crisis emocional puede ocurrirle a cualquier persona: un episodio de llanto intenso, un ataque de pánico, pensamientos de hacerse daño, o una reacción intensa de desesperación. Saber cómo responder marca una diferencia enorme.

Los primeros auxilios psicológicos (PAP) son una serie de acciones de apoyo inmediato que cualquier persona puede aplicar:

1. Presencia y escucha activa: simplemente estar ahí, sin juzgar. Escucha más de lo que hablas.

2. No minimices: evita frases como "no es para tanto" o "ya se te pasará". Valida la experiencia de la persona.

3. Seguridad física: si hay riesgo de autolesión, acompáñala y busca ayuda profesional de inmediato.

4. Técnicas de grounding: pide a la persona que nombre 5 cosas que puede ver, 4 que puede tocar, 3 que puede escuchar. Esto ancla al presente y reduce la activación.

5. Conectar con recursos: ayuda a la persona a ponerse en contacto con un profesional de salud mental.

Si eres testigo de una crisis en la universidad, no dudes en acudir al Departamento de Psicología. Nuestro equipo está capacitado para atender situaciones urgentes con calidez y profesionalismo.`,
      imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format',
      likes: 143,
    },
    {
      title: 'Hipertensión arterial en jóvenes universitarios: el enemigo silencioso',
      category: 'Salud Fisica',
      content: `La hipertensión arterial ya no es una enfermedad exclusiva de personas mayores. Datos recientes muestran un aumento preocupante en su prevalencia entre jóvenes de 18 a 30 años, impulsado por el sedentarismo, la alimentación inadecuada, el estrés crónico y el consumo de tabaco o alcohol.

Se le llama "el enemigo silencioso" porque en la mayoría de los casos no produce síntomas evidentes hasta que el daño ya es significativo. Por eso es fundamental medirse la presión arterial regularmente, incluso si te sientes bien.

Valores de referencia:
• Normal: menos de 120/80 mmHg
• Elevada: 120-129 / menos de 80 mmHg
• Hipertensión estadio 1: 130-139 / 80-89 mmHg
• Hipertensión estadio 2: 140 o más / 90 o más mmHg

¿Qué puedes hacer para prevenirla?
• Reduce el consumo de sal y alimentos procesados.
• Realiza actividad física regularmente.
• Mantén un peso saludable.
• Limita el alcohol y evita el tabaco.
• Maneja el estrés con técnicas de relajación o apoyo psicológico.

En nuestro servicio de enfermería puedes hacerte una revisión de signos vitales de forma gratuita. ¡No esperes a tener síntomas para cuidarte!`,
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format',
      likes: 49,
    },
    {
      title: 'Día Mundial de la Salud Mental 2025: "Es hora de priorizar la salud mental en el trabajo y en las aulas"',
      category: 'Dia Especial',
      content: `Cada 10 de octubre, el mundo conmemora el Día Mundial de la Salud Mental, una fecha impulsada por la Federación Mundial de Salud Mental para sensibilizar sobre la importancia de atender el bienestar psicológico de todas las personas.

El tema de este año, "Es hora de priorizar la salud mental en el trabajo y en las aulas", nos invita a reflexionar sobre cómo los entornos académicos y laborales pueden ser factores protectores o de riesgo para la salud mental.

En nuestra universidad, este día es una oportunidad para reafirmar nuestro compromiso con el bienestar integral de la comunidad estudiantil y docente:

✅ Contamos con servicio de atención psicológica gratuita y confidencial.
✅ Ofrecemos talleres de manejo del estrés, inteligencia emocional y habilidades de vida.
✅ Disponemos de atención de enfermería para la salud física integral.
✅ Fomentamos una cultura de apertura donde pedir ayuda es un acto de fortaleza.

Este 10 de octubre, te invitamos a dar el primer paso: agenda tu cita, platica con alguien de confianza, o simplemente pregunta cómo está la persona que tienes al lado.

La salud mental importa. Tú importas.`,
      imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format',
      likes: 201,
    },
    {
      title: 'El Mundial 2026 y su impacto en el estado anímico y económico de Nuevo León',
      category: 'Evento',
      content: `La Copa Mundial de la FIFA 2026, que se celebrará de forma conjunta en Estados Unidos, Canadá y México, tiene en Monterrey y su área metropolitana a una de las sedes más emocionantes del torneo. El estadio BBVA albergará algunos de los partidos más esperados del certamen, y Nuevo León se prepara para vivir una experiencia histórica.

Impacto en el estado anímico de la comunidad

Los grandes eventos deportivos generan lo que los psicólogos llaman "identidad social ampliada": la afición se agrupa alrededor de un equipo o símbolo común, lo que eleva la autoestima colectiva, el sentido de pertenencia y los estados de ánimo positivos. En términos clínicos, se ha observado que durante los torneos mundiales disminuyen los índices de consulta por depresión y ansiedad leve en la población general, mientras aumentan la sociabilidad y el optimismo.

Sin embargo, también pueden aparecer efectos negativos: ansiedad anticipatoria, insomnio por trasnochadas, irritabilidad ante resultados adversos, y consumo elevado de alcohol durante los partidos. Desde el Departamento de Salud, recomendamos disfrutar el Mundial con moderación y sin descuidar las rutinas de autocuidado.

Impacto económico y comercial en Nuevo León

La derrama económica estimada para Nuevo León supera los 1,200 millones de pesos, considerando turismo, hostelería, gastronomía, transporte y comercio minorista. Los comercios locales, restaurants y franquicias deportivas esperan incrementos de hasta un 40% en sus ventas durante los días de partido.

La industria hotelera reporta ya una ocupación proyectada del 95% para las fechas de los encuentros, con turistas provenientes de más de 30 países. El aeropuerto Internacional Mariano Escobedo prevé un aumento del 60% en vuelos internacionales durante el torneo.

Para la comunidad universitaria

¡Vive el Mundial con entusiasmo, pero también con responsabilidad! Aprovecha el evento para practicar inglés con los turistas, explorar otras culturas y reforzar tu sentido de identidad regional. Y si el resultado de algún partido te afecta emocionalmente más de lo esperado, recuerda que el Departamento de Psicología está aquí para escucharte. ¡Arriba México!`,
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format',
      likes: 318,
    },
  ];

  let created = 0;
  for (const post of posts) {
    await prisma.blogPost.create({
      data: {
        title: post.title,
        content: post.content,
        category: post.category,
        authorId,
        imageUrl: post.imageUrl,
        likes: post.likes,
      },
    });
    created++;
  }
  console.log(`✅ ${created} blog posts creados en español`);
}

// --- Seed Demo: datos clínicos en español ---
async function seedDemoClinicalData(
  allPatients: any[],
  admin: any,
  psychologists: any[],
  nurses: any[],
  moodCodes: string[],
) {
  console.log('📋 Seeding datos clínicos demo en español...');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const riskLevels = ['none', 'low', 'medium', 'high'];

  const medicalRecords: any[] = [];
  const psychologyRecords: any[] = [];

  for (const patient of allPatients) {
    // 85% de los pacientes tienen expediente médico
    if (Math.random() > 0.15) {
      const mr = await prisma.medicalRecord.upsert({
        where: { patientId: patient.id },
        update: {},
        create: {
          patientId: patient.id,
          bloodType: randomElement(bloodTypes),
          allergies: Math.random() > 0.6 ? randomElement(['Penicilina', 'Polen', 'Polvo', 'Sulfas', 'Látex', 'Mariscos', 'Nueces']) : null,
          chronicConditions: Math.random() > 0.75 ? randomElement(['Asma leve', 'Migraña crónica', 'Diabetes tipo 2 en control', 'Hipotiroidismo', 'Gastritis crónica']) : null,
          currentMedications: Math.random() > 0.7 ? randomElement(['Paracetamol 500mg c/8h', 'Omeprazol 20mg c/24h', 'Levotiroxina 50mcg c/24h', 'Salbutamol inhalado c/8h en crisis']) : null,
          familyHistory: Math.random() > 0.5 ? randomElement(['Padre con diabetes tipo 2. Madre con hipertensión arterial.', 'Antecedentes de depresión en línea materna.', 'Abuelo con cardiopatía isquémica. Hermano con asma.', 'Sin antecedentes heredo-familiares de relevancia.']) : null,
          notes: Math.random() > 0.6 ? randomElement(['Paciente cooperador. Signos vitales estables en consulta inicial.', 'Se realizó valoración completa. Sin hallazgos de alarma al momento.', 'Paciente refiere no haber recibido atención médica en los últimos 2 años.']) : null,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      });
      medicalRecords.push(mr);

      // 70% de los expedientes médicos tienen componente psicológico
      if (psychologists.length > 0 && Math.random() > 0.30) {
        const assignedPsych = randomElement(psychologists);
        const pr = await prisma.psychologyRecord.upsert({
          where: { medicalRecordId: mr.id },
          update: {},
          create: {
            medicalRecordId: mr.id,
            initialEvaluationDate: faker.date.past({ years: 1 }),
            chiefComplaint: randomElement(ES_MOTIVOS_CONSULTA),
            psychologicalHistory: randomElement(ES_HISTORIAS_PSICOLOGICAS),
            psychiatricHistory: Math.random() > 0.75 ? 'Sin antecedentes psiquiátricos formales previos.' : null,
            substanceUse: Math.random() > 0.8 ? randomElement(['Consumo ocasional de alcohol los fines de semana.', 'Tabaquismo social. Niega otras sustancias.', 'Refiere consumo de marihuana 1 vez por semana. Se orienta sobre riesgos.']) : null,
            suicideRiskLevel: randomElement(['none', 'none', 'none', 'low', 'low', 'medium']),
            violenceRiskLevel: randomElement(['none', 'none', 'none', 'none', 'low']),
            currentDiagnosisDsm5: Math.random() > 0.4 ? randomElement(ES_DIAGNOSTICOS_DSM5) : null,
            supportNetwork: randomElement(['Red de apoyo conformada por familia nuclear y amigos cercanos dentro del campus.', 'Apoyo limitado. Vive solo en ciudad distinta a su lugar de origen.', 'Cuenta con pareja estable y grupo de amigos como red de apoyo primaria.']),
            assignedPsychologistId: assignedPsych.id,
          },
        });
        psychologyRecords.push(pr);
      }
    }
  }
  console.log(`  ✅ ${medicalRecords.length} expedientes médicos | ${psychologyRecords.length} expedientes psicológicos`);

  // --- Therapy Sessions ---
  let totalSessions = 0;
  for (const pr of psychologyRecords) {
    if (!pr.assignedPsychologistId) continue;
    const numSessions = Math.floor(Math.random() * 10) + 3;
    const startDate = pr.initialEvaluationDate || new Date();
    for (let i = 0; i < numSessions; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + i * 7);
      const selectedMoods = randomElements(moodCodes, 1, 3);
      await prisma.therapySession.upsert({
        where: { psychologyRecordId_sessionNumber: { psychologyRecordId: pr.id, sessionNumber: i + 1 } },
        update: {},
        create: {
          psychologyRecordId: pr.id,
          sessionNumber: i + 1,
          sessionDate,
          sessionDuration: randomElement([45, 50, 60]),
          mood: selectedMoods.join(','),
          evolutionNotes: randomElement(ES_NOTAS_EVOLUCION),
          patientProgress: randomElement(ES_PROGRESOS_PACIENTE),
          assignedTasks: Math.random() > 0.3 ? randomElement(ES_TAREAS_ASIGNADAS) : null,
          observations: Math.random() > 0.5 ? 'Paciente puntual. Se mantiene alianza terapéutica sólida. Continúa comprometido con el proceso.' : null,
          nextSessionPlan: Math.random() > 0.4 ? randomElement(ES_PLANES_SIGUIENTE_SESION) : null,
          therapistId: pr.assignedPsychologistId,
        },
      });
      totalSessions++;
    }
  }
  console.log(`  ✅ ${totalSessions} sesiones de terapia`);

  // --- Treatment Plans ---
  let totalPlans = 0;
  for (const pr of psychologyRecords) {
    if (!pr.assignedPsychologistId) continue;
    const sessionCount = await prisma.therapySession.count({ where: { psychologyRecordId: pr.id } });
    if (sessionCount === 0) continue;
    const numPlans = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < numPlans; i++) {
      const startDate = faker.date.past({ years: 1 });
      await prisma.treatmentPlan.create({
        data: {
          psychologyRecordId: pr.id,
          startDate,
          endDate: Math.random() > 0.4 ? faker.date.future({ years: 1, refDate: startDate }) : null,
          therapeuticApproach: randomElement(ES_ENFOQUES_TERAPEUTICOS),
          goals: randomElement(ES_METAS_TRATAMIENTO),
          interventions: randomElement(ES_INTERVENCIONES),
          status: randomElement(['active', 'active', 'completed', 'on_hold']),
          createdBy: pr.assignedPsychologistId,
        },
      });
      totalPlans++;
    }
  }
  console.log(`  ✅ ${totalPlans} planes de tratamiento`);

  // --- Nursing Consultations ---
  const consultations: any[] = [];
  if (nurses.length > 0) {
    const patientsWithConsultas = randomElements(medicalRecords,
      Math.floor(medicalRecords.length * 0.4),
      Math.floor(medicalRecords.length * 0.6),
    );
    for (const mr of patientsWithConsultas) {
      const numConsultas = Math.floor(Math.random() * 6) + 1;
      for (let i = 0; i < numConsultas; i++) {
        const c = await prisma.nursingConsultation.create({
          data: {
            medicalRecordId: mr.id,
            consultationDate: faker.date.past({ years: 1 }),
            chiefComplaint: randomElement(ES_QUEJAS_ENFERMERIA),
            vitalSignsTemperature: Number((36 + Math.random() * 2.4).toFixed(1)),
            vitalSignsBloodPressureSys: 100 + Math.floor(Math.random() * 40),
            vitalSignsBloodPressureDia: 60 + Math.floor(Math.random() * 30),
            vitalSignsHeartRate: 60 + Math.floor(Math.random() * 40),
            vitalSignsRespiratoryRate: 12 + Math.floor(Math.random() * 8),
            vitalSignsOxygenSaturation: 95 + Math.floor(Math.random() * 5),
            vitalSignsWeight: Number((45 + Math.random() * 55).toFixed(1)),
            vitalSignsHeight: Number((150 + Math.random() * 40).toFixed(1)),
            physicalExamination: 'Paciente consciente, orientado en tiempo, lugar y persona. Hidratado. Sin datos de dificultad respiratoria aparente.',
            diagnosis: Math.random() > 0.2 ? randomElement(ES_DIAGNOSTICOS_ENFERMERIA) : null,
            treatmentPlan: randomElement(ES_PLANES_TRATAMIENTO_ENF),
            observations: Math.random() > 0.5 ? randomElement(ES_OBSERVACIONES_ENFERMERIA) : null,
            nurseId: randomElement(nurses).id,
          },
        });
        consultations.push(c);
      }
    }
    console.log(`  ✅ ${consultations.length} consultas de enfermería`);
  }

  return { medicalRecords, psychologyRecords, consultations };
}

// --- Seed Demo Appointments ---
async function seedDemoAppointments(allPatients: any[], psychologists: any[], nurses: any[]) {
  console.log('📅 Seeding Demo citas...');
  const professionals = [...psychologists, ...nurses];
  if (professionals.length === 0) return;

  const tiposConsulta = ['initial_consultation', 'follow_up', 'emergency', 'routine'];
  let total = 0;

  for (const patient of allPatients) {
    const numCitas = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < numCitas; i++) {
      const isPast = Math.random() > 0.25;
      const date = isPast ? faker.date.past({ years: 1 }) : faker.date.future({ months: 3 });
      const status = isPast ? randomElement(['completed', 'completed', 'cancelled', 'no_show']) : 'scheduled';
      const professional = randomElement(professionals);
      const dept = professional.role === 'psicologo' ? 'psychology' : 'nursing';

      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          professionalId: professional.id,
          appointmentType: randomElement(tiposConsulta),
          department: dept,
          scheduledDate: date,
          durationMinutes: randomElement([30, 45, 50, 60]),
          status,
          cancellationReason: status === 'cancelled' ? randomElement(['El alumno no se presentó sin previo aviso.', 'Reagendado por solicitud del paciente.', 'Cancelado por agenda del profesional.']) : null,
          notes: Math.random() > 0.6 ? 'Cita de seguimiento. Paciente confirma asistencia.' : null,
          createdBy: professional.id,
        },
      });
      total++;
    }
  }
  console.log(`  ✅ ${total} citas agendadas`);
}

// --- Seed Demo Waiting List ---
async function seedDemoWaitingList(allPatients: any[], careers: any[], psychologists: any[]) {
  console.log('⏳ Seeding Demo lista de espera...');
  const motivos = [
    'El alumno solicita primera consulta psicológica por estrés académico acumulado.',
    'Referido por docente por presentar conducta retraída y bajo rendimiento en clase.',
    'Solicita apoyo psicológico tras conflicto familiar que afecta su desempeño.',
    'El alumno refiere ansiedad ante los exámenes finales próximos.',
    'Solicita orientación vocacional y apoyo emocional por cambio de carrera.',
  ];

  let count = 0;
  for (const career of careers) {
    const careerPatients = allPatients.filter((p) => p.careerId === career.id);
    const targetPatients = randomElements(careerPatients, 3, 6);
    for (const patient of targetPatients) {
      const psychologist = psychologists.length > 0 ? randomElement(psychologists) : null;
      await prisma.waitingList.create({
        data: {
          patientId: patient.id,
          department: 'psicologia',
          preferredProfessionalId: psychologist?.id || null,
          requestedDate: faker.date.recent({ days: 20 }),
          priority: randomElement(['baja', 'media', 'alta']),
          status: 'espera',
          reason: randomElement(motivos),
        },
      });
      count++;
    }
  }
  console.log(`  ✅ ${count} entradas en lista de espera`);
}

// --- Seed Demo Notifications ---
async function seedDemoNotifications(allUsers: any[]) {
  console.log('🔔 Seeding Demo notificaciones...');
  const tipos = [
    { type: 'appointment_reminder', title: 'Recordatorio de cita', message: 'Tienes una cita mañana a las 10:00 am. Recuerda presentarte con 5 minutos de anticipación.' },
    { type: 'appointment_confirmation', title: 'Cita confirmada', message: 'Tu cita ha sido confirmada exitosamente. Te esperamos en el Departamento de Psicología.' },
    { type: 'new_message', title: 'Nuevo mensaje de tu psicólogo/a', message: 'Tu terapeuta te ha dejado un mensaje. Revisa tu expediente para más información.' },
    { type: 'system_alert', title: 'Bienvenido al sistema UT-Care', message: 'Tu cuenta ha sido activada. Ya puedes acceder a todos los servicios de salud universitaria.' },
    { type: 'appointment_cancellation', title: 'Cita cancelada', message: 'Lamentamos informarte que tu cita ha sido cancelada. Por favor, agenda una nueva a la brevedad.' },
  ];
  let total = 0;
  for (const user of allUsers) {
    const num = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < num; i++) {
      const t = randomElement(tipos);
      const isRead = Math.random() > 0.35;
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: t.type,
          title: t.title,
          message: t.message,
          priority: randomElement(['low', 'normal', 'high']),
          isRead,
          readAt: isRead ? faker.date.recent({ days: 10 }) : null,
        },
      });
      total++;
    }
  }
  console.log(`  ✅ ${total} notificaciones`);
}

// --- Seed Demo Medications y Prescriptions ---
async function seedDemoPrescriptions(allPatients: any[], medications: any[], nurses: any[], psychologists: any[]) {
  console.log('💊 Seeding Demo prescripciones...');
  const prescribers = [...nurses, ...psychologists];
  if (prescribers.length === 0) return;

  const patientsConReceta = randomElements(allPatients,
    Math.floor(allPatients.length * 0.15),
    Math.floor(allPatients.length * 0.25),
  );
  const frecuencias = ['Una vez al día', 'Cada 8 horas', 'Cada 12 horas', 'Dos veces al día', 'Según necesidad'];
  const vias = ['Oral', 'Tópico', 'Inhalado', 'Subcutáneo'];
  let total = 0;

  for (const patient of patientsConReceta) {
    const numRx = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numRx; i++) {
      const startDate = faker.date.past({ years: 1 });
      await prisma.prescription.create({
        data: {
          patientId: patient.id,
          medicationId: randomElement(medications).id,
          prescribedBy: randomElement(prescribers).id,
          dosage: randomElement(['500mg', '250mg', '100mg', '20mg', '10mg']),
          frequency: randomElement(frecuencias),
          route: randomElement(vias),
          duration: Math.random() > 0.5 ? randomElement(['7 días', '14 días', '30 días', 'Indefinido']) : null,
          startDate,
          endDate: Math.random() > 0.4 ? faker.date.future({ years: 1, refDate: startDate }) : null,
          instructions: randomElement(['Tomar con alimentos para evitar malestar gástrico.', 'Evitar exposición solar directa durante el tratamiento.', 'No combinar con alcohol.', 'Tomar en ayunas con un vaso de agua.']),
          status: randomElement(['active', 'active', 'completed', 'discontinued']),
        },
      });
      total++;
    }
  }
  console.log(`  ✅ ${total} prescripciones`);
}

// --- Seed Demo Professional Schedules ---
async function seedDemoProfessionalSchedules(psychologists: any[], nurses: any[]) {
  console.log('⏰ Seeding Demo horarios profesionales...');
  const professionals = [...psychologists, ...nurses];
  const diasLaborales = [1, 2, 3, 4, 5];
  let total = 0;

  for (const pro of professionals) {
    const dias = randomElements(diasLaborales, 4, 5);
    for (const dia of dias) {
      const startHour = randomElement([8, 9]);
      const endHour = randomElement([16, 17, 18]);
      await prisma.professionalSchedule.create({
        data: {
          professionalId: pro.id,
          dayOfWeek: dia,
          startTime: new Date(`2000-01-01T${String(startHour).padStart(2, '0')}:00:00`),
          endTime: new Date(`2000-01-01T${String(endHour).padStart(2, '0')}:00:00`),
          isActive: true,
        },
      });
      total++;
    }
  }
  console.log(`  ✅ ${total} horarios profesionales`);
}

// --- Seed Demo Interconsultations ---
async function seedDemoInterconsultations(allPatients: any[], psychologists: any[], nurses: any[]) {
  if (psychologists.length === 0 || nurses.length === 0) return;
  console.log('🔄 Seeding Demo interconsultas...');

  const motivosInter = [
    'Se refiere a psicología por cuadro ansioso identificado durante consulta de enfermería.',
    'Se solicita valoración de enfermería por paciente con síntomas somáticos asociados a estrés.',
    'Paciente con cefalea recurrente es referido a psicología para descartar componente emocional.',
    'Se solicita interconsulta a enfermería para control de tensión arterial elevada en paciente con ansiedad.',
    'Psicología refiere a enfermería por paciente que refiere no dormir y presenta ojeras marcadas.',
  ];

  const patientsConIC = randomElements(allPatients,
    Math.floor(allPatients.length * 0.08),
    Math.floor(allPatients.length * 0.15),
  );
  let total = 0;

  for (const patient of patientsConIC) {
    const fromPsych = Math.random() > 0.5;
    const fromProf = fromPsych ? randomElement(psychologists) : randomElement(nurses);
    const toProf = fromPsych ? randomElement(nurses) : randomElement(psychologists);
    const status = randomElement(['pending', 'in_progress', 'completed']);
    const responded = status !== 'pending';

    await prisma.interconsultation.create({
      data: {
        patientId: patient.id,
        fromDepartment: fromPsych ? 'psychology' : 'nursing',
        toDepartment: fromPsych ? 'nursing' : 'psychology',
        fromProfessionalId: fromProf.id,
        toProfessionalId: toProf.id,
        reason: randomElement(motivosInter),
        relevantInformation: 'Paciente en seguimiento activo. Se comparte información clínica relevante para continuidad del cuidado.',
        urgency: randomElement(['routine', 'routine', 'urgent']),
        status,
        response: responded ? 'Se recibe interconsulta. Paciente valorado. Se integra al plan de atención multidisciplinaria.' : null,
        respondedBy: responded ? toProf.id : null,
        respondedAt: responded ? faker.date.recent({ days: 14 }) : null,
      },
    });
    total++;
  }
  console.log(`  ✅ ${total} interconsultas`);
}

// ============ ORQUESTADOR PRINCIPAL DEMO ============
async function seedDemo() {
  console.log('\n🎓 Iniciando SEED DEMO para exposición universitaria...\n');

  await clearDatabase();
  const careers = await seedCareers();
  const moodCodes = await seedMoods();

  const defaultPasswordHash = await hashPassword(DEFAULT_SEED_PASSWORD);
  usedUsernames.clear();

  // Staff fijo
  console.log('👤 Seeding staff (usuarios reales)...');
  const staffUsers: any[] = [];
  for (const s of STAFF_SEED_DATA) {
    const username = generateUniqueUsername(s.firstName, s.lastName);
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { passwordHash: defaultPasswordHash, username, isConfirmed: true, mustChangePassword: false, sex: s.sex, role: s.role },
      create: {
        email: s.email,
        username,
        passwordHash: defaultPasswordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: new Date('1990-01-15'),
        role: s.role,
        enrollmentNumber: s.enrollmentNumber,
        sex: s.sex,
        phone: faker.string.numeric(10),
        isConfirmed: true,
        mustChangePassword: false,
      },
    });
    staffUsers.push(user);
  }
  console.log(`✅ ${staffUsers.length} usuarios de staff creados`);

  const admin = staffUsers.find((u) => u.role === 'admin')!;
  const psychologists = staffUsers.filter((u) => u.role === 'psicologo');
  const nurses = staffUsers.filter((u) => u.role === 'enfermero');

  await seedPsychologistCareers(psychologists, careers);

  // Pacientes (alumnos + docentes)
  const { allPatientUsers, allPatients } = await seedDemoPatients(careers);

  // Contactos de emergencia (70% de los pacientes)
  const patientsWithContacts = randomElements(allPatients,
    Math.floor(allPatients.length * 0.65),
    Math.floor(allPatients.length * 0.75),
  );
  await seedEmergencyContacts(patientsWithContacts);

  // Datos clínicos
  const { consultations } = await seedDemoClinicalData(allPatients, admin, psychologists, nurses, moodCodes);

  // Medicamentos y prescripciones
  const medications = await seedMedications();
  await seedDemoPrescriptions(allPatients, medications, nurses, psychologists);

  // Citas
  await seedDemoAppointments(allPatients, psychologists, nurses);

  // Horarios profesionales
  await seedDemoProfessionalSchedules(psychologists, nurses);

  // Lista de espera
  await seedDemoWaitingList(allPatients, careers, psychologists);

  // Interconsultas
  await seedDemoInterconsultations(allPatients, psychologists, nurses);

  // Blog posts
  await seedDemoBlogPosts(admin.id);

  // Notificaciones
  const allUsers = [...staffUsers, ...allPatientUsers];
  await seedDemoNotifications(allUsers);

  // Resumen final
  await printTableCounts();

  console.log('\n🔑 CREDENCIALES STAFF (SEED DEMO) — Contraseña: ' + DEFAULT_SEED_PASSWORD);
  console.table(
    staffUsers.map((u) => ({
      Nombre: `${u.firstName} ${u.lastName}`,
      Username: u.username,
      Email: u.email,
      Rol: u.role,
    })),
  );
  console.log(`\n✅ SEED DEMO completado — ${allPatients.length} pacientes + ${staffUsers.length} staff | Contraseña: ${DEFAULT_SEED_PASSWORD}`);
}

// Clear database helper
async function clearDatabase() {
  console.log('🗑️ Clearing database (except Careers)...');
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.interconsultation.deleteMany();
  await prisma.professionalSchedule.deleteMany();
  await prisma.waitingList.deleteMany();
  await prisma.appointmentReminder.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.prescriptionAdministration.deleteMany();
  await prisma.medicationAdministration.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.nursingProcedure.deleteMany();
  await prisma.nursingConsultation.deleteMany();
  await prisma.treatmentPlan.deleteMany();
  await prisma.therapySession.deleteMany();
  await prisma.mood.deleteMany();
  await prisma.psychometricEvaluation.deleteMany();
  await prisma.psychologyRecord.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.psychologistCareer.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database cleared!');
}

// Clean seed target: only admin user and careers
async function seedClean() {
  await clearDatabase();
  await seedCareers();
  await seedMoods();

  const defaultPasswordHash = await hashPassword(DEFAULT_SEED_PASSWORD);
  usedUsernames.clear();

  const staffToCreate = STAFF_SEED_DATA;

  console.log('👤 Seeding staff users for CLEAN...');
  const createdCleanUsers = [];
  for (const s of staffToCreate) {
    const username = generateUniqueUsername(s.firstName, s.lastName);
    const user = await prisma.user.create({
      data: {
        email: s.email,
        username,
        passwordHash: defaultPasswordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        dateOfBirth: new Date('1990-01-15'),
        role: s.role,
        enrollmentNumber: s.enrollmentNumber,
        sex: s.sex,
        isConfirmed: true,
        mustChangePassword: false,
      },
    });
    createdCleanUsers.push(user);
  }
  console.log('✅ Staff users created successfully!');
  console.log('\n🔑 USUARIOS CREADOS (SEED: CLEAN) - CONTRASEÑA: ' + DEFAULT_SEED_PASSWORD);
  console.table(
    createdCleanUsers.map((s) => ({
      'Nombre Completo': `${s.firstName} ${s.lastName}`,
      'Nombre de Usuario (Username)': s.username,
      'Correo Electrónico': s.email,
      'Rol': s.role
    }))
  );
  console.log('✅ Seed CLEAN completed. Admin and all staff role users exist.');
}

// Main seed function
async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    const target = process.env.SEED_TARGET || 'clean';
    if (target === 'prod') {
      await seedProd();
    } else if (target === 'robust') {
      await seedRobust();
    } else if (target === 'dev') {
      await seedDev();
    } else if (target === 'demo') {
      await seedDemo();
    } else {
      await seedClean();
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Execute main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
