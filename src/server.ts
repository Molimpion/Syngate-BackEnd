import 'dotenv/config';
import { app } from './app';
import { prisma } from './lib/prisma';

console.log('[Debug] Iniciando script de ignição...');

const PORT = process.env.PORT || 3333;

async function bootstrap() {
  try {
    console.log('[Debug] Tentando conectar ao Banco de Dados...');
    
    await prisma.$connect();
    console.log('Successfully connected to Database via Prisma');

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