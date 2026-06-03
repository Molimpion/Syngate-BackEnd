# Concorrência e Event Loop (Node.js)

1. **Cachoeira de Awaits (🟠 HIGH):**
   - **Sintoma:** Múltiplos `await` seguidos que não dependem um do outro (ex: buscar total de usuários, depois buscar configurações).
   - **Correção:** Agrupar num `await Promise.all([ ... ])` para paralelizar a busca.