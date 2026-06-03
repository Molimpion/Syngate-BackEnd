# Indexing Reference

## Quando Criar Índices

### SEMPRE (Obrigatório)
- Foreign Keys: `@@index([authorId])`
- Campos de busca frequente: `@@index([email])`
- Ordenação frequente: `@@index([createdAt])`
- Composite queries: `@@index([userId, createdAt])`

### CUIDADO (Medir antes)
- Campos com muita cardinalidade (status: true/false → índice ruim)
- Múltiplos índices na mesma tabela (manutenção cara)
- Índices em campos que mudam frequentemente (writes lentos)

## Exemplos

### Índice Simples
```prisma
model User {
  id    Int  @id
  email String @unique  // implicitamente indexado
  name  String
  
  @@index([email])  // explícito (se não for @unique)
}
```

### Índice Composto
```prisma
model Post {
  id     Int
  userId Int
  status String  // 'draft' | 'published'
  
  @@index([userId, status])  // query: WHERE userId = X AND status = 'published'
}
```

### Sem Downtime
```prisma
model User {
  // ...
  @@index([createdAt])  // Criar em paralelo, depois ativar
}
```

## Red Flags

- Sem índices em FKs
- Sem índices em filtros WHERE frequentes
- Índices desatualizados (coluna deletada mas índice permanece)
- Múltiplos índices similares
- Índice em coluna booleana (ruim para cardinalidade)

## Métricas

```sql
-- PostgreSQL: verificar índices
SELECT * FROM pg_stat_user_indexes;

-- Índices não usados
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
```
