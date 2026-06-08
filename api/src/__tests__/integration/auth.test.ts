import request from 'supertest';
import app from '../../app';

describe('Auth API (Integration & Black Box)', () => {
  const loginData = {
    username: 'EdgarGMZ',
    password: 'Password123!'
  };

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.email).toEqual('admin@ehr-system.com');
  });

  it('should fail with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'EdgarGMZ',
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
