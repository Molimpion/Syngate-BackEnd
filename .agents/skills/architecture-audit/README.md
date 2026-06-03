# architecture-audit

Skill de **auditoria de arquitetura** para projetos **Node.js, Express e TypeScript** (com foco em Prisma ORM e Arquitetura Modular). Desenhada para garantir a estrita separação de responsabilidades (Rotas, Controllers, Services e Data Access).

Relatórios em **português**. As sugestões de refatoração respeitam o estilo do projeto original e as propostas não alteram o código automaticamente.

---

## Como Testar e Usar a Skill

No chat do Cursor (ou na sua ferramenta de agentes preferida integrada ao repositório), digite um dos comandos abaixo:

> `/architecture-audit`

Ou, em linguagem natural:
> *"Usa a skill architecture-audit para analisar o nosso repositório."*
> *"Audita a arquitetura do módulo de usuários usando a skill architecture-audit."*

O agente fará uma varredura nas pastas `src/modules/` e `src/shared/`, verificando se as regras de negócio vazaram para os Controllers ou se o acesso ao Prisma está no lugar certo.

---

## 📄 O que você recebe (Formato do Relatório)

Quando acionado, o agente gera um relatório padronizado contendo:

### 1. Resumo Executivo
Uma tabela rápida do estado da arquitetura:
```text
┌────────────────────────────────────────────────┐
│           RESUMO DE VIOLAÇÕES                  │
├──────────────┬─────────────────────────────────┤
│ 🔴 CRITICAL  │  <n> (Quebra grave de camadas)  │
│ 🟠 HIGH      │  <n> (Acoplamento forte)        │
│ 🟡 MEDIUM    │  <n> (Más práticas/Clean Code)  │
│ 🔵 LOW       │  <n> (Sugestões de melhoria)    │
└──────────────┴─────────────────────────────────┘

```

*(Se o código estiver perfeito, ele exibirá: "✅ A arquitetura está em perfeita conformidade. As camadas respeitam a Separação de Responsabilidades.")*

### 2. Violações Encontradas (Cards)

Para cada quebra de arquitetura, um card detalhado indicando a linha do erro, o motivo e a solução:

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CRITICAL — Fuga de Abstração (DB no Controller)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Local: src/modules/users/users.controller.ts, linha 15

⚠️ Problema:
O Controller está acessando diretamente o banco através do `prisma`, ignorando o Service.

❌ Incorreto:
const user = await prisma.user.findUnique({ where: { id } });

✅ Sugestão:
Delegue a chamada para `this.usersService.findById(id)`.

```

### 3. Propostas de Refatoração (Patches)

O agente fornecerá blocos de código completos (Before/After) corrigindo os arquivos implicados.

### 4. Falsos Positivos Descartados

Lista de códigos suspeitos que a IA analisou, mas decidiu ignorar por serem exceções válidas (ex: acesso ao Prisma no Middleware de Auth).

---

## Estrutura desta Skill

```text
.agents/skills/architecture-audit/
├── README.md                 ← Este arquivo de documentação para o Dev
├── SKILL.md                  ← O cérebro do agente (instruções e regras)
└── refs/                     ← Base de conhecimento da IA
    ├── project-structure.md  (Regras da Arquitetura Modular)
    ├── anti-patterns.md      (Padrões a serem penalizados)
    ├── false-positives.md    (Exceções a serem ignoradas)
    └── report.md             (Template do formato de saída)
