# Syngate — Backend

## O que é o projeto

Sistema de controle de acesso físico para ambientes institucionais (faculdades, empresas).
Dispositivos IoT baseados em ESP32 (catracas e leitores de cartão RFID) estão distribuídos pelas salas e portarias. Quando alguém aproxima um cartão, o ESP32 chama o backend, que decide em tempo real se o acesso é concedido ou negado — e registra o evento para auditoria.

O backend também serve um painel administrativo web (frontend não incluso neste repo) que consome a API para gerenciar usuários, salas, turnos e visualizar logs em tempo real via WebSocket.

---

## Stack completa

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework web | Express (sem NestJS — não sugerir migração) |
| ORM | Prisma 7 (PostgreSQL) |
| Banco de dados | PostgreSQL 15 |
| Cache / blacklist | Redis 7 (ioredis) |
| WebSocket | Socket.IO (`src/lib/socket.gateway.ts`) |
| Validação de entrada | Zod (schemas em `src/schemas/`) |
| Logging | Pino + pino-http (não usar `console.log` em produção) |
| Autenticação | JWT (jsonwebtoken) + bcrypt (12 rounds, 4 em test) |
| Documentação API | Swagger UI (`/swagger`) + Scalar (`/docs`) |
| Testes | Jest + ts-jest |
| Segurança | Helmet, CORS, rate limiting via Redis, express-async-errors |
| Infra local | Docker Compose (só PostgreSQL na 5433 e Redis na 6379 — o app roda fora do container) |
| Qualidade | Commitlint (conventional commits) + Husky (commit-msg hook) |

---

## Arquitetura

O projeto usa **arquitetura modular com separação estrita de camadas**. Cada módulo em `src/modules/` tem exatamente quatro arquivos: `routes`, `controller`, `service` e às vezes um schema local. Nunca misturar responsabilidades.

```
src/
  modules/<modulo>/
    <modulo>.routes.ts      → registra endpoints, encadeia middlewares
    <modulo>.controller.ts  → extrai dados do Request, chama service, monta Response
    <modulo>.service.ts     → toda a lógica de negócio + único lugar onde o Prisma é chamado
  schemas/                  → validação Zod dos inputs (body, params, query)
  shared/
    middlewares/            → auth, roles, device, rate-limit, validate, error handler global
    utils/                  → funções puras (hash, device-key, shift-validator, events)
    types/                  → interfaces e DTOs TypeScript
  lib/
    prisma.ts               → instância singleton do PrismaClient
    redis.ts                → instância singleton do ioredis
    socket.gateway.ts       → configura Socket.IO e escuta systemEvents
  config/
    swagger.ts              → spec OpenAPI 3.1 completa escrita à mão
    scalar-config.ts        → renderiza o Scalar a partir da spec
  app.ts                    → monta o Express (middlewares, rotas, error handler)
  server.ts                 → inicia o servidor HTTP
```

**Regra crítica de camadas:**
- Controllers nunca importam Prisma diretamente
- Utils nunca chamam o banco
- A única exceção aceita é `device.middleware.ts`, que precisa autenticar o hardware antes da request chegar ao controller

---

## Mapa completo de endpoints

### Sem autenticação
| Método | Rota | O que faz |
|---|---|---|
| GET | `/health` | Health check — retorna `{ status: 'ok', service: 'syngate-backend' }` |

### `/api/v1/auth` — rate limit especial: 10 req/15min por IP

| Método | Rota | Auth | O que faz |
|---|---|---|---|
| POST | `/cadastro` | Público | Cria usuário com `emailVerificado: false`, gera `tokenVerificacao`. Em DEV loga o token no console (sem envio real de e-mail) |
| GET | `/verificar-email?token=` | Público | Ativa a conta, zera o `tokenVerificacao` |
| POST | `/login` | Público | Valida credenciais + `emailVerificado`, retorna `accessToken` (JWT 15min) + `refreshToken` (opaco, 7 dias) |
| POST | `/refresh` | Público | Gira o refresh token: deleta o antigo, cria um novo par de tokens |
| POST | `/logout` | JWT | Adiciona o access token à blacklist Redis com TTL = tempo restante |
| POST | `/trocar-senha` | JWT | Valida senha atual antes de aplicar nova senha |

