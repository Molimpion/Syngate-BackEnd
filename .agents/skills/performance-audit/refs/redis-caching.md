# Gestão de Memória (Redis)

1. **Chaves Eternas / Sem TTL (🔴 CRÍTICO):**
   - **Sintoma:** Chamadas `redis.set(key, value)` sem o argumento `EX` ou `PX`.
   - **Problema:** Lota a memória RAM e causa Out-Of-Memory (OOM). Todo cache precisa expirar.
   
2. **Race Conditions no Cache (🟠 HIGH):**
   - **Sintoma:** Buscar um dado no Redis, alterá-lo no Node e salvar de volta sem usar transações (`multi/exec`) ou scripts Lua.