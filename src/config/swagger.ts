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
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o Access Token JWT para acessar rotas protegidas.',
      },
    },
  },
  tags: [
    { name: 'Sistema', description: 'Rotas de infraestrutura e saúde da API' },
    { name: 'Autenticação', description: 'Gerenciamento de identidades e sessões' },
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
    '/api/v1/auth/cadastro': {
      post: {
        summary: 'Cadastro de Usuário',
        description: 'Cria um novo usuário e retorna os tokens de acesso.',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                  nome: { type: 'string', example: 'João Silva' },
                  email: { type: 'string', example: 'joao@syngate.com' },
                  senha: { type: 'string', example: 'Senha@123' },
                  papel: { 
                    type: 'string', 
                    enum: ['ALUNO', 'PROFESSOR', 'FUNCIONARIO', 'COORDENADOR', 'GESTOR', 'VISITANTE'],
                    example: 'ALUNO'
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Erro de validação ou e-mail já em uso.' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Login',
        description: 'Autentica o usuário e retorna o access token (15m) e refresh token (7d).',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                  email: { type: 'string', example: 'admin@syngate.com' },
                  senha: { type: 'string', example: 'Senha@123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Credenciais inválidas.' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        summary: 'Renovar Access Token',
        description: 'Gera um novo par de tokens utilizando um refresh token válido.',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tokens renovados com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Sessão expirada. Faça login novamente.' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Logout',
        description: 'Invalida o token atual adicionando-o à blacklist do Redis.',
        tags: ['Autenticação'],
        security: [{ bearerAuth: [] }],
        responses: {
          '204': { description: 'Logout realizado com sucesso (No Content).' },
          '401': { description: 'Token não fornecido ou já revogado.' },
        },
      },
    },
  },
};