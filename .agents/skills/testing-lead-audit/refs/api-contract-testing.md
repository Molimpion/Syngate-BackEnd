# API Contract Testing Reference

## O que Testar

### 1. Estrutura de Response
```typescript
import { request } from 'supertest';

describe('GET /api/users/:id', () => {
  it('should return user with correct schema', async () => {
    const res = await request(app).get('/api/users/1');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('name');
    expect(typeof res.body.email).toBe('string');
  });
});
```

### 2. Autenticação/Autorização
```typescript
it('should return 401 without auth token', async () => {
  const res = await request(app).get('/api/users/1');
  expect(res.status).toBe(401);
});

it('should return 403 if user lacks permission', async () => {
  const res = await request(app)
    .get('/api/admin/reports')
    .set('Authorization', `Bearer ${userToken}`);
  expect(res.status).toBe(403);
});
```

### 3. Validação de Input
```typescript
it('should return 400 with invalid email', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({ email: 'invalid-email' });
  expect(res.status).toBe(400);
  expect(res.body.error).toBeDefined();
});
```

### 4. Status HTTP Corretos
```typescript
// Sucesso
201 Created, 200 OK, 204 No Content

// Erro Cliente
400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict

// Erro Servidor
500 Internal Server Error, 503 Service Unavailable
```

## Tools

- **supertest**: HTTP assertions
- **jest-openapi**: Validar contra Swagger
- **zod** / **joi**: Validar schemas

## Exemplo com Zod

```typescript
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
});

it('should return valid user', async () => {
  const res = await request(app).get('/api/users/1');
  expect(() => UserSchema.parse(res.body)).not.toThrow();
});
```

## Red Flags

- Sem testes de status HTTP (tudo 200)
- Sem validação de erro
- Sem testes de auth/authz
- Response muda sem aviso (breaking change)
