import { APIGatewayProxyEvent } from 'aws-lambda';

import { lambdaHandler } from '../utils/handler.utils';
import * as productService from '../services/product.service';

export const getProduct = lambdaHandler((event: APIGatewayProxyEvent) => {
  const { productId } = event.pathParameters;

  return productService.getProduct(productId);
});
