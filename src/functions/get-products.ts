import { APIGatewayProxyEvent } from 'aws-lambda';

import * as productService from '../services/product.service';
import { lambdaHandler } from '../utils/handler.utils';

export const getProducts = lambdaHandler((_event: APIGatewayProxyEvent) => {
  return productService.getProducts();
});
