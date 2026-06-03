# Pagination & Filtering Reference

## Paginação

### Offset-Based (Simples)
```
GET /users?page=2&limit=10
```

Request: página 2, 10 itens por página
Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 245,
    "pages": 25,
    "hasNext": true,
    "hasPrev": true
  }
}
```

Problema: Ineficiente em datasets grandes (OFFSET lento)

### Cursor-Based (Melhor para tempo real)
```
GET /posts?cursor=abc123&limit=10
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "cursor": "next_cursor_xyz",
    "hasNext": true
  }
}
```

Vantagem: O(1), suporta atualizações em tempo real

## Filtros

### Query Parameters
```
GET /users?role=admin&status=active&createdAt[gte]=2025-01-01

# Múltiplos valores
GET /users?role=admin,user&status=active,pending
```

### Request Body (Avançado, alternativa)
```
POST /users/search
{
  "filters": {
    "role": { "in": ["admin", "user"] },
    "createdAt": { "gte": "2025-01-01" },
    "email": { "contains": "example.com" }
  },
  "sort": { "createdAt": "desc" }
}
```

## Sorting

```
GET /users?sort=-createdAt,name

# Interpretação:
# - createdAt (descendente)
# + name (ascendente)
```

## Limites

```typescript
// Máximo de itens por página
const MAX_LIMIT = 100;

// Validar
if (limit > MAX_LIMIT) {
  limit = MAX_LIMIT;
}

// Documentar em OpenAPI
parameters:
  - name: limit
    in: query
    schema:
      type: integer
      default: 10
      maximum: 100
```

## OpenAPI

```yaml
parameters:
  - name: page
    in: query
    schema: { type: integer, default: 1, minimum: 1 }
  - name: limit
    in: query
    schema: { type: integer, default: 10, maximum: 100 }
  - name: sort
    in: query
    schema: { type: string, example: '-createdAt,name' }
  - name: filter[role]
    in: query
    schema: { type: string, enum: [admin, user] }
```

## Exemplo Express

```typescript
interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  filter?: Record<string, any>;
}

function parsePaginationParams(query: any): PaginationParams {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  
  return { page, limit, sort: query.sort, filter: query.filter };
}

app.get('/users', (req, res) => {
  const { page, limit, sort } = parsePaginationParams(req.query);
  const skip = (page - 1) * limit;
  
  // Query DB com skip/limit
  // ...
});
```

## Checklist

- [ ] Endpoints com N+ itens têm paginação
- [ ] Limites de query param documentados
- [ ] Defaults sensatos (limit=10, max=100)
- [ ] Response inclui metadados de paginação
- [ ] Sort suportado em campos indexados
- [ ] Validação de input (page >= 1, limit > 0)
