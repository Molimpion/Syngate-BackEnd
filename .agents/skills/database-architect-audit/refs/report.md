# Database Architect Audit Report Format

## Estrutura

```markdown
# Database Architect Audit Report

## Executive Summary
- Total de Tabelas: X
- Relacionamentos Validados: X
- Índices: X (Y faltando)
- Migrations Pendentes: X
- Status: [PASS ✅ / NEEDS ATTENTION ⚠️ / CRITICAL 🔴]

## Schema Summary
| Tabela | Colunas | PKs | FKs | Índices | Status |
|--------|---------|-----|-----|---------|--------|
| users | 6 | 1 | 0 | 1 | ✅ |
| posts | 5 | 1 | 1 | 1 | ✅ |
| comments | 4 | 1 | 2 | 1 | ⚠️ |

## Achados Críticos

### 1. Relacionamento Quebrado
**Tabela:** posts
**FK:** user_id
**Problema:** Referencia users(user_id) que não existe (coluna é id)
**Impacto:** Constraint falha, inserts quebram
**Fix Sugerido:**
```sql
ALTER TABLE posts 
DROP CONSTRAINT posts_user_id_fkey,
ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id);
```

### 2. Índice Faltando em FK
**Tabela:** posts
**Coluna:** user_id
**Problema:** FK sem índice → JOIN lento
**Impacto:** Queries por usuário O(n)
**Fix Sugerido:**
```prisma
@@index([userId])
```

## Achados High

### 1. Tipo de Dado Incorreto
**Tabela:** orders
**Coluna:** total_price (tipo: Float)
**Problema:** Float para dinheiro causa arredondamento
**Impacto:** Erros de cálculo em produção
**Fix Sugerido:**
```prisma
total_price Decimal(10, 2)
```

## Achados Medium

### 1. NOT NULL Faltando
**Tabela:** users
**Coluna:** email
**Problema:** Email pode ser NULL
**Impacto:** Validação inconsistente
**Fix Sugerido:**
```prisma
email String @unique  // Implicitamente NOT NULL
```

## Recomendações

### Curto Prazo (Antes de PR)
1. Corrigir relacionamento quebrado em posts
2. Adicionar índices em FKs
3. Alterar total_price para Decimal

### Médio Prazo (Sprint Atual)
1. Adicionar índices em filtros frequentes
2. Revisar Cascade Deletes em relacionamentos sensíveis
3. Implementar soft delete para dados críticos

### Longo Prazo
1. Auditar migrations regularmente (mensal)
2. Manter documentação de relacionamentos
3. Estabelecer padrão de naming (snake_case vs camelCase)

## Migração Sugerida

```prisma
-- Criar índice faltando
@@index([user_id])

-- Alterar tipo de preço
total_price Decimal(10, 2)

-- Adicionar constraint NOT NULL
email String @unique  // Migração automática
```

```bash
npx prisma migrate dev --name "fix_schema"
```

## Métricas

- Relacionamentos: X validados, Y quebrados
- Índices: Z presentes, W sugeridos
- Constraints: A (% NOT NULL), B (% UNIQUE)
- Normalização: [3NF / BCNF]
```
