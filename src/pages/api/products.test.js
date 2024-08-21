import { createMocks } from 'node-mocks-http';
import handleProducts from './products';
import { createProduct, getProducts, updateProduct, deleteProduct } from '@/lib/fauna';
import stripe from '@/lib/stripe';

jest.mock('@/lib/fauna', () => ({
  createProduct: jest.fn(),
  getProducts: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock('@/lib/stripe', () => ({
  products: {
    create: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
  }
}));

describe('/api/products', () => {
  test('POST /api/products creates product', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Product',
        description: 'Description',
        price: 10,
      },
    });

    await handleProducts(req, res);

    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Product' })
    );
    expect(stripe.products.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Product' })
    );
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ name: 'Product' })
    );
  });

  test('GET /api/products returns products', async () => {
    const products = [{ name: 'Product 1' }, { name: 'Product 2' }];
    (getProducts as jest.Mock).mockResolvedValueOnce(products);

    const { req, res } = createMocks({
      method: 'GET',
    });
  
    await handleProducts(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(products);
  });

  test('PUT /api/products updates product', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
      body: {
        id: '1',
        name: 'Updated Product',
      },
    }); 

    await handleProducts(req, res);

    expect(updateProduct).toHaveBeenCalledWith('1', { name: 'Updated Product' });
    expect(stripe.products.update).toHaveBeenCalledWith('1', { name: 'Updated Product' });
    expect(res._getStatusCode()).toBe(200);
  });

  test('DELETE /api/products deletes product', async () => {
    const { req, res } = createMocks({
      method: 'DELETE', 
      query: {
        id: '1',
      },
    });

    await handleProducts(req, res);
  
    expect(deleteProduct).toHaveBeenCalledWith('1');
    expect(stripe.products.del).toHaveBeenCalledWith('1');
    expect(res._getStatusCode()).toBe(204);
  });
});
