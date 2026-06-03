# Query Optimization Reference

## N+1 Query Problem

### ❌ Problema
```typescript
const users = await prisma.user.findMany();

// Dentro de loop (N+1!)
users.forEach(user => {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
});
```

### ✅ Solução (Eager Loading)
```typescript
const users = await prisma.user.findMany({
  include: {
    posts: true,  // Carrega tudo de uma vez
  },
});
```

## Índices para Joins

```prisma
model Post {
  id     Int
  userId Int
  user   User @relation(fields: [userId], references: [id])
  
  // Sem índice: JOIN lento
  @@index([userId])  // Com índice: JOIN rápido
}
```

## Índices para ORDER BY

```typescript
// Query
const posts = await prisma.post.findMany({
  orderBy: { createdAt: 'desc' },
  take: 10,
});

// Schema
model Post {
  createdAt DateTime
  
  @@index([createdAt])  // Necessário para eficiência
}
```

## Paginação

```typescript
// ❌ Ineficiente (OFFSET alto)
const page = 1000;
const posts = await prisma.post.findMany({
  skip: page * 10,
  take: 10,
});

// ✅ Eficiente (Cursor-based)
const posts = await prisma.post.findMany({
  cursor: { id: lastPostId },
  take: 10,
});
```

## Select (Projeção)

```typescript
// ❌ Carrega tudo
const users = await prisma.user.findMany();

// ✅ Carrega apenas necessário
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
```

## Red Flags

- Queries sem índices em filtros
- N+1 loops sem eager loading
- OFFSET sem limite em paginação
- SELECT * quando só precisa de 3 campos
