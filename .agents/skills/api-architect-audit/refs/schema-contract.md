# Schema & Contract Reference

## Tipos Forte

### ❌ Fraco (any, indefinido)
```yaml
responses:
  '200':
    content:
      application/json:
        schema: {}  # Indefinido!
```

```typescript
interface User {
  id: any;
  email: any;
  data: Record<string, any>;  // Muito genérico
}
```

### ✅ Forte (tipos específicos)
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          minimum: 1
        email:
          type: string
          format: email
        name:
          type: string
          minLength: 1
          maxLength: 255
        role:
          type: string
          enum: [admin, user, moderator]
          default: user
        createdAt:
          type: string
          format: date-time
      required: [id, email, name, role]
      additionalProperties: false
```

## Enums para Domínios

```typescript
// ✅ Enum em schema
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

// OpenAPI
role:
  type: string
  enum: [admin, user, moderator]
```

## Exemplos

```yaml
User:
  type: object
  example:
    id: 123
    email: john@example.com
    name: John Doe
    role: user
    createdAt: "2025-01-15T10:30:45Z"

CreateUserRequest:
  type: object
  example:
    email: john@example.com
    name: John Doe
```

## Validação

```typescript
// Schema validation (Zod, Joi)
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: z.enum(['admin', 'user', 'moderator']).default('user'),
});

// Middleware
app.post('/users', (req, res) => {
  const validation = userSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error });
  }
  // ...
});
```

## Checklist

- [ ] Todos campos têm tipos específicos
- [ ] Nenhum `any` em schema
- [ ] Campos obrigatórios em `required`
- [ ] Enums para domínios (role, status)
- [ ] Min/max length, pattern onde apropriado
- [ ] Exemplos de request/response