### `/api/v1/users`

| Método | Rota | Roles permitidos | O que faz |
|---|---|---|---|
| GET | `/me` | Qualquer autenticado | Perfil do usuário logado (extrai ID do JWT) |
| GET | `/` | GESTOR, COORDENADOR | Lista paginada com busca full-text (nome, email, matrícula) |
| POST | `/` | GESTOR, COORDENADOR | Cria usuário com hash de senha. Valida unicidade de email e matrícula |
| GET | `/:id` | GESTOR, COORDENADOR | Busca usuário por ID |
| PUT | `/:id` | GESTOR, COORDENADOR | Atualiza campos permitidos (schema `.strict()` — campos extras rejeitados) |
| DELETE | `/:id` | GESTOR, COORDENADOR | **Soft delete**: seta `ativo: false`. Nunca remove do banco |
| PATCH | `/:id/cartao` | GESTOR, COORDENADOR | Vincula ou desvincula cartão RFID. Valida unicidade do cartão entre usuários. `cartaoId: null` desvincula |

**Campos nunca retornados:** `hashSenha` e `tokenVerificacao` (filtrados via `USER_SELECT_FIELDS` em todas as queries)

### `/api/v1/rooms`

| Método | Rota | Roles | O que faz |
|---|---|---|---|
| GET | `/` | Qualquer autenticado | Lista paginada com busca por nome e bloco |
| GET | `/:id` | Qualquer autenticado | Busca sala por ID |
| POST | `/` | GESTOR, COORDENADOR | Cria sala. Unicidade por `[nome + bloco]` — P2002 → 409 |
| PUT | `/:id` | GESTOR, COORDENADOR | Atualiza sala |
| DELETE | `/:id` | GESTOR, COORDENADOR | Remove sala. Se tiver dispositivos vinculados → P2003 → 400 |

### `/api/v1/shifts`

| Método | Rota | Roles | O que faz |
|---|---|---|---|
| GET | `/` | Qualquer autenticado | Lista paginada com busca por nome |
| GET | `/:id` | Qualquer autenticado | Busca turno por ID |
| POST | `/` | GESTOR, COORDENADOR | Cria turno com `horaInicio`, `horaFim` (inteiros) e `diasSemana` (array) |
| PUT | `/:id` | GESTOR, COORDENADOR | Atualiza turno. Prisma P2025 → 404 |
| DELETE | `/:id` | GESTOR, COORDENADOR | Remove turno. P2003 (usuários vinculados) → 400. P2025 → 404 |

### `/api/v1/devices` — exclusivo GESTOR e COORDENADOR (middleware no router, não por rota)

| Método | Rota | O que faz |
|---|---|---|
| POST | `/` | **Provisiona** dispositivo: gera `rawKey` aleatória (32 bytes hex), salva o hash SHA-256 no banco, retorna a `rawKey` UMA ÚNICA VEZ na resposta. O administrador precisa configurar o ESP32 com essa chave neste momento |
| GET | `/` | Lista dispositivos paginada com busca por nome e MAC |
| GET | `/:id` | Busca dispositivo por ID |
| PUT | `/:id` | Atualiza metadados (nome, tipo, status, MAC, sala, IP) |
| DELETE | `/:id` | Remove dispositivo |

**`hashChaveSeguranca` nunca é retornado** — filtrado via `DEVICE_SELECT`

### `/api/v1/access` — autenticado por hardware (não JWT)

| Método | Rota | Auth | O que faz |
|---|---|---|---|
| POST | `/` | `x-device-mac` + `x-device-key` | Valida acesso e grava log. Contrato de resposta fixo para o ESP32 |

**Fluxo interno do `AccessService.processAccess()`:**
1. Busca usuário pelo `uidCartao` (inclui turno)
2. Se não encontrar → `reason: 'Cartão não cadastrado'`, `granted: false`
3. Se `usuario.ativo === false` → `reason: 'Usuário inativo'`
4. Se `usuario.dataExpiracao` passou → `reason: 'Acesso expirado'`
5. Se tem turno e horário/dia inválido → `reason: 'Fora do horário permitido'`
6. Se passou tudo → `granted: true`, `status: CONCEDIDO`
7. **Sempre grava o `LogAcesso`** — mesmo cartão desconhecido tem log (usuarioId fica null, uidCartao é salvo)
8. Emite evento `'access:new'` via `systemEvents` → Socket.IO repassou ao dashboard
9. Retorna `{ granted: boolean, reason: string | null }` ao ESP32

