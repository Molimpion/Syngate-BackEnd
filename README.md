**Repositório do Backend da Aplicação Syngate**(*Projeto de Controle de Acesso e Gestão Operacional.*)

-----

*Projeto Integrador da Turma 43 da Faculdade Senac Pernambuco.*
*Professores responsáveis: Arnott Caiado, Alison Vinicius*

### Framework e Ambiente Principal
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

### Banco de Dados e Cache
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Infraestrutura e Observabilidade
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) 

### Validação, Ferramentas e Documentação
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black) ![Scalar](https://img.shields.io/badge/Scalar-101827?style=for-the-badge&logo=openapiinitiative&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

-----

## 1\. Visão Geral

Este repositório contém o código-fonte do backend da aplicação **Syngate**.
Trata-se de uma **API RESTful** robusta, segura e modular, projetada para gerenciar o controle de acesso, dispositivos (totens/catracas), salas, turnos operacionais e logs de auditoria.

**API ao vivo:** https://syngate-api.onrender.com

**Documentação (Scalar - Moderna):** [URL_DA_API_AQUI/scalar]

**Documentação (Swagger - Clássica):** [URL_DA_API_AQUI/api-docs]

## 2\. Estado do Projeto

[ ESPAÇO RESERVADO PARA A LISTA DE TASKS ]

## 3\. Arquitetura e Decisões de Design

A aplicação segue uma arquitetura baseada em **Módulos**, separando domínios lógicos (`access`, `auth`, `devices`, `rooms`, `shifts`, `users`, `reports`) para maximizar a manutenibilidade, com separação clara entre `schemas`, `middlewares`, `services` e `controllers`.

  * **Framework Web:** Express.js
  * **Banco de Dados:** PostgreSQL 
  * **Cache de Dados:** Redis (utilizado para otimização e gerência temporária)
  * **ORM:** Prisma
  * **Segurança (Autenticação):** Tokens JWT com verificação de papéis (Role-Based Access Control)
  * **Comunicação em Tempo Real:** `socket.io` centralizado (`socket.gateway.ts`) para notificações instantâneas de acesso
  * **Validação:** Validação robusta de dados em rotas usando middlewares de schemas
  * **Documentação:** Suporte híbrido com **Swagger UI** e **Scalar**.
  * **Tratamento de Erros:** Middleware global de captura de exceções e `rate-limit` para proteção de endpoints
  * **Testes:** Suíte de testes unitários e de segurança utilizando `Jest`

### Ambiente de Desenvolvimento Padronizado

O projeto utiliza o `docker-compose.yml` para definir e automatizar a infraestrutura local. São orquestrados serviços essenciais como o banco de dados PostgreSQL e o Redis, garantindo paridade de ambiente.

## 4\. Como Executar o Projeto Localmente

### 1\. Pré-requisitos

  * Git
  * Docker e Docker Compose
  * Node.js (v18 ou superior)

### 2\. Inicialização

1.  Clone este repositório.
2.  Na raiz do projeto, crie um arquivo `.env` baseado no `.env.example`.

**Exemplo de `.env` local:**

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/syngate"

# Cache
REDIS_URL="redis://localhost:6379"

# Segurança
JWT_SECRET="gere_uma_chave_secreta_forte"
PORT=3000

```

3. Suba a infraestrutura via Docker:

```bash
docker-compose up -d

```

### 3. Instalação e Execução

Execute os seguintes comandos no terminal:

```bash
npm install

```

Aplique as migrações (use `reset` para recriar o banco, se necessário):

```bash
npx prisma generate
npx prisma migrate dev

```

Inicie o servidor de desenvolvimento:

```bash
npm run dev

```

O servidor estará disponível em `http://localhost:3000`.

## 5. Populando o Banco de Dados (Seed)

O projeto inclui um script de **Seed** (`prisma/seed.ts`) para inicializar o banco com perfis básicos necessários para a operação do controle de acesso.

### Como Rodar

```bash
npx prisma db seed

```

## 6. Deployment

A aplicação está estruturada para deploy contínuo. Certifique-se de configurar as seguintes variáveis de ambiente no seu provedor de hospedagem:

* `DATABASE_URL`: (Connection String do PostgreSQL)
* `REDIS_URL`: (Connection String do Redis)
* `JWT_SECRET`: (Chave secreta forte e única para produção)
* `PORT`: (Porta de execução, geralmente fornecida pelo host)

*O comando de build padrão para este repositório é `npm run build`, seguido de `npm run start` para inicialização.*

## 7. Testando a API

A aplicação possui ampla cobertura de testes, incluindo testes unitários e testes de segurança (`tests/security/auth.security.spec.ts`, `tests/unit/shift-validator.spec.ts`).

Para executar a suíte de testes usando Jest:

```bash
npm run test

```

Para verificar a cobertura:

```bash
npm run test:cov

```

## 8. Documentação da API (Endpoints)

A API é segmentada por módulos de domínio.

### Autenticação (`/auth`)

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/login` | Autentica e retorna um token JWT |
| `POST` | `/refresh` | Renova o token de acesso |

### Usuários (`/users`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/` | Lista todos os usuários | Autenticado |
| `POST` | `/` | Cria um novo usuário | Admin |
| `GET` | `/:id` | Detalhes de um usuário específico | Autenticado |
| `PUT` | `/:id` | Atualiza dados do usuário | Admin |
| `DELETE` | `/:id` | Inativa ou remove o usuário | Admin |

### Dispositivos (`/devices`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/` | Lista dispositivos (totens/ponto) | Admin |
| `POST` | `/` | Registra um novo dispositivo | Admin |
| `PUT` | `/:id` | Atualiza configurações do device | Admin |

### Ambientes e Acesso (`/rooms` & `/access`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/rooms` | Lista as salas controladas | Autenticado |
| `POST` | `/rooms` | Cria uma nova sala/área de acesso | Admin |
| `POST` | `/access/log` | Registra uma tentativa/sucesso de acesso | Device |
| `GET` | `/access` | Consulta histórico de logs de acesso | Admin |

### Turnos e Relatórios (`/shifts` & `/reports`)

| Método | Endpoint | Descrição | Acesso |
| --- | --- | --- | --- |
| `GET` | `/shifts` | Lista os turnos operacionais | Autenticado |
| `POST` | `/shifts` | Cadastra novas regras de turno | Admin |
| `GET` | `/reports` | Extrai consolidados operacionais | Admin |

## 9. Eventos em Tempo Real (Socket.io)

O Syngate emite eventos em tempo real para monitoramento do ecossistema de acesso físico, controlados pelo `socket.gateway.ts`.

| Evento Emitido | Acionado por | Finalidade |
| --- | --- | --- |
| `access_granted` | Sucesso em `/access/log` | Notifica abertura de porta/catraca |
| `access_denied` | Falha de validação de acesso | Alerta de tentativa não autorizada |
| `device_status_changed` | Mudança de estado do dispositivo | Monitoramento de saúde dos totens |
