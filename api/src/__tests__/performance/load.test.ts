import request from 'supertest';
import app from '../../app';

describe('Performance & Stress Testing', () => {
  const loginData = {
    username: 'EdgarGMZ',
    password: 'Password123!'
  };

  it('Performance: login should respond within 500ms under normal conditions', async () => {
    const start = Date.now();
    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);
    const end = Date.now();
    const duration = end - start;

    expect(res.statusCode).toEqual(200);
    expect(duration).toBeLessThan(500); // Threshold for performance
    console.log(`Login response time: ${duration}ms`);
  });

  it('Stress: handle 50 concurrent login attempts', async () => {
    const concurrentRequests = 50;
    const requests = Array.from({ length: concurrentRequests }, () => 
      request(app).post('/api/auth/login').send(loginData)
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
