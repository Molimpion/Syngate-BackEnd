---
name: architecture-audit
description: 'Auditoria de Clean Architecture e SOLID para Node.js (Express, Prisma, TypeScript). Deteta quebra de camadas, Fat Controllers e abstrações com fugas (leaky abstractions). Use em "auditar arquitetura", "code review", ou "/architecture-audit".'
---

# Architecture Audit (Node.js / Express / TypeScript)

Scanner orientado a **Arquiteto de Software Sénior**: focado em coesão, acoplamento e separação estrita de responsabilidades (Separation of Concerns).

**Idioma do relatório:** português.

## Princípios da Auditoria

1. **Separação de Camadas:** HTTP (Express) não se mistura com Regras de Negócio, que não se misturam com Infraestrutura (Prisma/Redis).
2. **Inversão de Dependência:** Services não devem conhecer detalhes da Web (`req`, `res`, `headers`).
3. **Refatorização Segura:** Sugerir patches que mantêm o comportamento exato, mas corrigem a estrutura.

## Fluxo de execução (ordem fixa)

### Step 1 — Escopo e Estrutura
1. Identificar a estrutura de pastas do projeto (Modular, Hexagonal ou MVC).
2. Carregar `refs/project-structure.md` para entender as regras da framework atual.

### Step 2 — Verificação de Acoplamento (Anti-patterns)
1. Carregar `refs/anti-patterns.md`.
2. Procurar importações do `express` em `*.service.ts`.
3. Procurar importações do `@prisma/client` ou `lib/prisma` em `*.controller.ts` ou `*.routes.ts`.
4. Avaliar middlewares para garantir que têm responsabilidade única.

### Step 3 — Verificação de Falsos Positivos
1. Carregar `refs/false-positives.md`.
2. Antes de reportar um erro, valide se não é uma exceção arquitetural permitida (ex: Auth Middleware a aceder ao Prisma).

### Step 4 — Relatório e Patches
1. Gerar o output estritamente de acordo com `refs/report.md`.
2. Incluir propostas de código (Before/After) para cada infração média ou grave.

## Referências Carregadas
- `refs/project-structure.md` (Regras de camadas)
- `refs/anti-patterns.md` (O que penalizar)
- `refs/false-positives.md` (O que ignorar)
- `refs/report.md` (Formato de saída)