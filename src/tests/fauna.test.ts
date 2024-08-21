import productAPI from '../db/fauna';

describe('productAPI', () => {
	test('getAllProducts returns an array of products', async () => {
		const products = await productAPI.getAllProducts();
		expect(Array.isArray(products)).toBe(true);
	});

	test('createProduct returns a product with an id', async () => {
		const sampleProduct = {
			name: 'Test Product',
			price: 9.99,
			description: 'This is a test product',
		};
		const createdProduct = await productAPI.createProduct(sampleProduct);
		expect(createdProduct.id).toBeDefined();
	});

	test('getProduct returns the correct product', async () => {
		const sampleProduct = {
			name: 'Test Product',
			price: 9.99,
			description: 'This is a test product',
		};
		const createdProduct = await productAPI.createProduct(sampleProduct);
		const retrievedProduct = await productAPI.getProduct(createdProduct.id);
		expect(retrievedProduct).toEqual(createdProduct);
	});

	test('updateProduct updates the product correctly', async () => {
		const sampleProduct = {
			name: 'Test Product',
			price: 9.99,
			description: 'This is a test product',
		};
		const createdProduct = await productAPI.createProduct(sampleProduct);
		const updatedName = 'Updated Test Product';
		const updatedProduct = { ...createdProduct, name: updatedName };
		await productAPI.updateProduct(createdProduct.id, updatedProduct);
		const retrievedProduct = await productAPI.getProduct(createdProduct.id);
		expect(retrievedProduct.name).toBe(updatedName);
	});

	test('deleteProduct deletes the product', async () => {
		const sampleProduct = {
			name: 'Test Product',
			price: 9.99,
			description: 'This is a test product',
		};
		const createdProduct = await productAPI.createProduct(sampleProduct);
		await productAPI.deleteProduct(createdProduct.id);
		await expect(productAPI.getProduct(createdProduct.id)).rejects.toThrow();
	});
});
