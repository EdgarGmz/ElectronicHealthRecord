import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';

describe('AuditLog API (Integration)', () => {
  let adminToken: string;
  let coordinatorToken: string;
  let psychologistToken: string;

  let adminUser: any;
  let coordinatorUser: any;
  let psychologistUser: any;
  let mockLog1: any;
  let mockLog2: any;

  beforeAll(async () => {
    // Limpieza previa opcional para pruebas
    const emailSuffix = Date.now();
    const adminEmail = `admin.test.${emailSuffix}@utcare.com`;
    const coordEmail = `coord.test.${emailSuffix}@utcare.com`;
    const psychEmail = `psych.test.${emailSuffix}@utcare.com`;

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // 1. Crear usuarios de prueba en la base de datos
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: `admin_${emailSuffix}`,
        passwordHash,
        firstName: 'Admin',
        lastName: 'Test',
        role: 'admin',
        sex: 'male',
        dateOfBirth: new Date('1990-01-01'),
        isConfirmed: true,
      },
    });

    coordinatorUser = await prisma.user.create({
      data: {
        email: coordEmail,
        username: `coord_${emailSuffix}`,
        passwordHash,
        firstName: 'Coord',
        lastName: 'Psicologia',
        role: 'coordinador_psicologia',
        sex: 'female',
        dateOfBirth: new Date('1990-01-01'),
        isConfirmed: true,
      },
    });

    psychologistUser = await prisma.user.create({
      data: {
        email: psychEmail,
        username: `psych_${emailSuffix}`,
        passwordHash,
        firstName: 'Psicologa',
        lastName: 'Test',
        role: 'psicologo',
        sex: 'female',
        dateOfBirth: new Date('1990-01-01'),
        isConfirmed: true,
      },
    });

    // 2. Iniciar sesión para obtener los tokens
    const loginAdmin = await request(app)
      .post('/api/auth/login')
      .send({ username: adminUser.username, password: 'Password123!' });
    adminToken = loginAdmin.body.data.accessToken;

    const loginCoord = await request(app)
      .post('/api/auth/login')
      .send({ username: coordinatorUser.username, password: 'Password123!' });
    coordinatorToken = loginCoord.body.data.accessToken;

    const loginPsych = await request(app)
      .post('/api/auth/login')
      .send({ username: psychologistUser.username, password: 'Password123!' });
    psychologistToken = loginPsych.body.data.accessToken;

    // 3. Crear algunos logs de auditoría de prueba
    mockLog1 = await prisma.auditLog.create({
      data: {
        userId: psychologistUser.id,
        action: 'CREATE',
        tableName: 'patients',
        recordId: '00000000-0000-0000-0000-000000000000',
        newValues: { patientName: 'Juanito Gomez' },
        ipAddress: '127.0.0.1',
        userAgent: 'TestAgent',
      },
    });

    mockLog2 = await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'UPDATE',
        tableName: 'careers',
        recordId: '00000000-0000-0000-0000-000000000000',
        newValues: { careerName: 'TI' },
        ipAddress: '127.0.0.1',
        userAgent: 'TestAgent',
      },
    });
  });

  afterAll(async () => {
    // Limpiar todos los logs de auditoría creados por las acciones del test de estos usuarios
    await prisma.auditLog.deleteMany({
      where: {
        userId: { in: [adminUser.id, coordinatorUser.id, psychologistUser.id] },
      },
    });

    // Limpiar usuarios
    await prisma.user.deleteMany({
      where: {
        id: { in: [adminUser.id, coordinatorUser.id, psychologistUser.id] },
      },
    });
  });

  describe('GET /api/audit-logs', () => {
    it('should fail (401) when no authorization token is provided', async () => {
      const res = await request(app).get('/api/audit-logs');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail (403) for non-authorized roles (e.g. psychologist)', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${psychologistToken}`);
      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });

    it('should succeed (200) for admin and return all logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('auditLogs');
      expect(res.body.data.auditLogs.length).toBeGreaterThanOrEqual(2);
    });

    it('should succeed (200) for coordinator and filter out other department logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${coordinatorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // El coordinador de psicología solo debe ver logs de psicología (psicólogo o coord. psicología).
      // El log2 fue realizado por el admin, así que no debe listarse para el coordinador de psicología.
      const hasAdminLog = res.body.data.auditLogs.some((l: any) => l.id === mockLog2.id);
      const hasPsychLog = res.body.data.auditLogs.some((l: any) => l.id === mockLog1.id);

      expect(hasAdminLog).toBe(false);
      expect(hasPsychLog).toBe(true);
    });

    it('should fail (400) if page query is invalid', async () => {
      const res = await request(app)
        .get('/api/audit-logs?page=-1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
});
