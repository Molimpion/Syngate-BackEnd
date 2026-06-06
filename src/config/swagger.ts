export const openapiSpecification = {
  openapi: '3.1.0',
  info: {
    title: 'Syngate API',
    version: '1.0.0',
    description:
      'Documentação Oficial do Back-end do Sistema Syngate (IoT & Web). Contém rotas administrativas para o Painel Web e rotas de alta performance para comunicação com o hardware das catracas (ESP32).',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Servidor de Desenvolvimento Local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o Access Token JWT obtido no login.',
      },
      deviceMac: {
        type: 'apiKey',
        in: 'header',
        name: 'x-device-mac',
        description: 'Endereço MAC físico do dispositivo IoT. Exemplo: AA:BB:CC:DD:EE:FF',
      },
      deviceKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-device-key',
        description: 'Chave secreta gerada exclusivamente durante o provisionamento do dispositivo.',
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
          cartaoId: { type: 'string', nullable: true, example: 'RFID-ALUN-002' },
          curso: { type: 'string', nullable: true, example: 'Análise e Desenvolvimento de Sistemas' },
          papel: { type: 'string', enum: ['ALUNO', 'PROFESSOR', 'FUNCIONARIO', 'COORDENADOR', 'GESTOR', 'VISITANTE'], example: 'ALUNO' },
          ativo: { type: 'boolean', example: true },
          emailVerificado: { type: 'boolean', example: true },
          dataExpiracao: { type: 'string', format: 'date-time', nullable: true, example: '2027-12-31T23:59:59.000Z' },
          turnoId: { type: 'string', format: 'uuid', nullable: true, example: 'aluno-manha' },
          criadoEm: { type: 'string', format: 'date-time', example: '2026-05-15T10:00:00.000Z' },
          atualizadoEm: { type: 'string', format: 'date-time', example: '2026-05-15T10:00:00.000Z' },
        },
      },
      Sala: {
        type: 'object',
        required: ['nome'],
        properties: {
          id: { type: 'string', format: 'uuid', example: '876e4567-e89b-12d3-a456-426614174111' },
          nome: { type: 'string', example: 'Laboratório 101' },
          bloco: { type: 'string', nullable: true, example: 'A' },
        },
      },
      Turno: {
        type: 'object',
        required: ['nome', 'horaInicio', 'horaFim', 'diasSemana'],
        properties: {
          id: { type: 'string', example: 'aluno-manha' },
          nome: { type: 'string', example: 'Aluno - Manhã' },
          horaInicio: { type: 'integer', description: 'Minutos desde a meia-noite (ex: 480 = 08:00)', example: 480 },
          horaFim: { type: 'integer', description: 'Minutos desde a meia-noite (ex: 720 = 12:00)', example: 720 },
          diasSemana: {
            type: 'array',
            items: { type: 'integer' },
            description: '0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado',
            example: [1, 2, 3, 4, 5],
          },
        },
      },
      Dispositivo: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '999e4567-e89b-12d3-a456-426614174999' },
          nome: { type: 'string', example: 'Catraca Principal' },
          tipo: { type: 'string', enum: ['CATRACA', 'LEITOR_CARTAO'], example: 'CATRACA' },
          status: { type: 'string', enum: ['ATIVO', 'INATIVO', 'MANUTENCAO'], example: 'ATIVO' },
          enderecoMac: { type: 'string', example: 'AA:BB:CC:DD:EE:01' },
          ipLocal: { type: 'string', format: 'ipv4', example: '192.168.1.100' },
          salaId: { type: 'string', format: 'uuid', example: '876e4567-e89b-12d3-a456-426614174111' },
        },
      },
      LogAcesso: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          dataHora: { type: 'string', format: 'date-time', example: '2026-05-24T10:30:00.000Z' },
          status: { type: 'string', enum: ['CONCEDIDO', 'NEGADO'], example: 'CONCEDIDO' },
          finalidade: { type: 'string', enum: ['ENTRADA_PREDIO', 'PRESENCA_SALA'], example: 'ENTRADA_PREDIO' },
          direcao: { type: 'string', enum: ['ENTRADA', 'SAIDA'], example: 'ENTRADA' },
          motivo: { type: 'string', nullable: true, example: 'Fora do horário permitido' },
          uidCartao: { type: 'string', nullable: true, example: 'A1:B2:C3:D4' },
          usuarioId: { type: 'string', format: 'uuid', nullable: true },
          dispositivoId: { type: 'string', format: 'uuid' },
        },
      },
      AccessResult: {
        type: 'object',
        properties: {
          granted: { type: 'boolean', description: 'True libera o relé da catraca; False acende LED vermelho.', example: true },
          reason: { type: 'string', nullable: true, description: 'Motivo em caso de negação.', example: 'Fora do horário permitido' },
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
      ErroGenerico: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Mensagem de erro.' },
        },
      },
    },
  },
  tags: [
    { name: 'Sistema', description: 'Infraestrutura e integridade da API' },
    { name: 'Autenticação', description: 'Sessões, tokens JWT e ativação de contas' },
    { name: 'Usuários', description: 'Gerenciamento de usuários e cartões RFID' },
    { name: 'Salas', description: 'Gerenciamento de espaços físicos da instituição' },
    { name: 'Turnos', description: 'Regras de horários permitidos para acesso' },
    { name: 'Dispositivos IoT', description: 'Provisionamento e monitoramento de hardware' },
    { name: 'Validação Física (Hardware)', description: 'Endpoints exclusivos para as placas ESP32' },
    { name: 'Relatórios e Métricas', description: 'Agregações de dados e exportação CSV' },
  ],
  paths: {
    // ─── SISTEMA ────────────────────────────────────────────────────────────
    '/health': {
      get: {
        summary: 'Health Check',
        tags: ['Sistema'],
        responses: {
          '200': {
            description: 'API ativa',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } },
          },
        },
      },
    },

    // ─── AUTENTICAÇÃO ────────────────────────────────────────────────────────
    '/api/v1/auth/cadastro': {
      post: {
        summary: 'Cadastro de Usuário',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                  nome: { type: 'string', example: 'Manoel Olímpio' },
                  email: { type: 'string', format: 'email', example: 'manoel@syngate.com' },
                  senha: { type: 'string', example: 'Senha@123' },
                  papel: { type: 'string', enum: ['ALUNO', 'PROFESSOR'], default: 'ALUNO' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Cadastro realizado. Aguardando verificação de e-mail.' },
          '400': { description: 'Dados inválidos.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErroGenerico' } } } },
          '409': { description: 'E-mail já está em uso.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErroGenerico' } } } },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Login de Usuário',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@syngate.com' },
                  senha: { type: 'string', example: 'Senha@123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Autenticado com sucesso.',
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
          '403': { description: 'E-mail não verificado.' },
        },
      },
    },
    '/api/v1/auth/verificar-email': {
      get: {
        summary: 'Verificar E-mail',
        tags: ['Autenticação'],
        parameters: [
          { name: 'token', in: 'query', required: true, schema: { type: 'string' }, description: 'Token de verificação recebido por e-mail.' },
        ],
        responses: {
          '200': { description: 'E-mail verificado com sucesso.' },
          '400': { description: 'Token inválido ou já utilizado.' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        summary: 'Renovar Access Token',
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
          '200': { description: 'Novos tokens gerados.' },
          '401': { description: 'Refresh token inválido ou expirado.' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Logout',
        tags: ['Autenticação'],
        security: [{ bearerAuth: [] }],
        responses: {
          '204': { description: 'Logout realizado. Token adicionado à blacklist.' },
          '401': { description: 'Não autorizado.' },
        },
      },
    },

    // ─── USUÁRIOS ────────────────────────────────────────────────────────────
    '/api/v1/users/me': {
      get: {
        summary: 'Obter Perfil do Usuário Logado',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Perfil retornado.',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Usuario' } } } } },
          },
          '401': { description: 'Não autorizado.' },
        },
      },
    },
    '/api/v1/users': {
      get: {
        summary: 'Listar Usuários',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Busca por nome, e-mail ou matrícula (pg_trgm).' },
        ],
        responses: {
          '200': {
            description: 'Listagem paginada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } },
                    meta: { $ref: '#/components/schemas/MetaPaginacao' },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autorizado.' },
          '403': { description: 'Papel insuficiente.' },
        },
      },
      post: {
        summary: 'Criar Usuário',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                  nome: { type: 'string', example: 'Maria Silva' },
                  email: { type: 'string', format: 'email', example: 'maria@syngate.com' },
                  senha: { type: 'string', example: 'Senha@123' },
                  matricula: { type: 'string', example: 'ALN2027' },
                  curso: { type: 'string', example: 'Engenharia de Software' },
                  papel: { type: 'string', enum: ['ALUNO', 'PROFESSOR', 'FUNCIONARIO', 'COORDENADOR', 'GESTOR', 'VISITANTE'], default: 'ALUNO' },
                  turnoId: { type: 'string', format: 'uuid' },
                  dataExpiracao: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Usuário criado.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Usuario' } } } } } },
          '409': { description: 'E-mail ou matrícula já em uso.' },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        summary: 'Buscar Usuário por ID',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Usuário encontrado.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Usuario' } } } } } },
          '404': { description: 'Usuário não encontrado.' },
        },
      },
      put: {
        summary: 'Atualizar Usuário',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  matricula: { type: 'string' },
                  curso: { type: 'string' },
                  papel: { type: 'string', enum: ['ALUNO', 'PROFESSOR', 'FUNCIONARIO', 'COORDENADOR', 'GESTOR', 'VISITANTE'] },
                  turnoId: { type: 'string', format: 'uuid' },
                  dataExpiracao: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Atualizado.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Usuario' } } } } } },
          '404': { description: 'Usuário não encontrado.' },
        },
      },
      delete: {
        summary: 'Desativar Usuário (Soft Delete)',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR. Marca o usuário como inativo sem removê-lo do banco.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Usuário desativado.' },
          '404': { description: 'Usuário não encontrado.' },
        },
      },
    },
    '/api/v1/users/{id}/cartao': {
      patch: {
        summary: 'Vincular ou Desvincular Cartão RFID',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR. Enviar `cartaoId: null` para desvincular.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cartaoId: { type: 'string', nullable: true, example: 'RFID-ALUN-999', description: 'UID do cartão RFID. Null para desvincular.' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Cartão vinculado/desvinculado.' },
          '409': { description: 'Cartão já vinculado a outro usuário.' },
        },
      },
    },

    // ─── SALAS ───────────────────────────────────────────────────────────────
    '/api/v1/rooms': {
      get: {
        summary: 'Listar Salas',
        tags: ['Salas'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Listagem paginada.',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Sala' } }, meta: { $ref: '#/components/schemas/MetaPaginacao' } } } } },
          },
        },
      },
      post: {
        summary: 'Criar Sala',
        tags: ['Salas'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['nome'], properties: { nome: { type: 'string', example: 'Laboratório 102' }, bloco: { type: 'string', example: 'B' } } } } },
        },
        responses: {
          '201': { description: 'Sala criada.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Sala' } } } } } },
          '409': { description: 'Sala com mesmo nome já existe neste bloco.' },
        },
      },
    },
    '/api/v1/rooms/{id}': {
      get: {
        summary: 'Buscar Sala por ID',
        tags: ['Salas'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Sala encontrada.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Sala' } } } } } },
          '404': { description: 'Sala não encontrada.' },
        },
      },
      put: {
        summary: 'Atualizar Sala',
        tags: ['Salas'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { nome: { type: 'string' }, bloco: { type: 'string', nullable: true } } } } },
        },
        responses: {
          '200': { description: 'Sala atualizada.' },
          '404': { description: 'Sala não encontrada.' },
          '409': { description: 'Conflito de nome no mesmo bloco.' },
        },
      },
      delete: {
        summary: 'Remover Sala',
        tags: ['Salas'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR. Falha se houver dispositivos vinculados.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Sala removida.' },
          '400': { description: 'Existem dispositivos vinculados a esta sala.' },
          '404': { description: 'Sala não encontrada.' },
        },
      },
    },

    // ─── TURNOS ──────────────────────────────────────────────────────────────
    '/api/v1/shifts': {
      get: {
        summary: 'Listar Turnos',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Listagem paginada.',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Turno' } }, meta: { $ref: '#/components/schemas/MetaPaginacao' } } } } },
          },
        },
      },
      post: {
        summary: 'Criar Turno',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Turno' } } },
        },
        responses: {
          '201': { description: 'Turno criado.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Turno' } } } } } },
        },
      },
    },
    '/api/v1/shifts/{id}': {
      get: {
        summary: 'Buscar Turno por ID',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Turno encontrado.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Turno' } } } } } },
          '404': { description: 'Turno não encontrado.' },
        },
      },
      put: {
        summary: 'Atualizar Turno',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Turno' } } },
        },
        responses: {
          '200': { description: 'Turno atualizado.' },
          '404': { description: 'Turno não encontrado.' },
        },
      },
      delete: {
        summary: 'Remover Turno',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR. Falha se houver usuários vinculados.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Turno removido.' },
          '400': { description: 'Existem usuários vinculados a este turno.' },
          '404': { description: 'Turno não encontrado.' },
        },
      },
    },

    // ─── DISPOSITIVOS ────────────────────────────────────────────────────────
    '/api/v1/devices': {
      get: {
        summary: 'Listar Dispositivos IoT',
        tags: ['Dispositivos IoT'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Listagem paginada.',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Dispositivo' } }, meta: { $ref: '#/components/schemas/MetaPaginacao' } } } } },
          },
        },
      },
      post: {
        summary: 'Criar Dispositivo IoT',
        tags: ['Dispositivos IoT'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'enderecoMac', 'salaId'],
                properties: {
                  nome: { type: 'string', example: 'Leitor Lab 101' },
                  tipo: { type: 'string', enum: ['CATRACA', 'LEITOR_CARTAO'], default: 'LEITOR_CARTAO' },
                  enderecoMac: { type: 'string', example: 'AA:BB:CC:DD:EE:02', description: 'Formato: AA:BB:CC:DD:EE:FF (uppercase)' },
                  salaId: { type: 'string', format: 'uuid' },
                  ipLocal: { type: 'string', example: '192.168.1.101' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Dispositivo criado.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Dispositivo' } } } } } },
          '409': { description: 'MAC address já cadastrado.' },
        },
      },
    },
    '/api/v1/devices/{id}': {
      get: {
        summary: 'Buscar Dispositivo por ID',
        tags: ['Dispositivos IoT'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Dispositivo encontrado.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/Dispositivo' } } } } } },
          '404': { description: 'Dispositivo não encontrado.' },
        },
      },
      put: {
        summary: 'Atualizar Dispositivo',
        tags: ['Dispositivos IoT'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  tipo: { type: 'string', enum: ['CATRACA', 'LEITOR_CARTAO'] },
                  status: { type: 'string', enum: ['ATIVO', 'INATIVO', 'MANUTENCAO'] },
                  salaId: { type: 'string', format: 'uuid' },
                  ipLocal: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Dispositivo atualizado.' },
          '404': { description: 'Dispositivo não encontrado.' },
        },
      },
      delete: {
        summary: 'Remover Dispositivo',
        tags: ['Dispositivos IoT'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Dispositivo removido.' },
          '404': { description: 'Dispositivo não encontrado.' },
        },
      },
    },
    '/api/v1/devices/{id}/provision': {
      post: {
        summary: 'Provisionar Chave de Segurança do Dispositivo',
        tags: ['Dispositivos IoT'],
        security: [{ bearerAuth: [] }],
        description: 'Gera uma nova chave secreta para o dispositivo. O `rawKey` é exibido **apenas uma vez** — grave no firmware imediatamente.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'Chave gerada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        rawKey: { type: 'string', description: 'CHAVE PARA O FIRMWARE — NÃO SERÁ EXIBIDA NOVAMENTE.', example: 'b8f9c2d1e4a7...' },
                      },
                    },
                  },
                },
              },
            },
          },
          '404': { description: 'Dispositivo não encontrado.' },
        },
      },
    },

    // ─── HARDWARE (ESP32) ────────────────────────────────────────────────────
    '/api/v1/access-logs': {
      post: {
        summary: 'Registrar Acesso Físico (ESP32)',
        tags: ['Validação Física (Hardware)'],
        security: [{ deviceMac: [], deviceKey: [] }],
        description: 'Endpoint exclusivo para as placas ESP32. Não aceita JWT — exige autenticação via headers `x-device-mac` e `x-device-key`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['uidCartao'],
                properties: {
                  uidCartao: { type: 'string', description: 'UID bruto lido pelo leitor RFID/NFC.', example: 'A1:B2:C3:D4' },
                  direcao: { type: 'string', enum: ['ENTRADA', 'SAIDA'], default: 'ENTRADA' },
                  finalidade: { type: 'string', enum: ['ENTRADA_PREDIO', 'PRESENCA_SALA'], default: 'ENTRADA_PREDIO' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Resposta para o microcontrolador.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AccessResult' } } },
          },
          '403': { description: 'Hardware não autenticado.' },
        },
      },
    },

    // ─── RELATÓRIOS ──────────────────────────────────────────────────────────
    '/api/v1/reports/dashboard': {
      get: {
        summary: 'Dados Consolidados do Dashboard',
        tags: ['Relatórios e Métricas'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR. Resultados em cache Redis por 5 minutos.',
        parameters: [
          { name: 'dataInicio', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filtro de data inicial.' },
          { name: 'dataFim', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filtro de data final.' },
          { name: 'usuarioId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'dispositivoId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['CONCEDIDO', 'NEGADO'] } },
        ],
        responses: {
          '200': { description: 'Dados consolidados retornados.' },
          '401': { description: 'Não autorizado.' },
          '403': { description: 'Papel insuficiente.' },
        },
      },
    },
    '/api/v1/reports/export/csv': {
      get: {
        summary: 'Exportar Logs em CSV',
        tags: ['Relatórios e Métricas'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito a GESTOR e COORDENADOR. Retorna arquivo CSV para download.',
        parameters: [
          { name: 'dataInicio', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dataFim', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'usuarioId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'dispositivoId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['CONCEDIDO', 'NEGADO'] } },
        ],
        responses: {
          '200': {
            description: 'Arquivo CSV.',
            content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } },
          },
          '401': { description: 'Não autorizado.' },
          '403': { description: 'Papel insuficiente.' },
        },
      },
    },'/api/v1/reports/stats': {
  get: {
    summary: 'Estatísticas do Dashboard',
    tags: ['Relatórios e Métricas'],
    security: [{ bearerAuth: [] }],
    responses: {
      '200': {
        description: 'Métricas consolidadas.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                totalAcessos: { type: 'integer' },
                concedidos: { type: 'integer' },
                negados: { type: 'integer' },
                dispositivosAtivos: { type: 'integer' },
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
