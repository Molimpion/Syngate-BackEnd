Aqui está a versão base do seu `README.md` adaptada para o contexto do **Syngate**. Atualizei as badges de acordo com a stack que observei nos arquivos do seu repositório (incluindo Redis, Prisma, Express, Socket.io, Jest, Swagger/Scalar) e removi a lista de requisitos como você pediu (deixando um espaço pronto para quando você mandar as tasks).

---

**Repositório do Backend da Aplicação Syngate**

---

### Framework e Ambiente Principal

### Banco de Dados e Cache

### Infraestrutura e Testes

### Documentação e Ferramentas

---

## 1. Visão Geral

Este repositório contém o código-fonte do backend da aplicação **Syngate**.
Trata-se de uma **API RESTful** robusta, segura e escalável, projetada para realizar o controle de acesso, gerenciamento de usuários, dispositivos (devices), salas (rooms), turnos (shifts) e relatórios operacionais.

**Documentação (Scalar - Moderna):** `/docs` ou `/scalar` (Configurado localmente)
**Documentação (Swagger - Clássica):** `/api-docs` ou `/swagger` (Configurado localmente)

## 2. Estado do Projeto

*(Aguardando o envio das tasks para gerar a nova lista)*

## 3. Arquitetura e Decisões de Design

A aplicação segue uma arquitetura modular, dividida em módulos focados em domínios específicos (Auth, Access, Users, Devices, Rooms, Shifts, Reports), visando facilitar a manutenção, testabilidade e escalabilidade.

* **Framework Web:** Express.js
* **Banco de Dados Relacional:** PostgreSQL
* **Cache e Filas:** Redis
* **ORM:** Prisma
* **Segurança (Autenticação):** Tokens JWT com middlewares globais para restrição baseada em Roles e Devices.
* **Comunicação em Tempo Real:** `socket.io` para emissão de eventos (ex: logs de acesso e atualizações em tempo real).
* **Validação:** Schemas centralizados garantindo a integridade dos dados na entrada das rotas.
* **Documentação:** Suporte híbrido com **Swagger UI** e **Scalar**.
* **Testes:** Cobertura de testes unitários e de integração configurada com **Jest**.
* **Tratamento de Erros:** Middleware centralizado para tratamento de erros, incluindo formatação de respostas padronizadas e controle de rate limiting.

### Ambiente de Desenvolvimento Padronizado

O projeto está orquestrado via `docker-compose.yml`, facilitando a subida dos contêineres de banco de dados (PostgreSQL) e cache (Redis) em paralelo à aplicação Node.js.

## 4. Como Executar o Projeto Localmente

### 1. Pré-requisitos

* Git
* Node.js (v18+)
* Docker e Docker Compose

### 2. Inicialização

1. Clone este repositório.
2. Na raiz do projeto, copie o arquivo de exemplo de variáveis de ambiente para criar o seu `.env`:

```bash
cp .env.example .env

```

**Principais variáveis do `.env`:**

```env
# Conexão com Banco de Dados e Cache
DATABASE_URL="postgresql://user:password@localhost:5432/syngate_db"
REDIS_URL="redis://localhost:6379"

# Segurança e App
PORT=3000
JWT_SECRET="sua_chave_secreta_jwt"

```

### 3. Rodando o Ambiente

Suba a infraestrutura base (Banco de Dados e Redis) utilizando o Docker Compose:

```bash
docker-compose up -d

```

Instale as dependências do projeto:

```bash
npm install

```

Gere os artefatos do Prisma e aplique as migrações no banco de dados (e execute o seed, caso possua):

```bash
npx prisma generate
npx prisma migrate dev

```

Inicie o servidor de desenvolvimento:

```bash
npm run dev

```

A API estará disponível em `http://localhost:3000`.

## 5. Testes e Qualidade

O repositório possui uma suíte de testes robusta. Para executar os testes locais:

```bash
# Executar todos os testes
npm run test

# Executar testes com relatório de cobertura (Coverage)
npm run test:cov

```

*(Os relatórios de cobertura ficam salvos na pasta `/coverage` do projeto)*

## 6. Principais Endpoints da API

A estrutura de módulos da API expõe os seguintes domínios principais:

* **`/auth`**: Autenticação de usuários, geração e renovação de tokens JWT.
* **`/users`**: Gestão completa de usuários (criação, edição, listagem).
* **`/devices`**: Gestão e registro de dispositivos que interagem com o sistema de acesso.
* **`/rooms`**: Gestão de salas/ambientes controlados pelo Syngate.
* **`/shifts`**: Gestão de turnos e escalas, essenciais para validação temporal de acessos.
* **`/access`**: Registro e controle de logs de acesso aos ambientes (Access Logs).
* **`/reports`**: Geração de relatórios analíticos de acesso e utilização do sistema.

## 7. Eventos em Tempo Real (Socket.io)

O Syngate faz o uso de **WebSockets** via `Socket.gateway.ts` para notificar aplicações clientes (dashboards ou totens) de forma instantânea. Módulos como o de acesso emitem eventos globais que permitem monitoramento ao vivo no frontend.

---

**Pode enviar a lista de tasks!** Assim que você mandar, eu gero o *checklist* de Estado do Projeto (na Seção 2) com os itens certos.
