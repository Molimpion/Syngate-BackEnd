# Project Structure Reference

## Padrão Esperado

```
src/
├── modules/
│   ├── users/
│   │   ├── users.service.ts
│   │   ├── users.service.spec.ts
│   │   ├── users.controller.ts
│   │   ├── users.controller.spec.ts
│   │   └── users.repository.ts
│   └── orders/
│       ├── orders.service.ts
│       └── orders.service.spec.ts
├── common/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── auth.guard.spec.ts
│   └── utils/
│       ├── validators.ts
│       └── validators.spec.ts
└── __tests__/
    ├── integration/
    │   └── orders.integration.spec.ts
    └── fixtures/
        └── seed.ts
```

## Convenção de Nomenclatura

- `*.service.ts` → `*.service.spec.ts`
- `*.controller.ts` → `*.controller.spec.ts`
- `*.guard.ts` → `*.guard.spec.ts`
- Integração: `__tests__/integration/*.spec.ts`

## Tipo de Teste por Arquivo

| Arquivo | Tipo Principal | Setup |
|---------|---|------|
| `.service.ts` | Unit + Integração | Mock repos ou BD real |
| `.controller.ts` | Unit | Mock service |
| `.guard.ts` | Unit | Mock context/request |
| `.repository.ts` | Integração | BD real |
| `.middleware.ts` | Unit | Mock req/res |

## Cobertura Mínima por Módulo

- Services: 80%+
- Controllers: 70%+
- Guards: 80%+
- Utils: 85%+
