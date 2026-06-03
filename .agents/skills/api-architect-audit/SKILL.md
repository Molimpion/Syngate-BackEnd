---
name: api-architect-audit
description: 'Auditoria de Design, Contrato e Versionamento de APIs REST (OpenAPI/Swagger, Express). Detecta inconsistências de schema, falta de documentação, versionamento inadequado e erros de design de endpoint. Use em "auditar api", "api audit", ou "/api-architect-audit".'
---

# API Architect Audit (REST / OpenAPI / Express)

Scanner orientado a **API Architect / Tech Lead**: focado em design, contratos e documentação de APIs.

**Idioma do relatório:** português.

## Princípios da Auditoria

1. **Contrato = Contrato:** Schema definido antes de implementação; não mudar sem aviso.
2. **Versionamento Claro:** `/v1/`, `/v2/` ou header `Accept-Version`.
3. **Documentação Viva:** Swagger/OpenAPI sempre sincronizado com código.
4. **Erros Consistentes:** Mesmo status HTTP, mesmo error format em toda API.

## Fluxo de execução (ordem fixa)

### Step 1 — Escopo e Documentação
1. Carregar `refs/openapi-structure.md`.
2. Localizar:
   - Arquivo Swagger: `swagger.json`, `swagger.yaml`, `openapi.yaml`
   - Decoradores (Nest.js): `@ApiOperation`, `@ApiResponse`
   - Comentários JSDoc com exemplos
3. Verificar se documentação é atual (último commit vs arquivo)

### Step 2 — Design de Endpoints
1. Carregar `refs/endpoint-design.md`.
2. Validar:
   - Métodos HTTP corretos (GET, POST, PUT, DELETE, PATCH)
   - Nomes no plural (`/users`, não `/user`)
   - Recursos aninhados logicamente (`/users/{id}/orders`)
   - Sem verbos em paths (`/getUser` é anti-padrão)

### Step 3 — Versionamento
1. Carregar `refs/api-versioning.md`.
2. Verificar:
   - Se versão está presente
   - Estratégia consistente (URL path, header, query param)
   - Deprecation clara para versões antigas
   - Migration path documentado

### Step 4 — Schemas e Contratos
1. Carregar `refs/schema-contract.md`.
2. Validar:
   - Schemas definidos para request/response
   - Tipos corretos (não tudo `any`)
   - Enums para domínios (status, role)
   - Documentação de campos obrigatórios

### Step 5 — Status HTTP e Erros
1. Carregar `refs/http-status-errors.md`.
2. Procurar:
   - Status HTTP consistentes (200, 201, 400, 401, 403, 404, 500)
   - Error format padronizado (ex: `{ error: string, code: string, details?: object }`)
   - Documentação de possíveis erros

### Step 6 — Paginação e Filtros
1. Carregar `refs/pagination-filtering.md`.
2. Validar:
   - Endpoints com muitos dados têm paginação
   - Query params padronizados (`page`, `limit`, `sort`, `filter`)
   - Documentação de limites (max 100 itens, etc)
   - Cursor-based para dados em tempo real

### Step 7 — Autenticação e Autorização
1. Carregar `refs/api-auth.md`.
2. Verificar:
   - Endpoints protegidos têm esquema de auth (Bearer, API Key, OAuth)
   - Documentação de permissões por endpoint
   - Exemplos com token válido/inválido
   - Resposta 401/403 documentada

### Step 8 — Anti-falso-positivo
1. Carregar `refs/false-positives.md`.
2. Descartar recomendações que não cabem no contexto.

### Step 9 — Relatório
1. Gerar output de acordo com `refs/report.md`.

## Guia de Severidade

| Nível    | Significado                                      |
|----------|------------------------------------------------|
| CRITICAL | Breaking change sem versão, schema indefinido  |
| HIGH     | Documentação desatualizada, erro format inconsistente |
| MEDIUM   | Falta de paginação em lista, enums sem docs    |
| LOW      | Sugestão de design (naming, organização)       |
| INFO     | Documentação (exemplos, notas)                 |

## Referências

| Arquivo                     | Uso                           |
|-----------------------------|-------------------------------|
| `refs/openapi-structure.md` | Step 1 — estrutura OpenAPI    |
| `refs/endpoint-design.md`   | Step 2 — design de endpoints  |
| `refs/api-versioning.md`    | Step 3 — versionamento        |
| `refs/schema-contract.md`   | Step 4 — schemas              |
| `refs/http-status-errors.md` | Step 5 — status e erros      |
| `refs/pagination-filtering.md` | Step 6 — paginação          |
| `refs/api-auth.md`          | Step 7 — auth                 |
| `refs/false-positives.md`   | Step 8 — falsos positivos     |
| `refs/report.md`            | Step 9 — formato de saída     |

## Atalhos grep (pistas)

```
@ApiOperation
@ApiResponse
@ApiParam
@ApiQuery
@ApiBody
export const GET =
export const POST =
app.get(
app.post(
app.put(
app.delete(
router.get(
```

Confirmar contexto antes de reportar.
