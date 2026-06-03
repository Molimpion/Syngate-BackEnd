# Schema Design Reference

## Tipos de Dados Corretos

| Campo | Tipo Prisma | Tipo PostgreSQL | Nota |
|-------|------------|-----------------|------|
| ID | Int, BigInt | SERIAL, BIGSERIAL | Use BigInt se > 2B registros |
| Email | String | VARCHAR(255) | Sempre @unique |
| Booleano | Boolean | BOOLEAN | Nunca String |
| Data | DateTime | TIMESTAMP | Sempre timezone-aware |
| Dinheiro | Decimal | NUMERIC(10,2) | Nunca Float |
| Texto longo | String | TEXT | Use @db.Text |
| JSON | Json | JSONB | Suporta queries |

## Padrão Essencial

```prisma
model Entity {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  // ... campos específicos
}
```

### Soft Delete
```prisma
model Entity {
  // ...
  deletedAt DateTime?
}
```

### Status Enum
```prisma
enum UserRole {
  ADMIN
  USER
  MODERATOR
}

model User {
  id    Int  @id
  role  UserRole @default(USER)
}
```

## Red Flags

- String para números: `id: String` (deve ser Int/BigInt)
- Float para dinheiro: `price: Float` (deve ser Decimal)
- Sem `createdAt`/`updatedAt` em entities críticas
- Boolean sem `@default` (gera NULL ambíguo)
- Sem `@unique` em emails
