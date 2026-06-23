import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database';

describe('Auth API (Integration & Black Box)', () => {
  let adminUsername = 'JuanCST';
  let adminEmail = '22035@virtual.utsc.edu.mx';

  beforeAll(async () => {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    if (admin) {
      adminUsername = admin.username;
      adminEmail = admin.email;
    }
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: adminUsername,
        password: 'Password123!'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.email).toEqual(adminEmail);
  });

  it('should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: adminUsername,
        password: 'wrongPassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid credentials');
  });

  it('should fail with non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent',
        password: 'Password123!'
      });

    expect(res.statusCode).toEqual(401);
  });
});

