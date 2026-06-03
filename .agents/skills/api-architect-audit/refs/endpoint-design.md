# Endpoint Design Reference

## Padrões REST

### Recursos (Nouns)
```
✅ /users
✅ /users/{id}
✅ /users/{id}/orders
✅ /orders/{id}/items

❌ /getUser (verbo em path)
❌ /user (singular)
❌ /users_list (underscore)
```

### Métodos HTTP
```
GET     /users              → List all
POST    /users              → Create new
GET     /users/{id}         → Fetch single
PUT     /users/{id}         → Replace
PATCH   /users/{id}         → Update partial
DELETE  /users/{id}         → Delete

GET     /users/{id}/orders  → List user orders
POST    /users/{id}/orders  → Create order for user
```

### Query Parameters
```
✅ GET /users?page=1&limit=10&sort=-createdAt&filter[role]=admin
✅ GET /orders?status=paid,pending
✅ GET /search?q=john

❌ GET /users?page=1&limit=10&sortBy=-createdAt (inconsistente)
❌ GET /users?sort_by=createdAt (underscore)
```

## Status Codes

```
2xx Success
  200 OK (GET, PATCH, PUT, DELETE com resposta)
  201 Created (POST com resposta)
  204 No Content (DELETE sem resposta, HEAD)

4xx Client Error
  400 Bad Request (validação falhou)
  401 Unauthorized (não autenticado)
  403 Forbidden (sem permissão)
  404 Not Found (recurso não existe)
  409 Conflict (violação de constraint)
  422 Unprocessable Entity (semântica inválida)

5xx Server Error
  500 Internal Server Error
  503 Service Unavailable
```

## Exemplo Completo

```typescript
// ✅ Bem desenhado
app.get('/api/v1/users', authenticate, (req, res) => {
  // Listar usuários com paginação
  const { page = 1, limit = 10 } = req.query;
  // ...
});

app.post('/api/v1/users', validateUserInput, (req, res) => {
  // Criar usuário
  // Status 201 + Location header
});

app.get('/api/v1/users/:id', authenticate, (req, res) => {
  // Fetch usuário
  // Status 404 se não existe
});

app.patch('/api/v1/users/:id', authenticate, authorize('user.edit'), (req, res) => {
  // Update parcial
});

app.delete('/api/v1/users/:id', authenticate, authorize('user.delete'), (req, res) => {
  // Delete
});
```

## Red Flags

- Sem versão em path
- Verbos em URLs
- Métodos HTTP incorretos (GET para criar)
- Inconsistência (alguns singular, alguns plural)
- Sem autenticação em endpoints sensíveis
