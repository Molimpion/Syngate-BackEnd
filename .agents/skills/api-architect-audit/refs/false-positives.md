# False Positives Reference

## Padrões Permitidos

### 1. Endpoints Internos
```
/health
/metrics
/admin/debug
```

OK: Não precisam de documentação completa se são internas

### 2. Webhooks
```
POST /webhooks/stripe
POST /webhooks/github
```

OK: Endpoint específico do fornecedor, não segue padrão REST

### 3. RPC (GraphQL, gRPC)
```
POST /graphql
```

OK: Não é REST, não precisa de URL design REST

### 4. Upload/Download Binário
```
POST /files/upload
GET /files/{id}/download
```

OK: Pode retornar diferentes media types

## Quando Reportar Mesmo

- Documentação desatualizada vs código
- Status HTTP inconsistentes entre endpoints
- Sem autenticação em dados sensíveis
- Schema indefinido em OpenAPI
- Breaking change sem versão

## Exemplo de Descarte

**Achado**: `/health` endpoint não segue REST (não é recurso)

**Contexto**: Endpoint de monitoramento, não é API pública

**Descarte**: Exceção permitida para health checks. Mantém padrão REST para recursos públicos.
