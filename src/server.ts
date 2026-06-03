import 'dotenv/config';
import { createServer } from 'http';
import { app } from './app';
import { prisma } from './lib/prisma';
import { SocketGateway } from './lib/socket.gateway';

console.log('[Debug] Iniciando script de ignição...');

const PORT = process.env.PORT || 3333;

async function bootstrap() {
  try {
    console.log('[Debug] Tentando conectar ao Banco de Dados...');
    
    await prisma.$connect();
    console.log('Successfully connected to Database via Prisma');

    // Cria o servidor HTTP puro passando o app do Express
    const httpServer = createServer(app);

    // Instancia o Socket.io conectando-o ao servidor HTTP
    new SocketGateway(httpServer);

    // Inicia a escuta na porta configurada
    httpServer.listen(PORT, () => {
      console.log(`Syngate Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Erro Fatal] Falha ao iniciar o servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();