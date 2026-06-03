# Estrutura do Projeto e Regras de Camadas

Carregar no **Step 1**. O projeto utiliza uma arquitetura baseada em **Módulos por Funcionalidade (Feature Modules)**. A IA deve impor estritamente a organização abaixo.

## 1. Organização de Pastas Obrigatória
- **`src/modules/<nome-do-modulo>/`**: Todo o código de domínio deve viver aqui. Cada módulo (ex: `auth`, `users`, `devices`) deve agrupar exclusivamente os seus próprios ficheiros:
  - `<modulo>.routes.ts`
  - `<modulo>.controller.ts`
  - `<modulo>.service.ts`
- **`src/shared/`**: Recursos globais partilhados entre vários módulos (ex: `middlewares/`, `types/`, `utils/`).
- **Violação (🔴 HIGH):** Criar pastas monolíticas como `src/controllers/` ou colocar código de negócio solto na raiz do `src/`.

## 2. Camada de Roteamento (`*.routes.ts`)
- **Responsabilidade:** Mapear verbos HTTP (GET, POST) para métodos do Controller do seu próprio módulo e aplicar middlewares do `src/shared/middlewares`.
- **Proibido:** Lógica de negócio, validações Zod brutas ou acesso à base de dados.

## 3. Camada de Controladores (`*.controller.ts`)
- **Responsabilidade:** Lidar com a interface Web (HTTP). Extrair dados de `req` e invocar o `*.service.ts` **do seu próprio módulo**.
- **Proibido:** - Fazer queries SQL ou chamar o Prisma diretamente.
  - Chamar Services de outros módulos diretamente (um Controller só fala com o seu próprio Service).

## 4. Camada de Serviços (`*.service.ts`)
- **Responsabilidade:** Coração do domínio. Única camada que orquestra chamadas ao Prisma ORM ou ao Redis. Se um módulo precisar de dados de outro, os Services comunicam entre si.
- **Proibido:** Importar `Request` ou `Response` do Express. O Service não deve saber que está a rodar numa API HTTP.

## 5. Middlewares (`src/shared/middlewares/`)
- **Responsabilidade:** Tarefas transversais (Autenticação, Rate Limit, Validação).
- **Regra:** Devem ser 100% genéricos e reutilizáveis por qualquer módulo em `src/modules/`.