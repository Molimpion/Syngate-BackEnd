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
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
          nome: { type: 'string', example: 'João Estudante' },
          email: { type: 'string', format: 'email', example: 'joao@syngate.com' },
          matricula: { type: 'string', nullable: true, example: 'ALN2026' },
          cartaoId: { type: 'string', nullable: true, example: 'A1:B2:C3:D4' },
          curso: { type: 'string', nullable: true, example: 'Análise e Desenvolvimento de Sistemas' },
          papel: { type: 'string', enum: ['ALUNO', 'PROFESSOR', 'FUNCIONARIO', 'COORDENADOR', 'GESTOR', 'VISITANTE'], example: 'ALUNO' },
          ativo: { type: 'boolean', example: true },
          dataExpiracao: { type: 'string', format: 'date-time', nullable: true, example: '2027-12-31T23:59:59.000Z' },
          turnoId: { type: 'string', format: 'uuid', nullable: true, example: 'aluno-manha' },
          criadoEm: { type: 'string', format: 'date-time', example: '2026-05-15T10:00:00.000Z' },
          atualizadoEm: { type: 'string', format: 'date-time', example: '2026-05-15T10:00:00.000Z' },
        },
      },
      MetaPaginacao: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 42 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
    },
  },
  tags: [
    { name: 'Sistema', description: 'Rotas de infraestrutura e saúde da API' },
    { name: 'Autenticação', description: 'Gerenciamento de identidades e sessões' },
    { name: 'Usuários', description: 'Gestão de contas, perfis e vinculação de cartões RFID' },
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
    // --- AUTENTICAÇÃO ---
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

    // --- USUÁRIOS ---
    '/api/v1/users/me': {
      get: {
        summary: 'Meu Perfil',
        description: 'Retorna os dados do próprio usuário autenticado. O ID é inferido de forma segura via Token JWT.',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { 
            description: 'Perfil retornado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Usuario' },
                  }
                }
              }
            }
          },
          '401': { description: 'Não autorizado.' },
          '404': { description: 'Usuário não encontrado.' },
        },
      },
    },
    '/api/v1/users': {
      get: {
        summary: 'Listar Usuários',
        description: 'Retorna uma lista paginada de usuários. Apenas para Gestores e Coordenadores.',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', description: 'Número da página', required: false, schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', description: 'Itens por página (máx 100)', required: false, schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', description: 'Termo para busca em nome, e-mail ou matrícula', required: false, schema: { type: 'string' } },
        ],
        responses: {
          '200': { 
            description: 'Lista de usuários retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { 
                      type: 'array',
                      items: { $ref: '#/components/schemas/Usuario' }
                    },
                    meta: { $ref: '#/components/schemas/MetaPaginacao' }
                  }
                }
              }
            }
          },
          '403': { description: 'Acesso negado. Privilégios insuficientes.' },
        },
      },
      post: {
        summary: 'Criar Usuário',
        description: 'Cria um usuário manualmente. Apenas para Gestores e Coordenadores.',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                  nome: { type: 'string', example: 'Carlos Professor' },
                  email: { type: 'string', example: 'carlos@syngate.com' },
                  senha: { type: 'string', example: 'SenhaForte123' },
                  matricula: { type: 'string', example: 'PRF-002' },
                  curso: { type: 'string', example: 'Sistemas de Informação' },
                  papel: { type: 'string', example: 'PROFESSOR' },
                  turnoId: { type: 'string', example: 'uuid-do-turno' },
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
                    data: { $ref: '#/components/schemas/Usuario' },
                  }
                }
              }
            }
          },
          '400': { description: 'Erro de validação nos dados fornecidos.' },
          '403': { description: 'Acesso negado.' },
          '409': { description: 'Conflito: E-mail ou Matrícula já em uso.' },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        summary: 'Buscar Usuário',
        description: 'Busca um usuário específico pelo ID. Apenas para Gestores e Coordenadores.',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', description: 'UUID do usuário', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { 
            description: 'Usuário retornado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Usuario' },
                  }
                }
              }
            }
          },
          '404': { description: 'Usuário não encontrado.' },
        },
      },
      put: {
        summary: 'Atualizar Usuário',
        description: 'Atualiza os dados de um usuário. Apenas para Gestores e Coordenadores.',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', description: 'UUID do usuário', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  email: { type: 'string' },
                  matricula: { type: 'string' },
                  curso: { type: 'string' },
                  papel: { type: 'string' },
                  turnoId: { type: 'string' },
                  ativo: { type: 'boolean', description: 'Inativar (soft delete) ou reativar usuário' },
                },
              },
            },
          },
        },
        responses: {
          '200': { 
            description: 'Usuário atualizado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Usuario' },
                  }
                }
              }
            }
          },
          '400': { description: 'Erro de validação.' },
        },
      },
      delete: {
        summary: 'Deletar Usuário (Soft Delete)',
        description: 'Realiza a exclusão lógica do usuário (inativação) preservando o histórico de logs.',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '204': { description: 'Usuário inativado com sucesso (No Content).' },
          '403': { description: 'Acesso negado.' },
        },
      },
    },
    '/api/v1/users/{id}/cartao': {
      patch: {
        summary: 'Vincular/Desvincular Cartão RFID',
        description: 'Associa um UID de RFID a um usuário. Para desvincular, envie cartaoId como null.',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cartaoId'],
                properties: {
                  cartaoId: { type: 'string', nullable: true, example: 'A1:B2:C3:D4' },
                },
              },
            },
          },
        },
        responses: {
          '200': { 
            description: 'Cartão vinculado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Usuario' },
                  }
                }
              }
            }
          },
          '409': { description: 'Conflito: Cartão já vinculado a outro usuário.' },
        },
      },
    },
  },
};