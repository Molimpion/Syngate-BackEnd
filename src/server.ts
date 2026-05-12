import 'dotenv/config';
import { app } from './app';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

console.log('[Debug] Iniciando script de ignição...');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[Erro] DATABASE_URL não encontrada no arquivo .env');
  process.exit(1);
}

console.log('[Debug] Criando Pool do PostgreSQL...');
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

console.log('[Debug] Inicializando Prisma Client...');
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 3333;

async function bootstrap() {
  try {
    console.log('[Debug] Tentando conectar ao Banco de Dados...');
    await prisma.$connect();
    console.log('Successfully connected to Database via Prisma Adapter');

    app.listen(PORT, () => {
      console.log(`Syngate Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Erro Fatal] Falha ao iniciar o servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();