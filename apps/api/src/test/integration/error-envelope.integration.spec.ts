import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './create-test-app';
import { prepareTestDatabase } from './test-database';

describe('api error envelope (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await prepareTestDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('shapes an unmatched route as the api error envelope with a request id', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/does-not-exist',
    );

    expect(response.status).toBe(404);
    expect(response.body.statusCode).toBe(404);
    expect(response.body.error).toBe('Not Found');
    expect(response.body.message).toBe('Cannot GET /api/does-not-exist');
    expect(typeof response.body.requestId).toBe('string');
    expect(response.body.requestId.length).toBeGreaterThan(0);
    expect(response.headers['x-request-id']).toBe(response.body.requestId);
  });

  it('echoes a valid inbound x-request-id into the response and envelope', async () => {
    const requestId = 'req-abc_123';
    const response = await request(app.getHttpServer())
      .get('/api/does-not-exist')
      .set('x-request-id', requestId);

    expect(response.headers['x-request-id']).toBe(requestId);
    expect(response.body.requestId).toBe(requestId);
  });

  it('replaces an invalid inbound x-request-id with a generated one', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/does-not-exist')
      .set('x-request-id', 'has spaces and % illegal');

    expect(response.body.requestId).not.toBe('has spaces and % illegal');
    expect(response.headers['x-request-id']).toBe(response.body.requestId);
    expect(response.body.requestId.length).toBeGreaterThan(0);
  });
});
