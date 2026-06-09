# Syngate — Backend

**Repositório do Backend da Aplicação Syngate:**
*Sistema de Controle de Acesso Físico com Integração IoT*

---

*Projeto Integrador da Turma 43 da Faculdade Senac Pernambuco.*

### Framework e Ambiente Principal
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

### Banco de Dados e Cache
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Infraestrutura e Observabilidade
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

### Validação, Ferramentas e Documentação
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black) ![Scalar](https://img.shields.io/badge/Scalar-101827?style=for-the-badge&logo=openapiinitiative&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

---

## Visão Geral

Este repositório contém o código-fonte do backend da aplicação **Syngate**, uma **API RESTful** modular projetada para gerenciar controle de acesso físico em ambientes institucionais com integração a hardware IoT (ESP32 + RFID/NFC).

O sistema autentica usuários via cartão RFID, valida turno horário e perfil de acesso em tempo real, registra logs de auditoria e emite eventos via Socket.IO para o painel web.

**API ao vivo:** [https://syngate-api.onrender.com](https://syngate-api.onrender.com)

**Documentação interativa:** disponível apenas em ambiente local em `http://localhost:3333/docs` (Scalar) e `http://localhost:3333/swagger` (Swagger UI). Desabilitada em produção por segurança.

---

## Ecossistema Syngate

A aplicação está dividida em três componentes modulares e integrados. Navegue pelos repositórios para explorar cada camada do sistema:

| Componente | Repositório | Escopo Técnico |
|------------|-------------|----------------|
| **API Backend** | [syngate-backend](https://github.com/Molimpion/syngate-backend) | API RESTful, regras de negócio (RBAC), WebSockets e persistência. |
| **Frontend Web** | [syngate-frontend](https://github.com/Molimpion/syngate-frontend) | Interface administrativa, gráficos de consumo e monitoramento em tempo real. |
| **Hardware IoT** | [syngate-iot](https://github.com/Molimpion/syngate-iot) | Firmware em C++ para ESP32, sensor ultrassônico e leitura segura de RFID. |

---

## Arquitetura e Decisões de Design

A aplicação segue uma arquitetura baseada em **Módulos**, separando domínios lógicos para maximizar a manutenibilidade, com separação clara entre `schemas`, `middlewares`, `services` e `controllers`.

```
src/
├── config/          # Swagger e Scalar
├── lib/             # Clientes Prisma, Redis e Socket.IO
├── modules/         # Domínios: access, auth, devices, reports, rooms, shifts, users
├── schemas/         # Validação Zod por domínio
└── shared/
    ├── middlewares/ # Auth JWT, Device, Rate Limit, Role, Validate, Error
    ├── types/       # Tipos globais e augmentations Express
    └── utils/       # Utilitários: device-key, events, hash, shift-validator

```

**Decisões técnicas relevantes:**

* **Autenticação dupla:** usuários via JWT (Bearer token, 15min) + refresh token rotativo (7 dias, hash SHA-256 no banco); dispositivos IoT via headers `x-device-mac` + `x-device-key` (SHA-256), sem JWT


* **Rate limiting:** global via Redis (100 req/15min); endpoints de auth com limite próprio (10 req/15min)


* **Blacklist de tokens:** logout invalida o access token imediatamente via Redis com TTL igual ao tempo restante


* **Validação de turnos:** suporte a turnos noturnos que cruzam meia-noite; horários em minutos desde meia-noite


* **Cache de relatórios:** dashboard cacheado no Redis por 5 minutos


* **Soft delete:** usuários desativados têm `ativo = false`, dados e logs preservados


* **Documentação protegida:** Swagger/Scalar desabilitados em `NODE_ENV=production`


---

## Infraestrutura de Produção

| Serviço | Provedor | Observação |
| --- | --- | --- |
| API (Node.js) | Render (Web Service) | Free tier — hiberna após 15min sem uso |
| Banco de Dados | Neon (PostgreSQL 18) | Região: São Paulo |
| Cache | Upstash (Redis) | Região: São Paulo — 500k comandos/mês |

---

## Como Executar Localmente

### Pré-requisitos

* Git
* Docker e Docker Compose
* Node.js v18 ou superior

### Inicialização

1. Clone o repositório
2. Crie o `.env` baseado no `.env.example`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/syngate"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="gere_uma_chave_secreta_forte"
PORT=3333
NODE_ENV=development

```

3. Suba os serviços locais (PostgreSQL + Redis):

```bash
npm run services:up

```

4. Instale as dependências e aplique as migrations:

```bash
npm install
npx prisma generate
npx prisma migrate dev

```

5. Inicie o servidor:

```bash
npm run dev

```

O servidor estará disponível em `http://localhost:3333`.

A documentação interativa estará em `http://localhost:3333/docs`.

---

## 5. Populando o Banco (Seed)

```bash
npx prisma db seed

```

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
| --- | --- | --- |
| `DATABASE_URL` | Connection string PostgreSQL | ✅ |
| `REDIS_URL` | Connection string Redis | ✅ |
| `JWT_SECRET` | Chave de assinatura JWT | ✅ (sem fallback — API não sobe sem ela) |
| `PORT` | Porta do servidor | ✅ |
| `NODE_ENV` | `development` ou `production` | ✅ |
| `ALLOWED_ORIGINS` | Origens CORS permitidas (separadas por vírgula) | ❌ (default: `*`) |

---

## Autenticação

### Usuários (Painel Web)

Todas as rotas administrativas exigem `Authorization: Bearer <accessToken>`.

Papéis disponíveis: `ALUNO`, `PROFESSOR`, `FUNCIONARIO`, `COORDENADOR`, `GESTOR`, `VISITANTE`.

Rotas restritas a `GESTOR` e `COORDENADOR`: criação/edição de usuários, dispositivos, salas e turnos.

### Dispositivos IoT (ESP32)

O endpoint `POST /api/v1/access` **não aceita JWT**. Autentica exclusivamente via:

```
x-device-mac: AA:BB:CC:DD:EE:FF
x-device-key: <chave raw gerada no provisionamento>

```

A chave raw é exibida **uma única vez** no momento do provisionamento — deve ser gravada no firmware imediatamente.

---

## Endpoints

### Sistema

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Health check da API |

### Autenticação (`/api/v1/auth`)

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/cadastro` | Cadastro de usuário (e-mail requer verificação) |
| `GET` | `/verificar-email` | Ativa a conta via token enviado por e-mail |
| `POST` | `/login` | Login — retorna access token + refresh token |
| `POST` | `/refresh` | Renova tokens (refresh token é rotacionado) |
| `POST` | `/logout` | Invalida o access token via blacklist Redis |

### Usuários (`/api/v1/users`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/me` | Perfil do usuário autenticado | Autenticado |
| `GET` | `/` | Lista paginada de usuários | GESTOR / COORDENADOR |
| `POST` | `/` | Cria usuário administrativamente | GESTOR / COORDENADOR |
| `GET` | `/:id` | Busca usuário por ID | GESTOR / COORDENADOR |
| `PUT` | `/:id` | Atualiza dados do usuário | GESTOR / COORDENADOR |
| `DELETE` | `/:id` | Desativa usuário (soft delete) | GESTOR / COORDENADOR |
| `PATCH` | `/:id/cartao` | Vincula / desvincula cartão RFID | GESTOR / COORDENADOR |

### Salas (`/api/v1/rooms`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/` | Lista paginada de salas | Autenticado |
| `POST` | `/` | Cria sala | GESTOR / COORDENADOR |
| `GET` | `/:id` | Busca sala por ID | Autenticado |
| `PUT` | `/:id` | Atualiza sala | GESTOR / COORDENADOR |
| `DELETE` | `/:id` | Remove sala | GESTOR / COORDENADOR |

### Turnos (`/api/v1/shifts`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/` | Lista paginada de turnos | Autenticado |
| `POST` | `/` | Cria turno | GESTOR / COORDENADOR |
| `GET` | `/:id` | Busca turno por ID | Autenticado |
| `PUT` | `/:id` | Atualiza turno | GESTOR / COORDENADOR |
| `DELETE` | `/:id` | Remove turno | GESTOR / COORDENADOR |

### Dispositivos IoT (`/api/v1/devices`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/` | Lista paginada de dispositivos | GESTOR / COORDENADOR |
| `POST` | `/` | Provisiona dispositivo e gera chave | GESTOR / COORDENADOR |
| `GET` | `/:id` | Busca dispositivo por ID | GESTOR / COORDENADOR |
| `PUT` | `/:id` | Atualiza dispositivo | GESTOR / COORDENADOR |
| `DELETE` | `/:id` | Remove dispositivo | GESTOR / COORDENADOR |

### Validação de Acesso Físico (`/api/v1/access`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `POST` | `/` | Valida cartão RFID, registra log e emite evento Socket.IO | Dispositivo IoT |

### Relatórios (`/api/v1/reports`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/stats` | Estatísticas consolidadas do dashboard (Cache Redis 60s) | GESTOR / COORDENADOR |
| `GET` | `/dashboard` | Agregação de acessos (cache Redis 5min) | GESTOR / COORDENADOR |
| `GET` | `/export/csv` | Exporta histórico em CSV | GESTOR / COORDENADOR |

---

## Eventos Socket.IO

| Evento | Acionado por | Finalidade |
| --- | --- | --- |
| `access:new` | `POST /api/v1/access` | Notifica em tempo real qualquer tentativa de acesso físico (concedido ou negado). O status de autorização é retornado dentro do payload do evento.

 |

---

## Testes

```bash
# Rodar todos os testes
npm test

# Modo watch
npm run test:watch

```

Cobertura atual: testes unitários (`shift-validator`) e testes de segurança (`auth`).

---

## Integração com Hardware (ESP32)

O firmware da placa lê o UID do cartão RFID via sensor MFRC522, detecta presença via ultrassônico HC-SR04 e chama `POST /api/v1/access` com autenticação por headers de hardware.

O dispositivo deve ser provisionado via API antes de operar — o endpoint `POST /api/v1/devices` gera a `rawKey` que é gravada no firmware.

> **Atenção:** o plano free do Render hiberna após 15 minutos de inatividade. A primeira requisição após hibernação pode levar até 30 segundos.

---

## Guias de Contribuição e Qualidade (DX)

### Padronização de Commits

Este projeto utiliza **Husky** e **Commitlint** para garantir a rastreabilidade do histórico. Todos os commits devem seguir a especificação [Conventional Commits](https://www.conventionalcommits.org/):

> `feat: adiciona rota de relatórios`
> `fix: corrige validação de turno noturno`

### Auditoria Dinâmica (AI Agents)

Para garantir a saúde da arquitetura, o projeto conta com prompts especializados para ferramentas de Inteligência Artificial localizados em `.agents/skills/`. Durante o desenvolvimento, utilize comandos de barra (ex: `/architecture-audit`, `/security-audit`, `/database-architect-audit`) na sua IDE para rodar verificações de integridade.

| Agent Skill | Objetivo Principal |
| --- | --- |
| **API Architect Audit** | Valida design de endpoints REST, OpenAPI/Swagger e padronização de status HTTP.

 |
| **Architecture Audit** | Garante a separação estrita de responsabilidades (SOLID e Clean Architecture) entre Controllers e Services.

 |
| **Database Architect Audit** | Analisa o schema do Prisma procurando por gaps de normalização, índices ausentes e N+1 queries.

 |
| **Observability Lead Audit** | Checa logs estruturados, tratamento de erros não capturados e possível exposição de dados sensíveis.

 |
| **Performance Audit** | Focado em alta concorrência, identifica gargalos assíncronos e vazamentos de memória.

 |
| **Security Audit** | Varredura profunda de vulnerabilidades (XSS, IDOR, Segredos) baseada nas versões exatas do `package.json` e lockfile.

 |
| **Testing Lead Audit** | Avalia a cobertura real, fragilidade dos testes e o balanceamento da pirâmide de testes.

 |

### Ferramentas de Suporte

Caso seja necessário redefinir emergencialmente as senhas do ambiente local, execute o utilitário de break-glass presente no repositório:

```bash
npx tsx reset-senha.ts

```

---

## Licença

Este projeto está sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
