# HTTP Status & Error Format Reference

## Status Codes Padronizados

```
GET  /users          → 200 OK
POST /users          → 201 Created
GET  /users/999      → 404 Not Found
POST /users (inválido) → 400 Bad Request
DELETE /users/1      → 204 No Content (ou 200)
```

## Error Format Consistente

### ✅ Padrão Simples
```json
{
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR",
  "status": 400
}
```

### ✅ Padrão Detalhado (Recomendado)
```json
{
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "status": 404,
    "details": {
      "userId": 999,
      "searchedIn": "users_table"
    }
  },
  "request_id": "req-123-abc",
  "timestamp": "2025-01-15T10:30:45Z"
}
```

## Enum de Códigos de Erro

```typescript
enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

## OpenAPI Error Response

```yaml
components:
  responses:
    ValidationError:
      description: Validation failed
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: object
                properties:
                  message: { type: string }
                  code: { type: string, enum: [VALIDATION_ERROR] }
                  details:
                    type: object
              request_id: { type: string }

paths:
  /users:
    post:
      responses:
        '400': { $ref: '#/components/responses/ValidationError' }
        '401': { $ref: '#/components/responses/Unauthorized' }
```

## Exemplo Express

```typescript
class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number,
    public details?: object
  ) {
    super(message);
  }
}

app.use((err: ApiError, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      code: err.code,
      status: err.status,
      ...(err.details && { details: err.details }),
    },
    request_id: req.id,
  });
});
```

## Checklist

- [ ] Status 2xx, 4xx, 5xx consistentes
- [ ] Error format padronizado
- [ ] Error codes enum em OpenAPI
- [ ] Request ID em erro
- [ ] Timestamp em erro
- [ ] Detalhes úteis para debug (sem expor secrets)
