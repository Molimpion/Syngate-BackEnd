# Gargalos de ORM (Prisma)

1. **Problema do N+1 (🔴 CRÍTICO):** - **Sintoma:** Uso de `findUnique` ou `update` dentro de loops (`for`, `map`, `forEach`).
   - **Correção:** Sugerir `findMany` com operador `in` ou `updateMany`.

2. **Falta de Paginação (🟠 HIGH):**
   - **Sintoma:** Uso de `findMany()` sem `take` e `skip` em rotas que retornam listas.
   - **Correção:** Exigir parâmetros de paginação explícitos.

3. **Over-fetching (🟡 MEDIUM):**
   - **Sintoma:** Uso de `include` para trazer tabelas relacionadas inteiras quando apenas 1 ou 2 campos são necessários.
   - **Correção:** Trocar `include` por `select`.