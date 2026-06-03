# False Positives Reference

## Arquivos Ignorados

- `prisma/.env.local` — Variáveis de ambiente
- `prisma/dev.db` — SQLite de desenvolvimento
- `node_modules/.prisma/` — Cliente gerado
- Migrations em `.prisma/migrations/` que foram rollback
- Schema antigo em branches deletadas

## Padrões Permitidos

### 1. Soft Delete Opcional
```prisma
// É ok ter deletedAt opcional se nem todo modelo usa
model User {
  deletedAt DateTime?
}

model Post {
  // Sem deletedAt (apenas apaga real)
}
```

### 2. Denormalização Intencional
```prisma
// É ok armazenar email_cached se for invalidado corretamente
model User {
  email            String
  emailCached      String?  // Sincronizado via trigger/event
}
```

### 3. Índices Futuros
```prisma
// OK ter comentários sobre índices planejados
// TODO: adicionar índice em searchTerm após ter dados suficientes
```

## Quando Reportar Mesmo

- Relacionamento quebrado (FK aponta para coluna inexistente)
- Tipo de dado errado para o domínio (String para ID)
- Constraints faltando em dados únicos
- Índices faltando em colunas com queries frequentes

## Exemplo de Descarte

**Achado**: `User.phone` não tem índice

**Contexto**: Phone é campo opcional, consultas por phone são raras

**Descarte**: Índice não justificado (baixa cardinalidade e queries raras). Pode ser adicionado conforme necessário.
