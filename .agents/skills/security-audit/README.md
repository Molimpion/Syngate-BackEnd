# security-audit

Skill de **auditoria de segurança** para projetos **Node.js, Express e TypeScript** (com ecossistema Auth.js, Prisma e Redis). Focada em identificar vulnerabilidades proativas, exposição de segredos e falhas de autenticação.

O agente realiza um scan baseado nas versões das dependências instaladas no `package.json` e `lockfile` do projeto, garantindo uma auditoria contextualizada.

---

## Como Testar e Usar a Skill

No chat do Cursor (ou na sua ferramenta de agentes de preferência), utilize um dos comandos abaixo:

> `/security-audit`

Ou, em linguagem natural:
> *"Roda a skill security-audit neste repositório. Relatório em português."*
> *"Audita a segurança das rotas de autenticação usando a skill security-audit."*

O agente fará um scan profundo, filtrando falsos positivos e sugerindo patches apenas para vulnerabilidades críticas ou de alta severidade.

---

## 📄 O que você recebe (Formato do Relatório)

Quando acionado, o agente gera um relatório estruturado:

### 1. Resumo Executivo
Tabela rápida de riscos:
```text
┌────────────────────────────────────────────────┐
│           RESUMO DE ACHADOS                    │
├──────────────┬─────────────────────────────────┤
│ 🔴 CRITICAL  │  <n>                            │
│ 🟠 HIGH      │  <n>                            │
│ 🟡 MEDIUM    │  <n>                            │
│ 🔵 LOW       │  <n>                            │
│ ⚪ INFO      │  <n>                            │
└──────────────┴─────────────────────────────────┘

```

### 2. Detalhamento por Categoria

Cada vulnerabilidade identificada detalha:

* **Severidade e Categoria** (ex: IDOR, XSS, Secret Exposure).
* **Localização:** Arquivo e linha exata.
* **Risco:** Explicação de como um atacante poderia abusar da falha.
* **Correção:** Sugestão prática de implementação segura.

### 3. Propostas de Patch (CRITICAL/HIGH)

Propostas de código (Before/After) para correções rápidas, respeitando o padrão do seu projeto.

### 4. Transparência de Falsos Positivos

Lista de arquivos/padrões analisados que foram descartados (ex: `next.config` sem CSP genérico), garantindo que você não perca tempo com "ruído" na sua auditoria.

---

## 📁 Estrutura desta Skill

```text
.agents/skills/security-audit/
├── README.md                 ← Este arquivo de documentação
├── SKILL.md                  ← Regras e diretrizes do agente
└── refs/                     ← Base de conhecimento (checklist, secrets, etc.)

```