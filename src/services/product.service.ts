import products from '../data/products.json';
import { HttpCode, HttpError } from '../utils/http.utils';
import { Product } from '../types/product';
import { delay } from '../utils/execution.utils';

const MOCK_DELAY = 300;

export async function getProducts(): Promise<Product[]> {
  return delay(MOCK_DELAY, () => products);
}

export async function getProduct(productId: string): Promise<Product> {
  return delay(MOCK_DELAY, () => {
    const product = products.find(product => product.id === productId);

    if (!product) {
      throw new HttpError(
        HttpCode.NOT_FOUND,
        `Product with id: ${productId} was not found`
      );
    }

    return product;
  });
}
