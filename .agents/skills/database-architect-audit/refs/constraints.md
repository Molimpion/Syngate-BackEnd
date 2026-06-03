# Constraints Reference

## Tipos

### PRIMARY KEY
```prisma
model User {
  id Int @id  // PRIMARY KEY
}

// Composto
@@id([userId, courseId])
```

### UNIQUE
```prisma
model User {
  email String @unique
  
  // Composto
  @@unique([email, tenantId])
}
```

### FOREIGN KEY
```prisma
model Post {
  userId Int
  user   User @relation(fields: [userId], references: [id])
  // FK criada automaticamente
}
```

### NOT NULL
```prisma
model User {
  email String      // Obrigatório (NOT NULL)
  phone String?     // Opcional (NULL permitido)
}
```

### CHECK
```prisma
model User {
  age Int
  
  // Pseudo-check (Prisma valida em app, não em BD)
  // Alternativa: usar Enum
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
}

model User {
  status Status @default(ACTIVE)  // Implicitamente CHECK
}
```

### DEFAULT
```prisma
model User {
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  status    String   @default("active")
  version   Int      @default(1)
}
```

## Red Flags

- Campo crítico sem NOT NULL
- Sem DEFAULT em Boolean (gera ambiguidade NULL)
- FK sem constraint de integridade
- Sem UNIQUE em email
- CHECK constraints não validadas em app layer
