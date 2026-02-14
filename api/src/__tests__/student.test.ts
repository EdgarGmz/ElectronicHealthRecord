import request from 'supertest';
import app from '../app';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';

/**
 * Student API Tests
 * Tests the /api/students endpoints for listing and retrieving students
 */
describe('Student API', () => {
  let authToken: string;
  let studentId: string;
  let careerId: string;

  beforeAll(async () => {
    // Create a test career
    const career = await prisma.career.create({
      data: {
        name: 'Computer Science',
        code: 'CS',
      },
    });
    careerId = career.id;

    // Create a test admin user for authentication
    const hashedPassword = await hashPassword('testpassword123');
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        role: 'admin',
      },
    });

    // Login to get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'testpassword123',
      });
    
    authToken = loginRes.body.data.accessToken;

    // Create a test student
    const studentUser = await prisma.user.create({
      data: {
        email: 'student@test.com',
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-01'),
        enrollmentNumber: 'ST001',
        role: 'patient',
      },
    });

    const student = await prisma.patient.create({
      data: {
        userId: studentUser.id,
        patientType: 'student',
        careerId: careerId,
      },
    });

    studentId = student.id;

    // Create another student for pagination testing
    const studentUser2 = await prisma.user.create({
      data: {
        email: 'student2@test.com',
        passwordHash: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('2001-01-01'),
        enrollmentNumber: 'ST002',
        role: 'patient',
      },
    });

    await prisma.patient.create({
      data: {
        userId: studentUser2.id,
        patientType: 'student',
        careerId: careerId,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.patient.deleteMany({
      where: {
        user: {
          email: {
            in: ['student@test.com', 'student2@test.com'],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@test.com', 'student@test.com', 'student2@test.com'],
        },
      },
    });

    await prisma.career.deleteMany({
      where: {
        code: 'CS',
      },
    });

    await prisma.$disconnect();
  });

  describe('GET /api/students', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/students');
      expect(res.statusCode).toEqual(401);
    });

    it('should return list of students with pagination', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Students retrieved successfully');
      expect(res.body.data).toHaveProperty('students');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.students)).toBe(true);
      expect(res.body.data.pagination).toHaveProperty('page');
      expect(res.body.data.pagination).toHaveProperty('limit');
      expect(res.body.data.pagination).toHaveProperty('total');
      expect(res.body.data.pagination).toHaveProperty('totalPages');
    });

    it('should support search by enrollment number', async () => {
      const res = await request(app)
        .get('/api/students?search=ST001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.students.length).toBeGreaterThan(0);
      
      const student = res.body.data.students[0];
      expect(student.user.enrollmentNumber).toContain('ST001');
    });

    it('should support search by name', async () => {
      const res = await request(app)
        .get('/api/students?search=John')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      
      if (res.body.data.students.length > 0) {
        const student = res.body.data.students[0];
        expect(student.user.firstName.toLowerCase()).toContain('john');
      }
    });

    it('should support filtering by career', async () => {
      const res = await request(app)
        .get(`/api/students?careerId=${careerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      
      res.body.data.students.forEach((student: any) => {
        expect(student.careerId).toEqual(careerId);
      });
    });

    it('should support pagination parameters', async () => {
      const res = await request(app)
        .get('/api/students?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination.page).toEqual(1);
      expect(res.body.data.pagination.limit).toEqual(1);
      expect(res.body.data.students.length).toBeLessThanOrEqual(1);
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const res = await request(app)
        .get('/api/students?page=-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(400);
    });

    it('should return 400 for invalid career ID', async () => {
      const res = await request(app)
        .get('/api/students?careerId=invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/students/:id', () => {
    it('should require authentication', async () => {
      const res = await request(app).get(`/api/students/${studentId}`);
      expect(res.statusCode).toEqual(401);
    });

    it('should return student details by ID', async () => {
      const res = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Student retrieved successfully');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('career');
      expect(res.body.data.user).toHaveProperty('enrollmentNumber');
      expect(res.body.data.user.enrollmentNumber).not.toBeNull();
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request(app)
        .get('/api/students/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(400);
    });

    it('should return 404 for non-existent student', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/students/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });
});
