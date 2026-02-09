import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('should return 200 OK and "API is up and running"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toEqual('API is up and running');
  });
});