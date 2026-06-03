---
name: testing-lead-audit
description: 'Auditoria de Cobertura e Estratégia de Testes para Node.js (Jest, Vitest). Detecta gaps de cobertura, testes frágeis, falta de integração e testes de contrato. Anti-falso-positivo. Use em "auditar testes", "testing audit", ou "/testing-lead-audit".'
---

# Testing Lead Audit (Node.js / Jest / Vitest)

Scanner orientado a **QA Lead / Testing Architect**: focado em cobertura, qualidade de testes e estratégia de testes (unitários, integração, contrato).

**Idioma do relatório:** português.

## Princípios da Auditoria

1. **Cobertura Real > Métrica Vazia:** Testes que verificam comportamento real, não só linhas cobertas.
2. **Pirâmide de Testes:** Unitários (rápido, isolado) > Integração (com BD, serviços) > E2E/Contrato.
3. **Testes Frágeis = Dívida Técnica:** Mocks excessivos, snapshots desatualizados, testes que falham sem razão.
4. **Refatorização Segura:** Sugerir patches que aumentam cobertura mantendo a lógica.

## Fluxo de execução (ordem fixa)

### Step 1 — Escopo e Configuração
1. Identificar o test framework: Jest, Vitest ou outro.
2. Carregar `refs/jest-config.md` para entender a configuração.
3. Executar coverage report:
   ```bash
   npm test -- --coverage
   ```
4. Carregar `refs/project-structure.md` para entender padrão de testes.

### Step 2 — Análise de Cobertura
1. Carregar `refs/coverage-analysis.md`.
2. Identificar arquivos com cobertura < 70%.
3. Priorizar Services, Utils e Controllers.
4. **Ignorar:** node_modules, dist, coverage, .next, arquivos de configuração pura.

### Step 3 — Testes Frágeis
1. Carregar `refs/fragile-tests.md`.
2. Procurar:
   - Snapshots desatualizados (revisar manualmente)
   - Mocks de dependências externas sem fallback
   - Testes com `jest.useFakeTimers()` sem restauração
   - Testes que usam `any` sem validação de tipo

### Step 4 — Pirâmide de Testes
1. Carregar `refs/test-pyramid.md`.
2. Validar balanceamento:
   - Unitários: ~70% dos testes
   - Integração: ~20% dos testes
   - E2E/Contrato: ~10% dos testes
3. Alertar se falta integração ou contrato.

### Step 5 — Testes de Banco de Dados
1. Carregar `refs/database-testing.md`.
2. Procurar em `*.test.ts` / `*.spec.ts`:
   - Testes com BD real ou testContainer
   - Seed de dados de teste
   - Limpeza de dados após teste (teardown)
   - Testes de migrations

### Step 6 — Testes de API e Contrato
1. Carregar `refs/api-contract-testing.md`.
2. Validar:
   - Testes com `supertest` ou equivalente
   - Schemas de request/response validados
   - Testes de autenticação/autorização
   - Testes de status HTTP corretos

### Step 7 — Anti-falso-positivo
1. Carregar `refs/false-positives.md`.
2. Descartar testes em `__mocks__`, stubs, helpers.

### Step 8 — Relatório
1. Gerar output de acordo com `refs/report.md`.
2. Incluir **Coverage Summary** (arquivo, linhas, funções).
3. Propostas de testes para funções críticas sem cobertura.

## Guia de Severidade

| Nível    | Significado                                                |
|----------|-----------------------------------------------------------|
| CRITICAL | Lógica crítica sem testes (pagamentos, auth, dados sensíveis) |
| HIGH     | Cobertura < 50%, testes de integração ausentes            |
| MEDIUM   | Cobertura 50-70%, snapshots desatualizados                |
| LOW      | Melhoria de qualidade (renomear testes, adicionar docstring) |
| INFO     | Sugestões de padrão (test factories, builders)            |

## Referências

| Arquivo                         | Uso                           |
|---------------------------------|-------------------------------|
| `refs/jest-config.md`           | Step 1 — configuração Jest    |
| `refs/project-structure.md`     | Step 1 — padrão de testes     |
| `refs/coverage-analysis.md`     | Step 2 — análise de cobertura |
| `refs/fragile-tests.md`         | Step 3 — testes frágeis       |
| `refs/test-pyramid.md`          | Step 4 — pirâmide de testes   |
| `refs/database-testing.md`      | Step 5 — testes de BD         |
| `refs/api-contract-testing.md`  | Step 6 — testes de API        |
| `refs/false-positives.md`       | Step 7 — falsos positivos     |
| `refs/report.md`                | Step 8 — formato de saída     |

## Atalhos grep (pistas)

```
describe(
it(
expect(
jest.mock(
jest.spyOn(
.toBe(
.toEqual(
snapshot
```

Confirmar contexto antes de reportar.
