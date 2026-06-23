import request from 'supertest';
import app from '../../app';
import prisma from '../../config/database';

describe('Performance & Stress Testing', () => {
  let adminUsername = 'EdgarGMZ';

  beforeAll(async () => {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    if (admin) {
      adminUsername = admin.username;
    }
  });

  it('Performance: login should respond within 500ms under normal conditions', async () => {
    const start = Date.now();
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: adminUsername,
        password: 'Password123!'
      });
    const end = Date.now();
    const duration = end - start;

    expect(res.statusCode).toEqual(200);
    expect(duration).toBeLessThan(500); // Threshold for performance
    console.log(`Login response time: ${duration}ms`);
  });

  it('Stress: handle 50 concurrent login attempts', async () => {
    const concurrentRequests = 50;
    const requests = Array.from({ length: concurrentRequests }, () => 
      request(app).post('/api/auth/login').send({
        username: adminUsername,
        password: 'Password123!'
      })
    );

    const start = Date.now();
    const results = await Promise.all(requests);
    const end = Date.now();
    const duration = end - start;

    const successful = results.filter(r => r.statusCode === 200).length;
    
    console.log(`Stress test (50 concurrent reqs) duration: ${duration}ms`);
    console.log(`Successful requests: ${successful}/${concurrentRequests}`);
    
    expect(successful).toBe(concurrentRequests);
    expect(duration).toBeLessThan(5000); // Threshold for stress (5s for 50 concurrent)
  });
});
