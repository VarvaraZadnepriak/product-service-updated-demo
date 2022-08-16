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
    region: 'us-east-1',
    profile: 'aws-task',
    httpApi: {
      cors: true,
      authorizers: {
          httpApiRequestAuthorizer: {
            name: 'httpApiRequestAuthorizer',
            functionArn: 'arn:aws:lambda:${self:provider.region}:${aws:accountId}:function:custom-authorizer-demo-dev-httpApiRequestAuthorizer',
            type: 'request',
            enableSimpleResponses: true,
            payloadVersion: '2.0',
        },
        httpApiJwtAuthorizer: {
          type: 'jwt',
          name: 'httpApiJwtAuthorizer',
          identitySource: '$request.header.Authorization',
          issuerUrl: 'https://cognito-idp.${self:provider.region}.amazonaws.com/us-east-1_4Hbt2KG4N',
          audience: '17dttsrlruhr7v688d53j2p9s'
        }
      }
    },
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
          /* REST API */
          /* type: IAM */
          http: {
            method: 'get',
            path: '/rest/iam/products/{productId}',
            cors: true,
            authorizer: 'aws_iam'
          },
        },
        {
          /* REST API */
          /* type: Custom authorizer - token */
          http: {
            method: 'get',
            path: 'rest/token/products/{productId}',
            cors: true,
            authorizer: {
              arn: 'arn:aws:lambda:${self:provider.region}:${aws:accountId}:function:custom-authorizer-demo-dev-restApiTokenAuthorizer',
              type: 'token',
              resultTtlInSeconds: 0, // Default 300 seconds
              // identitySource: 'method.request.header.Authorization', // Another header can be chosen
              // identityValidationExpression: '^Bearer [-0-9a-zA-Z._]*$', // Regex to check header value before calling custom authorizer
            },
          }
        },
        {
          /* REST API */
          /* type: Custom authorizer - request */
          http: {
            method: 'get',
            path: 'rest/request/products/{productId}',
            cors: true,
            authorizer: {
              arn: 'arn:aws:lambda:${self:provider.region}:${aws:accountId}:function:custom-authorizer-demo-dev-restApiTokenAuthorizer',
              type: 'request',
              resultTtlInSeconds: 0, // Default 300 seconds
            },
          }
        },
        {
          /* REST API */
          /* type: Cognito user pool */
          http: {
            method: 'get',
            path: 'rest/cognito/products/{productId}',
            authorizer: {
              arn: 'arn:aws:cognito-idp:${self:provider.region}:${aws:accountId}:userpool/us-east-1_4Hbt2KG4N',
              // scopes: ['openid, 'custom-scope']
            },
          }
        }
      ]
    },
    getProducts: {
      handler: 'src/handler.getProducts',
      events: [
        {
          /* HTTP API */
          /* type: iam */
          httpApi: {
            method: 'get',
            path: '/http/iam/products',
            authorizer: {
              type: 'aws_iam'
            }
          }
        },
        {
          /* HTTP API */
          /* type: request */
          httpApi: {
            method: 'get',
            path: '/http/request/products',
            authorizer: {
              name: 'httpApiRequestAuthorizer'      
            }
          }
        },
        {
          /* HTTP API */
          /* type: jwt */
          httpApi: {
            method: 'get',
            path: '/http/jwt/products',
            authorizer: {
              name: 'httpApiJwtAuthorizer'      
            }
          }
        },
      ]
    },
  },
  package: { individually: true },
};

module.exports = serverlessConfiguration;
