---
name: database-architect-audit
description: 'Auditoria de Schema, Migrations e Performance de Banco de Dados (Prisma/PostgreSQL/MySQL). Detecta relações faltantes, índices ausentes, N+1 queries, deadlocks e violações de constraints. Use em "auditar database", "schema audit", ou "/database-architect-audit".'
---

# Database Architect Audit (Prisma / PostgreSQL / MySQL)

Scanner orientado a **DBA / Database Architect**: focado em design de schema, relacionamentos, índices, migrations e integridade de dados.

**Idioma do relatório:** português.

## Princípios da Auditoria

1. **Schema Correto = Menos Bugs:** Constraints, tipos de dados e relacionamentos bem definidos.
2. **Índices Estratégicos:** Apenas índices que melhoram queries reais (não prematuros).
3. **Migrations Seguras:** Reversíveis, testáveis e sem downtime em produção.
4. **Normalização Apropriada:** Balancear entre normalização e performance.

## Fluxo de execução (ordem fixa)

### Step 1 — Escopo e Estrutura
1. Identificar ORM/Query Builder: Prisma, TypeORM, Sequelize, etc.
2. Carregar `refs/prisma-schema.md` para entender padrões.
3. Localizar:
   - `schema.prisma` (Prisma) ou migrations (TypeORM)
   - Pasta de migrations: `prisma/migrations/` ou `src/migrations/`
   - Arquivo de seed: `prisma/seed.ts`

### Step 2 — Análise de Schema
1. Carregar `refs/schema-design.md`.
2. Validar:
   - Tipos de dados corretos (não usar String para números)
   - `@unique`, `@id`, `@@unique` bem aplicados
   - Relacionamentos: `@relation`, foreign keys
   - `createdAt`, `updatedAt` presentes em entities críticas
   - Soft deletes (campo `deletedAt` onde apropriado)

### Step 3 — Relacionamentos
1. Carregar `refs/relationships.md`.
2. Procurar:
   - Relacionamentos um-para-muitos bem definidos
   - Many-to-many com tabela de junção ou implícita
   - Cascade deletes apropriados (não apagar sem validar)
   - Orphans (registros sem parent)

### Step 4 — Índices
1. Carregar `refs/indexing.md`.
2. Validar:
   - Índices em foreign keys
   - Índices em campos de filtro frequente (WHERE, ORDER BY)
   - Índices compostos para queries com múltiplos filtros
   - Evitar índices redundantes

### Step 5 — Migrations
1. Carregar `refs/migrations.md`.
2. Verificar:
   - Migrations sequenciais sem gaps
   - Sem migrations não reversíveis (DROP sem IF EXISTS)
   - Sem downtime em produção (ADD COLUMN non-NOT NULL com DEFAULT)
   - Data migrations testáveis

### Step 6 — Constraints e Validação
1. Carregar `refs/constraints.md`.
2. Validar:
   - NOT NULL onde apropriado
   - Check constraints para domínios (status IN ('active', 'inactive'))
   - Foreign key constraints
   - Default values sensatos

### Step 7 — Perguntas de Performance
1. Carregar `refs/query-optimization.md`.
2. Questionar:
   - Há eager loading (include/with) em queries críticas?
   - Há índices para joins?
   - Há índices para ORDER BY?
   - Há paginação em listas grandes?

### Step 8 — Anti-falso-positivo
1. Carregar `refs/false-positives.md`.
2. Descartar recomendações que não cabem no contexto.

### Step 9 — Relatório
1. Gerar output de acordo com `refs/report.md`.

## Guia de Severidade

| Nível    | Significado                                        |
|----------|--------------------------------------------------|
| CRITICAL | Relacionamento ausente, constraint quebrado, migration falhada |
| HIGH     | Índice faltante em FK, N+1 query, missing NOT NULL |
| MEDIUM   | Índice faltante em filtro, schema denormalizado desnecessariamente |
| LOW      | Sugestão de normalização, otimização prematura |
| INFO     | Documentação, melhor prática (seed data, migrations ordering) |

## Referências

| Arquivo                    | Uso                           |
|--------------------------|-------------------------------|
| `refs/prisma-schema.md`    | Step 1 — estrutura de schema  |
| `refs/schema-design.md`    | Step 2 — design de schema     |
| `refs/relationships.md`    | Step 3 — relacionamentos      |
| `refs/indexing.md`         | Step 4 — índices              |
| `refs/migrations.md`       | Step 5 — migrations           |
| `refs/constraints.md`      | Step 6 — constraints          |
| `refs/query-optimization.md` | Step 7 — otimização de query |
| `refs/false-positives.md`  | Step 8 — falsos positivos     |
| `refs/report.md`           | Step 9 — formato de saída     |

## Atalhos grep (pistas)

```
@id
@unique
@relation
@default
NOT NULL
REFERENCES
CREATE INDEX
DROP COLUMN
```

Confirmar contexto antes de reportar.
