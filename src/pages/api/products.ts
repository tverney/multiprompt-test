/* TODO: this API fetches the products from the database and returns them as JSON. 
   Here we are using the Next.js API routes to create an API endpoint.
   This also use as DB Fauna DB.
*/
import { NextApiRequest, NextApiResponse } from 'next';
import productAPI from '../../db/fauna';
export interface Product {
	// Define the properties of a product here
	// For example:
	id: string;
	images: string[];
	description: string;
	name: string;
	price: number;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Product[] | { error: string }>,
) {
	if (req.method !== 'GET') {
		try {
			const products: { data?: Product[] } = await productAPI.getAllProducts();
			if (products?.data) res.status(200).json(products.data);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	}
}
