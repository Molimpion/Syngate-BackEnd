# Migrations Reference

## Boas Práticas

### 1. Reversível
```sql
-- ✅ Bom: fácil reverter
ALTER TABLE users ADD COLUMN age INT DEFAULT 18;

-- ❌ Ruim: não reversível
DROP TABLE users;
```

### 2. Sem Downtime
```sql
-- ✅ Bom: adiciona com DEFAULT
ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active';

-- ❌ Ruim: sem DEFAULT, queries esperam lock
ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL;
```

### 3. Sequencial e Ordenada
```
20240101_001_create_users.sql
20240101_002_create_posts.sql  ← depende de users (FK)
20240101_003_add_index_on_posts.sql
```

### 4. Testável
```bash
npx prisma migrate dev  # Roda migrations e gera client
npx prisma migrate resolve --rolled-back <migration-name>  # Se precisar reverter
```

## Padrão Prisma

```prisma
-- prisma/migrations/{timestamp}_init/migration.sql

CREATE TABLE "users" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "posts" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "authorId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");
```

## Red Flags

- Migrations que rodaram mas não estão no git
- Gaps em numbers (001, 002, 004)
- Migrations com IF NOT EXISTS redundantes
- Data migrations sem rollback strategy
