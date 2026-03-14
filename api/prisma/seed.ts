import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Constants for data generation
const SALT_ROUNDS = 10;
const MIN_PATIENTS = 50;

// Role distribution (percentages)
const ROLE_DISTRIBUTION = {
  PATIENT: 0.80,          // 80%
  PSYCHOLOGIST: 0.10,     // 10%
  NURSE: 0.05,            // 5%
  PSYCHOLOGY_COORDINATOR: 1,
  NURSING_COORDINATOR: 1,
  SYSTEM_ADMIN: 1,
};

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
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

// Seed Users with role distribution
async function seedUsers(_careers: any[]) {
  console.log('👥 Seeding Users...');

  const users = [];
  const defaultPassword = await hashPassword('Password123!');

  // Calculate role counts
  const totalUsers = Math.max(MIN_PATIENTS, 62); // Ensure we have enough users
  const numPatients = Math.floor(totalUsers * ROLE_DISTRIBUTION.PATIENT);
  const numPsychologists = Math.floor(totalUsers * ROLE_DISTRIBUTION.PSYCHOLOGIST);
  const numNurses = Math.floor(totalUsers * ROLE_DISTRIBUTION.NURSE);

  // Create System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ehr-system.com' },
    update: {},
    create: {
      email: 'admin@ehr-system.com',
      passwordHash: defaultPassword,
      firstName: 'Sistema',
      lastName: 'Administrador',
      dateOfBirth: faker.date.past({ years: 40 }),
      phone: faker.string.numeric(10),
      role: 'admin',
      isActive: true,
    },
  });
  users.push(admin);

  // Create Psychology Coordinator
  const psychCoordinator = await prisma.user.upsert({
    where: { email: 'coord.psicologia@ehr-system.com' },
    update: {},
    create: {
      email: 'coord.psicologia@ehr-system.com',
      passwordHash: defaultPassword,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date.past({ years: 40 }),
      phone: faker.string.numeric(10),
      role: 'coordinador_psicologia',
      isActive: true,
    },
  });
  users.push(psychCoordinator);

  // Create Nursing Coordinator
  const nurseCoordinator = await prisma.user.upsert({
    where: { email: 'coord.enfermeria@ehr-system.com' },
    update: {},
    create: {
      email: 'coord.enfermeria@ehr-system.com',
      passwordHash: defaultPassword,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date.past({ years: 40 }),
      phone: faker.string.numeric(10),
      role: 'coordinador_enfermeria',
      isActive: true,
    },
  });
  users.push(nurseCoordinator);

  // Create Psychologists
  const psychologists = [];
  for (let i = 0; i < numPsychologists; i++) {
    const email = `psicologo${i + 1}@ehr-system.com`;
    const psychologist = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: defaultPassword,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date.past({ years: 35 }),
        phone: faker.string.numeric(10),
        role: 'psicologo',
        isActive: true,
      },
    });
    psychologists.push(psychologist);
    users.push(psychologist);
  }

  // Create Nurses
  const nurses = [];
  for (let i = 0; i < numNurses; i++) {
    const email = `enfermera${i + 1}@ehr-system.com`;
    const nurse = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: defaultPassword,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date.past({ years: 35 }),
        phone: faker.string.numeric(10),
        role: 'enfermero',
        isActive: true,
      },
    });
    nurses.push(nurse);
    users.push(nurse);
  }

  // Create Patients
  const patients = [];
  for (let i = 0; i < numPatients; i++) {
    const email = `estudiante${i + 1}@ehr-system.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: defaultPassword,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date.past({ years: 25, refDate: new Date('2005-01-01') }),
        phone: faker.string.numeric(10),
        enrollmentNumber: faker.string.alphanumeric(10).toUpperCase(),
        role: 'patient',
        isActive: true,
      },
    });
    patients.push(user);
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users (${numPatients} patients, ${numPsychologists} psychologists, ${numNurses} nurses, 3 coordinators/admins)`);
  return { users, patients, psychologists, nurses, admin, psychCoordinator, nurseCoordinator };
}

