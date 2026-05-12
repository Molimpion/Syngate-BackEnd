export const openapiSpecification = {
  openapi: '3.1.0',
  info: {
    title: 'Syngate API',
    version: '1.0.0',
    description: 'Documentação Oficial do Back-end do Sistema Syngate (IoT & Web)',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Servidor de Desenvolvimento',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health Check',
        description: 'Verifica se a API está online e respondendo.',
        tags: ['Sistema'],
        responses: {
          '200': {
            description: 'Servidor online',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'syngate-backend' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};