# Falsos Positivos — Não Reportar

Carregar no **Step 3 (Verificação)**. Antes de reportar um erro, certifique-se de que não recai nestas exceções.

| Padrão | Por que NÃO é uma falha arquitetural |
|---|---|
| Middleware de Autenticação a usar o `prisma` ou `redis` | Correto. É o local adequado para injetar o utilizador na requisição (`req.user`) e verificar tokens no cache. |
| Services extremamente curtos (1 ou 2 linhas) | Correto. Muitas vezes um Service é apenas um wrapper/pass-through para o Prisma em rotas CRUD muito simples. Não exija lógica extra onde não é necessário. |
| Utilitários soltos (ex: `hash.ts`, `events.ts`) importados diretamente | Correto. Funções puras ou instâncias Singleton (EventEmitter) não precisam de injecão de dependência rígida num projeto Express padrão. |
| Schemas (Zod) invocados em Middlewares e não no Controller | Correto. A validação na borda da rota (Middleware) mantém o Controller limpo. Não sugerir mover o Zod para o Controller. |

*Se o padrão suspeito for um falso positivo, omita-o do relatório ou coloque-o apenas na secção de Falsos Positivos Descartados.*