/* TODO: this file do all the DB queries to Fauna DB. 

It should include all products fetching, creating, updating and deleting functions.
*/
import { Product } from '@/pages/api/products';
import { query as q } from 'faunadb';
import faunadb from 'faunadb';

const client = new faunadb.Client({
	secret: process.env.FAUNA_SECRET || '',
});

const productAPI = {
	getAllProducts: () => {
		return client.query(
			q.Map(
				q.Paginate(q.Documents(q.Collection('products'))),
				q.Lambda('ref', q.Get(q.Var('ref'))),
			),
		);
	},
	createProduct: (product: Product) => {
		return client.query(q.Create(q.Collection('products'), { data: product }));
	},
	getProduct: (id: string) => {
		return client.query(q.Get(q.Ref(q.Collection('products'), id)));
	},
	updateProduct: (id: string, data: any) => {
		return client.query(
			q.Update(q.Ref(q.Collection('products'), id), { data }),
		);
	},
	deleteProduct: (id: string) => {
		return client.query(q.Delete(q.Ref(q.Collection('products'), id)));
	},
};

export default productAPI;
