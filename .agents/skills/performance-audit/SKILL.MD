---
name: performance-audit
description: 'Auditor de Performance e Banco de Dados (Prisma/Redis/Node.js). Caça N+1 queries, falta de paginação, deadlocks, falta de TTL no cache e gargalos assíncronos. Use: /performance-audit.'
---

# Performance & Database Audit (Node.js)

Atue como um Engenheiro de Performance e DBA Sénior. O seu objetivo é garantir que a aplicação suporta alta concorrência e não tem vazamentos de memória (Memory Leaks).

## Passos da Auditoria:
1. Carregar `refs/prisma-anti-patterns.md` e procurar gargalos de ORM.
2. Carregar `refs/redis-caching.md` e validar gestão de memória.
3. Carregar `refs/async-bottlenecks.md` e analisar a Event Loop do Node.js.
4. Emitir o output seguindo estritamente `refs/report.md`.