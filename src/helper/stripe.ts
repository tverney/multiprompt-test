/* TODO: this is a helper function to sync products from the Fauna DB to the Stripe API.
It should create products and remove products that are not in the Fauna DB anymore. */
import Stripe from 'stripe';
import productsAPI from '@/db/fauna';
import { Product } from '@/pages/api/products';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
	apiVersion: '2024-06-20',
});

export async function syncProductsWithStripe() {
	const { data: products }: { data?: Product[] } =
		await productsAPI.getAllProducts();

	if (!products) {
		return;
	}

	for (const product of products) {
		const { id, name, price, images, description } = product;
		const stripeProduct = await stripe.products.retrieve(id).catch(() => null);

		if (!stripeProduct) {
			await stripe.products.create({
				id,
				name,
				description,
				images,
				default_price_data: {
					currency: 'usd',
					unit_amount: price,
				},
			});
		} else {
			await stripe.products.update(id, {
				name,
				description,
				images,
				default_price: price.toString(),
			});
		}
	}
	const stripeProducts = await stripe.products.list({ limit: 100 });
	const stripeProductIds = stripeProducts.data.map((p) => p.id);
	const productIdsToDelete = stripeProductIds.filter(
		(id: string) => !products.some((p) => p.id === id),
	);
	for (const productId of productIdsToDelete) {
		await stripe.products.del(productId);
	}
}
