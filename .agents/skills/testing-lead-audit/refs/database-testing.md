# Database Testing Reference

## Estratégias

### 1. Test Database (Recomendado)
```bash
DATABASE_URL="postgresql://user:pass@localhost/test_db" npm test
```

- Separe BD de teste da produção
- Use migrations no setup
- Limpe dados após cada teste

### 2. Test Containers (Melhor)
```typescript
import { startPostgres } from 'testcontainers';

beforeAll(async () => {
  container = await startPostgres();
  process.env.DATABASE_URL = container.getConnectionString();
});

afterAll(async () => {
  await container.stop();
});
```

### 3. In-Memory (SQLite, rápido mas limitado)
```typescript
// Funciona para testes unitários rápidos
// Não valida comportamento real do PostgreSQL/MySQL
```

## Checklist

- [ ] `beforeEach` limpa dados de teste
- [ ] `afterEach` restaura estado
- [ ] Migrations rodadas antes dos testes
- [ ] Seeds de dados consistentes
- [ ] Testes isolados (não dependem um do outro)

## Exemplo Completo

```typescript
describe('UserRepository', () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = new PrismaClient();
    await db.$executeRawUnsafe('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await execSync('npx prisma migrate deploy');
  });

  beforeEach(async () => {
    await db.user.deleteMany({});
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('should create user', async () => {
    const user = await db.user.create({ data: { email: 'test@test.com' } });
    expect(user.email).toBe('test@test.com');
  });
});
```

## Red Flags

- Testes que modificam fixtures globais
- Sem transações ou rollback
- Hard-coded IDs que conflitam entre testes
- Testes com sleep/delay artificial