**Este contrato de resposta não pode mudar** — é o que controla o relé da catraca.

### `/api/v1/reports` — exclusivo GESTOR e COORDENADOR

| Método | Rota | O que faz |
|---|---|---|
| GET | `/stats` | Estatísticas agregadas gerais |
| GET | `/dashboard` | Logs filtrados por `dataInicio`, `dataFim`, `usuarioId`, `dispositivoId`, `status` |
| GET | `/export/csv` | Download CSV dos logs com os mesmos filtros |

---

## Sistema de autenticação em detalhe

### Usuários (JWT)
- Access token: JWT assinado com `{ sub: userId, papel, nome }`, expira em 15 minutos
- Refresh token: string aleatória de 40 bytes hex (nunca é um JWT). Salvo como hash SHA-256 na tabela `tokens`
- Logout: adiciona o access token à blacklist Redis com `EX = tempoRestante`. O `authMiddleware` checa a blacklist antes de verificar a assinatura JWT
- `authMiddleware` faz um extra: além de verificar o JWT, busca o usuário no banco para confirmar que ainda está ativo (`ativo: true`). Isso implica uma query a cada request autenticada.
- **Vulnerabilidade conhecida no código:** `auth.middleware.ts` tem `JWT_SECRET || 'fallback_secret_development'`. O `auth.service.ts` usa `process.env.JWT_SECRET` com throw se undefined. O fallback do middleware é um risco — o teste de segurança em `tests/security/auth.security.spec.ts` documenta exatamente esse vetor de ataque.

### Dispositivos IoT (chave de hardware)
- Headers obrigatórios: `x-device-mac` (endereço MAC) e `x-device-key` (chave secreta)
- O `deviceMiddleware` busca o dispositivo pelo MAC, compara `hashDeviceKey(key)` com `hashChaveSeguranca` armazenado
- Dispositivo com status `INATIVO` ou `MANUTENCAO` é rejeitado com 403
- Em caso de qualquer erro → 403 genérico (nunca revela o motivo específico)

### Papéis (PapelUsuario)
`ALUNO` `PROFESSOR` `FUNCIONARIO` `COORDENADOR` `GESTOR` `VISITANTE`

O `roleMiddleware` recebe um array de papéis e bloqueia quem não estiver nele com 403.

---

## Schema do banco

### `usuarios`
```
id               UUID PK
nome             TEXT
email            TEXT UNIQUE
hashSenha        TEXT          — hash bcrypt, nunca texto limpo
matricula        TEXT? UNIQUE
cartaoId         TEXT? UNIQUE  — UID do cartão RFID/NFC
curso            TEXT?
papel            PapelUsuario  default ALUNO
ativo            BOOLEAN       default true  — soft delete aqui
dataExpiracao    DATETIME?     — para visitantes e contratos temporários
emailVerificado  BOOLEAN       default false
tokenVerificacao TEXT? UNIQUE  — nulo após verificação concluída
turnoId          TEXT?         FK → turnos
criadoEm / atualizadoEm
Índices GIN (pg_trgm): nome, email  — permite ILIKE rápido com pg_trgm
```

### `tokens`
```
id            UUID PK
tipo          TipoToken  — REFRESH | CHAVE_API | APP
hash          TEXT UNIQUE  — SHA-256 do token real
dataExpiracao DATETIME?
revogado      BOOLEAN default false
usuarioId     FK → usuarios (onDelete: Cascade)
Índice: usuarioId
```

### `turnos`
```
id         TEXT PK  (pode ser slug como 'aluno-manha')
nome       TEXT
horaInicio INTEGER  — minutos desde meia-noite (0–1439)
horaFim    INTEGER  — minutos desde meia-noite (0–1439)
diasSemana INTEGER[]  — array nativo PostgreSQL, padrão JS: 0=Dom..6=Sab
```

