# Prisma Schema Reference

## Checklist Básico

- [ ] Arquivo `prisma/schema.prisma` existe
- [ ] `datasource db` configurada corretamente
- [ ] `generator client` presente
- [ ] Modelos seguem PascalCase
- [ ] Campos seguem camelCase
- [ ] `@id`, `@unique`, `@default` bem aplicados
- [ ] Relacionamentos definem `@relation`

## Estrutura Recomendada

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  posts     Post[]    @relation("authorPosts")

  @@map("users")
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String
  published Boolean   @default(false)
  authorId  Int
  author    User      @relation("authorPosts", fields: [authorId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([authorId])
  @@map("posts")
}
```

## Verificação

```bash
npx prisma validate
npx prisma db push --skip-generate
```
