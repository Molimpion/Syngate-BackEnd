# API Versioning Reference

## Estratégias

### 1. URL Path (Recomendado)
```
/v1/users
/v2/users
```

Pros: Clara, fácil roteamento, suporta múltiplas versões em paralelo
Cons: URL mais longa

### 2. Header Accept (Content Negotiation)
```
GET /users
Accept: application/vnd.api+json;version=1
```

Pros: URLs limpas
Cons: Menos discoverível

### 3. Query Parameter (Fallback)
```
GET /users?version=1
```

Pros: Testável em browser
Cons: Confunde com filtro real

## Escolha: URL Path é padrão

```typescript
// Express
app.use('/v1', v1Routes);
app.use('/v2', v2Routes);

// Nest.js
@Controller('v1/users')
export class UsersV1Controller { }

@Controller('v2/users')
export class UsersV2Controller { }
```

## Deprecation

```typescript
// Route middleware marca como deprecated
app.get('/v1/users', (req, res, next) => {
  res.set('Deprecation', 'true');
  res.set('Sunset', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString());
  res.set('Link', '</v2/users>; rel="successor-version"');
  next();
});
```

## OpenAPI
```yaml
info:
  version: 1.0.0
  x-api-lifecycle:
    deprecated: false
    deprecation-date: "2025-12-31"
    sunset-date: "2026-06-30"
    successor: "/v2"
```

## Checklist

- [ ] Versão consistente em todos endpoints
- [ ] Deprecation header para versões antigas
- [ ] Migration guide para upgrade
- [ ] Sunset date comunicado aos clientes
- [ ] Suporte a múltiplas versões simultâneas