### `salas`
```
id    UUID PK
nome  TEXT
bloco TEXT?
@@unique([nome, bloco])  — impede "Sala 101" duplicada no "Bloco A"
```

### `dispositivos`
```
id                 UUID PK
nome               TEXT
tipo               TipoDispositivo  default LEITOR_CARTAO
status             StatusDispositivo default ATIVO
enderecoMac        TEXT? UNIQUE  — formato AA:BB:CC:DD:EE:FF
hashChaveSeguranca TEXT?  — SHA-256, nunca a chave real
ipLocal            TEXT?
salaId             FK → salas
```

### `logs_acesso`
```
id            UUID PK
dataHora      DATETIME default now()
status        StatusAcesso   — CONCEDIDO | NEGADO
finalidade    FinalidadeLog  — ENTRADA_PREDIO | PRESENCA_SALA
direcao       DirecaoAcesso  — ENTRADA | SAIDA
motivo        TEXT?  — ex: "Fora do horário permitido", "Cartão não cadastrado"
usuarioId     TEXT?  FK → usuarios (onDelete: SetNull)  — null para cartões desconhecidos
uidCartao     TEXT?  — UID bruto do RFID, sempre salvo mesmo sem usuário
dispositivoId FK → dispositivos (onDelete: Cascade)
Índices: dataHora | (usuarioId, dataHora) | (dispositivoId, dataHora) | (usuarioId, status)
```

**Decisão crítica:** `onDelete: SetNull` em `usuarioId` — se um usuário for deletado, os logs permanecem para auditoria, mas `usuarioId` fica null. O `uidCartao` bruto ainda identifica o cartão.

---

## Lógica de validação de turno

Arquivo: `src/shared/utils/shift-validator.ts`

- Horários em **minutos desde meia-noite**: 480 = 08:00, 1320 = 22:00
- Dias da semana seguem **padrão JS `Date.getDay()`**: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
- **Suporte a turnos noturnos que cruzam meia-noite**: se `horaInicio > horaFim` (ex: 22:00 às 06:00 = 1320 > 360), a lógica usa OR em vez de AND: `currentMinutes >= horaInicio || currentMinutes <= horaFim`
- Professores têm 30 min de margem antes e depois em relação aos alunos (configurado no seed)
- Usuário sem turno vinculado: acesso é concedido sem validação de horário

---

## Convenções do projeto

- **Idioma:** todo o código em português — variáveis, campos do banco, mensagens de erro, comentários, nomes de métodos
- **Padrão de resposta:** `{ status: 'success' | 'error', data?, message?, meta?, errors? }`
- **Erros com código HTTP no message:** services lançam `new Error('409:Mensagem legível')`. Controllers fazem `error.message.startsWith('409:')` para mapear o status HTTP certo. O error handler global captura o resto e retorna 500
- **Erros Prisma mapeados nos services:** `P2002` (unique constraint) → 409, `P2003` (foreign key) → 400, `P2025` (record not found) → 404
- **Paginação padrão:** `page=1`, `limit=10`, máximo 100. Resposta inclui `meta: { total, page, limit, totalPages }`
- **Schemas Zod com `.strict()`** em updates: campos extras na requisição causam erro 400 (impede mass assignment)
- **`select` explícito** em todas as queries que retornam usuário ou dispositivo — nunca retornar `hashSenha`, `tokenVerificacao` ou `hashChaveSeguranca` por acidente
- **Documentação só fora de produção:** `/swagger` e `/docs` são registrados apenas se `NODE_ENV !== 'production'`
- **Rate limit global:** 100 req/15min por IP (Redis). Rate limit especial em `/auth`: 10 req/15min

---

## Decisões de design e por quê

