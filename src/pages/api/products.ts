import { Client, query as q } from 'faunadb';
import Stripe from 'stripe';

const faunaClient = new Client({ secret: process.env.FAUNA_SECRET });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: 'YOUR_STRIPE_API_VERSION' });

const FAUNA_PRODUCTS_COLLECTION = 'products';

async function createProduct(data) {
  const product = await faunaClient.query(
    q.Create(
      q.Collection(FAUNA_PRODUCTS_COLLECTION),
      { data }
    )  
  );
  await syncWithStripe('create', product);
  return product;
}

async function readProducts() {
  const products = await faunaClient.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection(FAUNA_PRODUCTS_COLLECTION))),
      q.Lambda("ref", q.Get(q.Var("ref")))
    )
  );
  return products.data;
}

async function updateProduct(id, data) {
  const product = await faunaClient.query(
    q.Update(
      q.Ref(q.Collection(FAUNA_PRODUCTS_COLLECTION), id),
      { data }
    )
  );
  await syncWithStripe('update', product); 
  return product;
}

async function deleteProduct(id) {
  const product = await faunaClient.query(
    q.Delete(
      q.Ref(q.Collection(FAUNA_PRODUCTS_COLLECTION), id)
    )
  );
  await syncWithStripe('delete', product);
}

async function syncWithStripe(action, product) {
  switch(action) {
    case 'create':
      await stripe.products.create({
        id: product.ref.id,
        name: product.data.name,
      });
      break;
    case 'update':
      await stripe.products.update(product.ref.id, {
        name: product.data.name,  
      });
      break;
    case 'delete':  
      await stripe.products.del(product.ref.id);
      break;
  }
}

export default async (req, res) => {
  switch (req.method) {
    case 'POST':
      const createdProduct = await createProduct(req.body);
      res.status(200).json(createdProduct);
      break;
    case 'GET':
      const products = await readProducts();
      res.status(200).json(products);
      break;
    case 'PUT':
      const { id, ...updateData } = req.body;
      const updatedProduct = await updateProduct(id, updateData);
      res.status(200).json(updatedProduct);
      break;  
    case 'DELETE':
      const deletedId = req.query.id;
      await deleteProduct(deletedId);
      res.status(204).end();
      break;
    default:
      res.status(405).end();
      break; 
  }
}
