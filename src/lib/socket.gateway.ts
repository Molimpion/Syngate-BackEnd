import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { systemEvents } from '../shared/utils/events';

export class SocketGateway {
  private io: SocketIOServer;

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST'],
      },
    });

    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', (socket) => {
      console.log(`[Socket.io] Cliente conectado: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
      });
    });

    systemEvents.on('access:new', (log) => {
      this.io.emit('access:new', log);
    });
  }
}