- **Express sem NestJS:** projeto iniciado com foco em aprendizado e controle granular. A estrutura modular cobre as necessidades sem a complexidade do Nest. Não sugerir migração.
- **Refresh token opaco (não JWT):** pode ser revogado instantaneamente no banco. Um refresh JWT válido não pode ser invalidado sem blacklist — por isso a escolha de string aleatória + hash.
- **Horário em minutos inteiros:** comparação numérica simples, sem parsing de strings de hora. Suporta turnos noturnos com lógica de inversão trivial.
- **`onDelete: SetNull` nos logs:** trilha de auditoria é imutável. Deletar um usuário não pode apagar o histórico de quem entrou e saiu do prédio.
- **Redis para rate limit e blacklist:** estado distribuído fora do processo Node. Funciona com múltiplas instâncias sem coordenação adicional.
- **GIN indexes com pg_trgm:** permite buscas ILIKE (`LIKE '%termo%'`) rápidas sem full table scan. Habilitado na segunda migration (`sync_gin_indexes`). A extensão `pg_trgm` é criada na primeira migration.
- **`systemEvents` (EventEmitter):** desacopla o módulo de acesso do Socket.IO. O `AccessService` emite `'access:new'` sem saber que existe WebSocket. O gateway escuta o EventEmitter e repassa ao Socket.IO.
- **Dispositivo deletado → logs deletados (Cascade):** diferente do usuário, um dispositivo removido não precisa manter histórico associado. A decisão foi feita conscientemente no schema.

---

## O que NÃO está implementado

- **Envio de e-mail real:** o `tokenVerificacao` é apenas logado no console em DEV. Não há integração com SMTP, SendGrid, Resend ou similar.
- **Refresh token rotation com detecção de reutilização:** o token antigo é deletado quando usado, mas não há alerta se o mesmo token for usado duas vezes (indicaria possível roubo).
- **Frontend:** este repositório é exclusivamente o backend. Não há views, SSR ou arquivos estáticos.
- **Testes de integração e E2E:** existem apenas 2 arquivos de teste — um teste de segurança (documenta a vulnerabilidade do JWT fallback) e testes unitários do `shift-validator`. Cobertura de services, controllers e rotas está em aberto.

---

## Vulnerabilidade conhecida (documentada)

`src/shared/middlewares/auth.middleware.ts` usa `JWT_SECRET || 'fallback_secret_development'`.
Se a variável de ambiente não estiver configurada, qualquer token assinado com `'fallback_secret_development'` é aceito.
O arquivo `tests/security/auth.security.spec.ts` é um teste que **prova** e documenta esse vetor de ataque — não é um teste de funcionalidade normal, é um registro do risco.
O `auth.service.ts` foi corrigido (lança erro se `JWT_SECRET` não estiver definido), mas o middleware ainda tem o fallback.

---

## Setup local

```bash
docker compose up -d           # PostgreSQL na :5433, Redis na :6379
cp .env.example .env           # configurar variáveis (JWT_SECRET obrigatório)
npx prisma migrate dev         # aplicar migrations
npx prisma db seed             # popular: turnos, salas, dispositivos, admin
npm run dev                    # servidor na :3333
```

Documentação disponível em DEV:
- Swagger UI: http://localhost:3333/swagger
- Scalar: http://localhost:3333/docs

---

## Agentes de auditoria (`.agents/skills/`)

Skills de IA para uso com Claude Code / Cursor. Cada skill tem um `SKILL.md` com instruções detalhadas e uma pasta `refs/` com base de conhecimento.

| Skill | Comando | O que audita |
|---|---|---|
| `architecture-audit` | `/architecture-audit` | Separação de camadas, SOLID, fat controllers, Prisma fora do service |
| `api-architect-audit` | `/api-architect-audit` | Design REST, contratos, versionamento, status HTTP, paginação |
| `database-architect-audit` | `/database-architect-audit` | Schema Prisma, indexes, migrations, integridade referencial |
| `observability-lead-audit` | `/observability-lead-audit` | Logging estruturado, erros engolidos, dados sensíveis em log, promises não tratadas |
| `performance-audit` | `/performance-audit` | N+1 queries, uso de Redis, gargalos de Event Loop, falta de paginação |
| `security-audit` | `/security-audit` | Vulnerabilidades OWASP, exposição de segredos, falhas de auth/authz |
| `testing-lead-audit` | `/testing-lead-audit` | Cobertura, pirâmide de testes, testes frágeis, testes de BD e contrato |

Todos os relatórios são gerados em **português**.