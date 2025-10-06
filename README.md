# Todo API (Node.js + TypeScript + Prisma + PostgreSQL)

API REST simples para gerenciar usuários e tarefas.

## Requisitos
- Node.js 20+
- PostgreSQL (local ou serviço gerenciado)

## Setup
1. Instale dependências:
   - `npm install`
2. Configure a conexão com banco:
   - Edite `.env` e defina `DATABASE_URL` para seu Postgres (ex: `postgresql://user:pass@localhost:5432/todo`)
   - Opcional: usar Docker Compose com Postgres: `npm run docker:up` (sobe `db` e a aplicação)
3. Ajuste o schema e gere o cliente:
   - `npm run prisma:generate`
4. Rode migrações:
   - `npm run prisma:migrate`
   - Alternativa (sem histórico de migrações, útil em contêiner): `npm run prisma:push`

## Executar
- Dev: `npm run dev` (porta padrão `3000`)
- Produção: `npm run build && npm start`

## Testes
- Executar: `npm test`
- Cobertura: `npx jest --coverage`

## Rotas
- `POST /users` criar usuário `{ name, email }`
- `GET /users` listar usuários
- `GET /users/:id` buscar usuário
- `PUT /users/:id` atualizar usuário `{ name?, email? }`
- `DELETE /users/:id` deletar usuário
- `POST /tasks` criar tarefa `{ title, description, userId, status? }`
- `GET /tasks` listar tarefas com dados do usuário
- `GET /tasks/:id` buscar tarefa com dados do usuário
- `PUT /tasks/:id` atualizar tarefa `{ title?, description?, status? }`
- `DELETE /tasks/:id` deletar tarefa

## Observações
- Validações com Zod
- Tratamento de erros simples
- Estrutura em `src/` com rotas, controllers e middlewares
 - Prisma Client gerado em `generated/prisma`

## Docker
- Subir tudo: `npm run docker:up`
- Derrubar: `npm run docker:down`
- Logs do app: `npm run docker:logs`