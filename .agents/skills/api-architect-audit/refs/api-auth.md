# API Authentication & Authorization Reference

## Esquemas

### Bearer Token (OAuth2, JWT)
```
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

OpenAPI:
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

### API Key
```
GET /users
X-API-Key: sk_live_abc123def456
```

OpenAPI:
```yaml
components:
  securitySchemes:
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - apiKeyAuth: []
```

### OAuth2
```yaml
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://example.com/oauth/authorize
          tokenUrl: https://example.com/oauth/token
          scopes:
            read: Read access
            write: Write access
```

## Permissões por Endpoint

```yaml
paths:
  /users:
    get:
      operationId: listUsers
      security:
        - bearerAuth: [read]
      description: Qualquer usuário autenticado pode listar
    
    post:
      operationId: createUser
      security:
        - bearerAuth: [write]
      x-required-role: admin
      description: Apenas admin pode criar

  /users/{id}/admin:
    put:
      operationId: makeAdmin
      security:
        - bearerAuth: [admin]
      x-required-role: super_admin
```

## Responses de Auth

```
401 Unauthorized (sem token válido)
{
  "error": {
    "message": "Missing or invalid token",
    "code": "UNAUTHORIZED"
  }
}

403 Forbidden (autenticado mas sem permissão)
{
  "error": {
    "message": "Insufficient permissions",
    "code": "FORBIDDEN",
    "requiredRole": "admin"
  }
}
```

## Exemplo Express

```typescript
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });
  
  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  };
}

app.get('/users', requireAuth, (req, res) => {
  // Qualquer autenticado
});

app.post('/users', requireAuth, requireRole('admin'), (req, res) => {
  // Apenas admin
});
```

## Checklist

- [ ] Esquema de auth definido em OpenAPI
- [ ] Todos endpoints sensíveis têm auth
- [ ] Permissões documentadas por endpoint
- [ ] Responses 401/403 documentadas
- [ ] Exemplos com token válido/inválido
- [ ] Token em header (nunca query param)
- [ ] CORS configurado corretamente
