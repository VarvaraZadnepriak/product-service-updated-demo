import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
    '@martinsson/serverless-openapi-documentation',
  ],
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    'serverless-offline': {
      httpPort: 8000
    },
    documentation: {
      api: {
        info: {
          version: '1',
          title: 'Product Service API',
          description: 'Product Service API'
        }
      },
      models: [{
        name: 'Product',
        description: 'Product model',
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Product identifier',
            },
            title: {
              type: 'string',
              description: 'Product title',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            price: {
              type: 'number',
              description: 'Product price',
            },
            imageUrl: {
              type: 'string',
              description: 'Product imageUrl',
            }
          }
        }
      }, {
        name: 'ProductList',
        description: 'List of products',
        contentType: 'application/json',
        schema: {
          type: 'array',
          items: {
            $ref: '{{model: Product}}'
          }
        }
      }, {
        name: 'ServiceError',
        description: 'Service error',
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              description: 'Status code of error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }]
    }
  },
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    stage: 'dev',
    region: 'eu-west-1',
    profile: 'aws-task',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  functions: {
    getProduct: {
      handler: 'src/handler.getProduct',
      events: [
        {
          http: {
            method: 'get',
            path: '/products/{productId}',
            cors: true,
            documentation: {
              description: 'Get product by productId',
              pathParams: [{
                name: 'productId',
                description: 'Product identifier'
              }],
              methodResponses: [{
                statusCode: '200',
                responseModels: {
                  'application/json': 'Product'
                }
              }, {
                statusCode: '404',
                responseModels: {
                  'application/json': 'ServiceError'
                }
              }, {
                statusCode: '500',
                responseModels: {
                  'application/json': 'ServiceError'
                }
              }]
            }
          } as any
        }
      ]
    },
    getProducts: {
      handler: 'src/handler.getProducts',
      events: [
        {
          http: {
            method: 'get',
            path: '/products',
            cors: true,
            documentation: {
              description: 'Get all products',
              methodResponses: [{
                statusCode: '200',
                responseModels: {
                  'application/json': 'ProductList'
                }
              }, {
                statusCode: '500',
                responseModels: {
                  'application/json': 'ServiceError'
                }
              }]
            }
          } as any
        }
      ]
    }
  },
  package: { individually: true },
};

module.exports = serverlessConfiguration;
