export const openapiSpecification = {
  openapi: '3.1.0',
  info: {
    title: 'Syngate API',
    version: '1.0.0',
    description: 'Documentação Oficial do Back-end do Sistema Syngate (IoT & Web). Contém rotas administrativas para o Painel Web e rotas de alta performance para comunicação com o hardware das catracas (ESP32).',
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
        description: 'Insira o Access Token JWT obtido no login para acessar rotas da plataforma web.',
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
            description: '0 = Domingo, 1 = Segunda, ..., 6 = Sábado',
            example: [1, 2, 3, 4, 5] 
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
    { name: 'Sistema', description: 'Infraestrutura e integridade da API' },
    { name: 'Autenticação', description: 'Sessões, tokens JWT e ativação de contas' },
    { name: 'Usuários', description: 'Gerenciamento de usuários e cartões RFID' },
    { name: 'Salas', description: 'Gerenciamento de espaços físicos da instituição' },
    { name: 'Turnos', description: 'Regras de horários permitidos para acesso' },
    { name: 'Dispositivos IoT', description: 'Provisionamento e monitoramento de hardware' },
    { name: 'Validação Física (Hardware)', description: 'Endpoints de altíssima performance para as placas ESP32' },
    { name: 'Relatórios e Métricas', description: 'Agregações de dados em tempo real e exportação CSV' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health Check',
        tags: ['Sistema'],
        responses: {
          '200': {
            description: 'API ativa',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } }
          }
        }
      }
    },
    // --- AUTHENTICATION ---
    '/api/v1/auth/cadastro': {
      post: {
        summary: 'Cadastro Inicial de Usuário',
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
                  email: { type: 'string', example: 'manoel@syngate.com' },
                  senha: { type: 'string', example: 'Senha@123' },
                  papel: { type: 'string', enum: ['ALUNO', 'PROFESSOR'], default: 'ALUNO' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Cadastro feito com sucesso. Aguardando verificação.' },
          '400': { description: 'Dados inválidos ou e-mail já cadastrado.' }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Autenticação de Usuário (Painel Web)',
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
                  senha: { type: 'string', example: 'Senha@123' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Autenticado.',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { accessToken: { type: 'string' }, refreshToken: { type: 'string' } } } } } } }
          },
          '401': { description: 'Credenciais inválidas.' },
          '403': { description: 'E-mail ainda não verificado.' }
        }
      }
    },
    // --- USUÁRIOS ---
    '/api/v1/users/me': {
      get: {
        summary: 'Obter Perfil Autenticado',
        tags: ['Usuários'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Sucesso.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { $ref: '#/components/schemas/Usuario' } } } } } }
        }
      }
    },
    // --- SALAS ---
    '/api/v1/rooms': {
      get: {
        summary: 'Listar Salas Paginadas',
        tags: ['Salas'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Sucesso.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Sala' } }, meta: { $ref: '#/components/schemas/MetaPaginacao' } } } } } }
        }
      },
      post: {
        summary: 'Criar Nova Sala',
        tags: ['Salas'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito para papéis: GESTOR, COORDENADOR.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['nome'], properties: { nome: { type: 'string', example: 'Laboratório 102' }, bloco: { type: 'string', example: 'B' } } } } }
        },
        responses: {
          '201': { description: 'Criado.' },
          '409': { description: 'Conflito: Sala com mesmo nome já existe neste bloco.' }
        }
      }
    },
    // --- TURNOS ---
    '/api/v1/shifts': {
      get: {
        summary: 'Listar Turnos Cadastrados',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Sucesso.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Turno' } } } } } } }
        }
      },
      post: {
        summary: 'Criar Novo Turno de Acesso',
        tags: ['Turnos'],
        security: [{ bearerAuth: [] }],
        description: 'Restrito para papéis: GESTOR, COORDENADOR.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Turno' } } }
        },
        responses: {
          '201': { description: 'Criado com sucesso.' }
        }
      }
    },
    // --- DISPOSITIVOS IOT ---
    '/api/v1/devices': {
      get: {
        summary: 'Listar Dispositivos IoT',
        tags: ['Dispositivos IoT'],
        security: [{ bearerAuth: [] }],
        description: 'Apenas GESTOR e COORDENADOR podem gerenciar o parque de hardware.',
        responses: {
          '200': { description: 'Sucesso.', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'array', items: { $ref: '#/components/schemas/Dispositivo' } } } } } } }
        }
      },
      post: {
        summary: 'Provisionar Novo Dispositivo IoT',
        tags: ['Dispositivos IoT'],
        security: [{ bearerAuth: [] }],
        description: 'Gera uma chave secreta randômica que será exibida APENAS UMA VEZ na resposta para gravação no firmware da placa.',
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
                  enderecoMac: { type: 'string', example: 'AA:BB:CC:DD:EE:02' },
                  salaId: { type: 'string', format: 'uuid' },
                  ipLocal: { type: 'string', example: '192.168.1.101' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Provisionado.',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'object', properties: { id: { type: 'string' }, nome: { type: 'string' }, rawKey: { type: 'string', description: 'CHAVE CRUA PARA O FIRMWARE. GUARDE ISSO!', example: 'b8f9c2d1e4a7...' } } } } } } }
          }
        }
      }
    },
    // --- HARDWARE ACCESS (ENDPOINT MAIS CRÍTICO) ---
    '/api/v1/access': {
      post: {
        summary: 'Validação de Acesso Físico (Chamado pela ESP32)',
        tags: ['Validação Física (Hardware)'],
        security: [{ deviceMac: [], deviceKey: [] }],
        description: 'Endpoint exclusivo para as placas das catracas. Não aceita token JWT, exige autenticação criptográfica via Headers customizados.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['uidCartao'],
                properties: {
                  uidCartao: { type: 'string', description: 'ID bruto em hexadecimal lido pelo leitor RFID/NFC', example: 'A1:B2:C3:D4' },
                  direcao: { type: 'string', enum: ['ENTRADA', 'SAIDA'], default: 'ENTRADA' },
                  finalidade: { type: 'string', enum: ['ENTRADA_PREDIO', 'PRESENCA_SALA'], default: 'ENTRADA_PREDIO' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Resposta rápida estruturada para o código C++ do microcontrolador.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    granted: { type: 'boolean', description: 'True libera o relé físico da catraca; False acende LED vermelho.', example: true },
                    reason: { type: 'string', nullable: true, description: 'Motivo específico em caso de negação.', example: 'Fora do horário permitido' }
                  }
                }
              }
            }
          },
          '403': { description: 'Hardware não autenticado (MAC ou chave inválidos).' }
        }
      }
    },
    // --- REPORTS ---
    '/api/v1/reports/dashboard': {
      get: {
        summary: 'Obter Dados Consolidados do Dashboard',
        tags: ['Relatórios e Métricas'],
        security: [{ bearerAuth: [] }],
        description: 'Retorna a agregação completa de acessos junto com os logs detalhados. Resultados salvos em Cache Redis por 5 minutos.',
        parameters: [
          { name: 'dataInicio', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dataFim', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['CONCEDIDO', 'NEGADO'] } }
        ],
        responses: {
          '200': { description: 'Dados de relatórios consolidados recuperados.' }
        }
      }
    },
    '/api/v1/reports/export/csv': {
      get: {
        summary: 'Exportar Histórico Completo em CSV',
        tags: ['Relatórios e Métricas'],
        security: [{ bearerAuth: [] }],
        description: 'Força o download direto de um arquivo CSV plano estruturado com separadores de ponto e vírgula, compatível com Excel.',
        responses: {
          '200': {
            description: 'Arquivo CSV gerado com sucesso.',
            headers: {
              'Content-Type': { schema: { type: 'string', example: 'text/csv' } },
              'Content-Disposition': { schema: { type: 'string', example: 'attachment; filename="relatorio.csv"' } }
            }
          }
        }
      }
    }
  }
};