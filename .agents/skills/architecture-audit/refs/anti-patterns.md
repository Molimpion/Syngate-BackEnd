# Anti-Padrões Arquiteturais

Carregar no **Step 2**. Se encontrar algum destes cenários no código, **deve gerar um alerta no relatório**.

## 1. "Fat Controller" (Controlador Obeso)
**Sintoma:** O método do controller tem mais de 20-30 linhas, processa arrays, faz transformações de dados complexas ou toma decisões de negócio ("se A, então cria B, senão atualiza C").
**Severidade:** 🟠 HIGH
**Correção:** Extrair a lógica condicional para um método no `Service`.

## 2. Leaky Abstraction (Fuga de Abstração)
**Sintoma:** O Service recebe o objeto `req` inteiro como parâmetro: `async createUser(req: Request)`.
**Severidade:** 🔴 CRITICAL
**Porquê:** O Service fica acoplado à Web. Se amanhã o projeto usar GraphQL, gRPC ou um script de terminal, o Service quebra.
**Correção:** Passar apenas DTOs ou parâmetros primitivos para o Service: `async createUser(data: CreateUserDTO)`.

## 3. Acesso Ilegal a Dados (Direct DB Access)
**Sintoma:** `prisma.usuario.findUnique(...)` dentro de um `*.controller.ts`.
**Severidade:** 🔴 CRITICAL
**Correção:** Mover a query do Prisma para o `Service` e fazer o controller chamar o Service.

## 4. Retornos Mágicos / Tratamento de Erros Inconsistente
**Sintoma:** O Controller envia respostas de erro repetitivas em vez de delegar para o `error.middleware.ts` global, ou o Service retorna strings de erro em vez de lançar Exceções (`throw`).
**Severidade:** 🟡 MEDIUM