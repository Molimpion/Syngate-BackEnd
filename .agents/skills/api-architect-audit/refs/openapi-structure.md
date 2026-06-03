# OpenAPI Structure Reference

## Checklist Básico

- [ ] Arquivo `swagger.yaml` ou `openapi.json` existe
- [ ] Versão da API definida (`info.version`)
- [ ] Base path correto (`servers[0].url`)
- [ ] Todos endpoints documentados
- [ ] Schemas definem request/response
- [ ] Authentication scheme definido

## Estrutura OpenAPI 3.0 Completa

```yaml
openapi: 3.0.0
info:
  title: Syngate API
  version: 1.0.0
  description: Backend API for Syngate IoT platform
  contact:
    name: API Support
    url: https://support.example.com

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://staging-api.example.com/v1
    description: Staging

tags:
  - name: Users
    description: User management
  - name: Orders
    description: Order operations

paths:
  /users:
    get:
      operationId: listUsers
      summary: List all users
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema: { type: integer, default: 1 }
      responses:
        '200':
          description: User list
          content:
            application/json:
              schema: { $ref: '#/components/schemas/UserList' }
    post:
      operationId: createUser
      summary: Create new user
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateUserRequest' }
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/User' }
        '400':
          description: Invalid input

components:
  schemas:
    User:
      type: object
      properties:
        id: { type: integer }
        email: { type: string, format: email }
        name: { type: string }
      required: [id, email, name]
    
    CreateUserRequest:
      type: object
      properties:
        email: { type: string, format: email }
        name: { type: string }
      required: [email, name]
    
    UserList:
      type: object
      properties:
        data:
          type: array
          items: { $ref: '#/components/schemas/User' }
        pagination:
          type: object
          properties:
            page: { type: integer }
            limit: { type: integer }
            total: { type: integer }

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

## Verificação

```bash
# Validar OpenAPI
npm install -g swagger-cli
swagger-cli validate swagger.yaml

# Gerar cliente TypeScript
npm install -D @openapi-generator/cli
openapi-generator-cli generate -i swagger.yaml -g typescript-axios -o src/generated
```

## Integração com Express

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const specs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'API', version: '1.0.0' },
  },
  apis: ['./src/routes/**/*.ts'],
});

app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(specs));
```
