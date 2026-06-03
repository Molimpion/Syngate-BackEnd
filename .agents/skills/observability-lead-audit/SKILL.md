---
name: observability-lead-audit
description: 'Auditoria de Logging, Tratamento de Erros e Observabilidade para Node.js (Winston/Pino, Sentry). Detecta promises não-tratadas, erros engolidos, logs sensíveis e falta de rastreamento de contexto. Use em "auditar observabilidade", "logging audit", ou "/observability-lead-audit".'
---

# Observability Lead Audit (Node.js / Logging / Error Handling)

Scanner orientado a **Observability Engineer / DevOps Lead**: focado em logging estruturado, tratamento de erros e rastreamento.

**Idioma do relatório:** português.

## Princípios da Auditoria

1. **Erro = Informação:** Cada erro deve ter contexto suficiente para debug sem reproduzir.
2. **Logs Estruturados:** JSON com campos padronizados (timestamp, level, service, trace_id).
3. **Sem Vazamento Sensível:** Senhas, tokens, PII nunca em logs.
4. **Rastreabilidade Completa:** Correlate requests através de trace_id / request_id.

## Fluxo de execução (ordem fixa)

### Step 1 — Escopo e Configuração
1. Identificar logger: Winston, Pino, Bunyan, etc.
2. Carregar `refs/logging-config.md`.
3. Procurar:
   - Arquivo de configuração do logger
   - Variável de ambiente para LOG_LEVEL
   - Integração com Sentry, Datadog, etc.

### Step 2 — Promises Não-Tratadas
1. Carregar `refs/unhandled-promises.md`.
2. Procurar:
   - `async` sem `await` ou `.catch()`
   - Promises em array/loop sem `Promise.all()`
   - `.then()` sem `.catch()`
   - Sem global error handler

### Step 3 — Erros Engolidos
1. Carregar `refs/swallowed-errors.md`.
2. Procurar:
   ```
   catch { } // sem log
   try { await fetch(...) } catch (e) { return null }  // silencioso
   ```

### Step 4 — Estrutura de Logs
1. Carregar `refs/log-structure.md`.
2. Validar:
   - Logs têm level (debug, info, warn, error)
   - Logs têm timestamp
   - Logs têm contexto (userId, requestId, etc.)
   - Logs em JSON (não string concatenada)

### Step 5 — Dados Sensíveis
1. Carregar `refs/sensitive-data.md`.
2. Procurar:
   - Senhas, tokens, API keys em logs
   - PII (email, CPF, documento)
   - Detalhes de payment (últimos 4 dígitos OK, full PAN não)
   - Enviar para Sentry, ELK sem sanitizar

### Step 6 — Rastreamento de Contexto
1. Carregar `refs/context-tracing.md`.
2. Validar:
   - `request_id` / `trace_id` em cada request
   - Propagação de contexto em async operations
   - Correlação em logs (mesmo ID em múltiplas operações)

### Step 7 — Tratamento de Erro em Críticos
1. Carregar `refs/critical-error-paths.md`.
2. Procurar:
   - Pagamentos: erro capturable? Retry logic?
   - Auth: erro loggado? Auditado?
   - DB: connection error tratado? Retry?

### Step 8 — Anti-falso-positivo
1. Carregar `refs/false-positives.md`.
2. Descartar recomendações que não cabem no contexto.

### Step 9 — Relatório
1. Gerar output de acordo com `refs/report.md`.

## Guia de Severidade

| Nível    | Significado                                           |
|----------|------------------------------------------------------|
| CRITICAL | Erro não-logado em operação crítica, token em log    |
| HIGH     | Promise não-tratada, erro engolido, sem trace_id    |
| MEDIUM   | Log sem estrutura, falta de context em async        |
| LOW      | Melhor message de erro, adicionar métrica           |
| INFO     | Sugestão de observabilidade (dashboard, alerta)     |

## Referências

| Arquivo                      | Uso                               |
|------------------------------|----------------------------------|
| `refs/logging-config.md`     | Step 1 — configuração             |
| `refs/unhandled-promises.md` | Step 2 — promises                 |
| `refs/swallowed-errors.md`   | Step 3 — erros engolidos          |
| `refs/log-structure.md`      | Step 4 — estrutura de logs        |
| `refs/sensitive-data.md`     | Step 5 — dados sensíveis          |
| `refs/context-tracing.md`    | Step 6 — rastreamento            |
| `refs/critical-error-paths.md` | Step 7 — caminhos críticos      |
| `refs/false-positives.md`    | Step 8 — falsos positivos         |
| `refs/report.md`             | Step 9 — formato de saída         |

## Atalhos grep (pistas)

```
try { } catch
Promise
async
.catch
.then
logger.log
console.log
console.error
throw
Error
```

Confirmar contexto antes de reportar.
