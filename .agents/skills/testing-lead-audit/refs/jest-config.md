# Jest Configuration Reference

## Checklist Básico

- [ ] `testEnvironment` configurado corretamente (`node`, `jsdom`)
- [ ] `collectCoverageFrom` exclui `node_modules`, `dist`, `coverage`
- [ ] `coverageThreshold` definido (mínimo 70% para novo código)
- [ ] `testTimeout` adequado para testes de integração (padrão 5s)
- [ ] `setupFiles` ou `setupFilesAfterEnv` para mock global
- [ ] `moduleNameMapper` para aliases (`@/` → `src/`)

## Configuração Recomendada

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

## Verificação

```bash
npm test -- --showConfig
npm test -- --coverage
```
