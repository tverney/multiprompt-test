import handler from '../pages/api/products';
import { createMocks } from 'node-mocks-http';

describe('/api/products', () => {
  test('GET request returns products', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(Array.isArray(JSON.parse(res._getData()))).toBe(true);
  });

  test('Non-GET request returns error', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData()).error).toBeDefined();
  });
});
