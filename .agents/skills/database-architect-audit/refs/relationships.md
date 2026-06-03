# Relationships Reference

## Tipos

### Um-para-Muitos
```prisma
model Author {
  id    Int
  books Book[]  // lado "muitos"
}

model Book {
  id       Int
  authorId Int
  author   Author @relation(fields: [authorId], references: [id])
}
```

### Muitos-para-Muitos (Implícita)
```prisma
model Student {
  id       Int
  courses  Course[]  // Prisma cria tabela automática
}

model Course {
  id       Int
  students Student[]
}
```

### Muitos-para-Muitos (Explícita)
```prisma
model StudentCourse {
  studentId Int
  courseId  Int
  grade     String
  student   Student @relation(fields: [studentId], references: [id])
  course    Course  @relation(fields: [courseId], references: [id])

  @@id([studentId, courseId])
}

model Student {
  id        Int
  enrollments StudentCourse[]
}

model Course {
  id        Int
  enrollments StudentCourse[]
}
```

## Cascade Deletes

```prisma
model User {
  id    Int
  posts Post[]  @relation(onDelete: Cascade)
}

model Post {
  id     Int
  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Cuidado: Cascade automático pode causar deleção em cascata inesperada.

## Red Flags

- Relacionamento não definido (FK sem @relation)
- Orphans (registros sem parent)
- Circular dependencies sem escape
- Cascade Delete em relacionamentos sensíveis (User → Order)