// Seed Patients
async function seedPatients(patientUsers: any[], careers: any[]) {
  console.log('🏥 Seeding Patient records...');

  const patients = [];
  const patientTypes = ['student', 'faculty', 'administrative'];
  const maritalStatuses = ['single', 'married', 'divorced', 'widowed'];

  for (const user of patientUsers) {
    const career = randomElement(careers);
    const patientType = patientTypes[Math.floor(Math.random() * 10) < 8 ? 0 : Math.floor(Math.random() * 3)];

    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        patientType,
        maritalStatus: randomElement(maritalStatuses),
        guardianName: patientType === 'student' && Math.random() > 0.5 ? faker.person.fullName() : undefined,
        guardianPhone: patientType === 'student' && Math.random() > 0.5 ? faker.string.numeric(10) : undefined,
        careerId: career.id,
        group: patientType === 'student' ? faker.string.alphanumeric(3).toUpperCase() : undefined,
        occupation: patientType !== 'student' ? faker.person.jobTitle() : undefined,
        trimester: patientType === 'student' ? Math.floor(Math.random() * 12) + 1 : undefined,
      },
    });
    patients.push(patient);
  }

  console.log(`✅ Created ${patients.length} patient records`);
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
      where: { careerId: career.id },
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

// Seed Therapy Sessions
async function seedTherapySessions(psychologyRecords: any[], _psychologists: any[]) {
  console.log('💬 Seeding Therapy Sessions...');

  const moods = ['calm', 'anxious', 'depressed', 'angry', 'happy', 'neutral', 'irritable'];
  let totalSessions = 0;

  for (const psychologyRecord of psychologyRecords) {
    if (!psychologyRecord.assignedPsychologistId) continue;

    const numSessions = Math.floor(Math.random() * 11) + 5; // 5-15 sessions
    const startDate = psychologyRecord.initialEvaluationDate || new Date();

    for (let i = 0; i < numSessions; i++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + (i * 7)); // Weekly sessions

      await prisma.therapySession.create({
        data: {
          psychologyRecordId: psychologyRecord.id,
          sessionNumber: i + 1,
          sessionDate,
          sessionDuration: 50,
          mood: randomElement(moods),
          evolutionNotes: faker.lorem.paragraph(),
          patientProgress: faker.lorem.sentence(),
          assignedTasks: Math.random() > 0.3 ? faker.lorem.sentence() : null,
          observations: Math.random() > 0.5 ? faker.lorem.sentence() : null,
          nextSessionPlan: Math.random() > 0.4 ? faker.lorem.sentence() : null,
          therapistId: psychologyRecord.assignedPsychologistId,
        },
      });
      totalSessions++;
    }
  }

  console.log(`✅ Created ${totalSessions} therapy sessions`);
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

// Main seed function
async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log(`⚠️  Database already contains ${existingUsers} users.`);
      console.log('   To re-seed, first reset the database with: npx prisma migrate reset');
      console.log('   Or manually delete existing data.\n');
      return;
    }

    // Seed in order of dependencies
    const careers = await seedCareers();
    
    const { users, patients: patientUsers, psychologists, nurses, admin } = await seedUsers(careers);
    
    const patients = await seedPatients(patientUsers, careers);
    
    await seedPsychologistCareers(psychologists, careers);
    
    await seedEmergencyContacts(patients);
    
    const medicalRecords = await seedMedicalRecords(patients, admin);
    
    const psychologyRecords = await seedPsychologyRecords(medicalRecords, psychologists);
    
    await seedTherapySessions(psychologyRecords, psychologists);
    
    await seedTreatmentPlans(psychologyRecords);
    
    await seedPsychometricEvaluations(psychologyRecords, psychologists);
    
    const nursingConsultations = await seedNursingConsultations(medicalRecords, nurses);
    
    await seedNursingProcedures(nursingConsultations, nurses);
    
    const medications = await seedMedications();
    
    await seedPrescriptions(patients, medications, nurses, psychologists);
    
    await seedMedicationAdministration(nursingConsultations, medications, nurses);
    
    await seedAppointments(patients, psychologists, nurses);
    
    await seedProfessionalSchedules(psychologists, nurses);
    
    await seedInterconsultations(patients, psychologists, nurses);
    
    await seedNotifications(users);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Careers: ${careers.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Patients: ${patients.length}`);
    console.log(`   - Default password for all users: Password123!`);
    console.log('\n🔐 Test accounts:');
    console.log('   - Admin: admin@ehr-system.com');
    console.log('   - Psychology Coordinator: coord.psicologia@ehr-system.com');
    console.log('   - Nursing Coordinator: coord.enfermeria@ehr-system.com');
    console.log('   - Psychologist: psicologo1@ehr-system.com');
    console.log('   - Nurse: enfermera1@ehr-system.com');
    console.log('   - Patient: estudiante1@ehr-system.com');

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
