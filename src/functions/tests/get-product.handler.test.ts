import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { HttpCode } from '../../utils/http.utils';
import * as productService from '../../services/product.service';
import { getProducts } from '../get-products';

jest.mock('../../services/product.service');

const MOCK_PRODUCTS = [{
  count: 4,
  description: 'Principles: Life and Work by Ray Dalio',
  id: '1',
  price: 2.4,
  title: 'Principles: Life and Work',
  imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71rggICc6ZL.jpg'
},
{
  count: 6,
  description: 'Stillness Is the Key by Ryan Holiday',
  id: '2',
  price: 10,
  title: 'Stillness Is the Key',
  imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71FnArf2ZbL.jpg'
}];

describe('Get Products Handler', () => {
  it('should return 200 status code and product list', async () => {
    const MOCK_EVENT = {} as unknown as APIGatewayProxyEvent;

    (productService.getProducts as any).mockImplementation(
      () => Promise.resolve(MOCK_PRODUCTS)
    );

    const response = await getProducts(MOCK_EVENT) as APIGatewayProxyResult;

    expect(productService.getProducts).toBeCalled();

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(MOCK_PRODUCTS);
  });

  it('should return 500 status code for unknown error', async () => {
    const MOCK_EVENT = {} as unknown as APIGatewayProxyEvent;
    const MOCK_ERROR = new Error('Unknown Error');

    (productService.getProducts as any).mockImplementation(
      () => Promise.reject(MOCK_ERROR)
    );

    const response = await getProducts(MOCK_EVENT) as APIGatewayProxyResult;

    expect(productService.getProducts).toBeCalled();

    expect(response.statusCode).toBe(HttpCode.SERVER_ERROR);
    expect(JSON.parse(response.body)).toEqual({
      statusCode: HttpCode.SERVER_ERROR,
      message: MOCK_ERROR.message
    });
  });
});
