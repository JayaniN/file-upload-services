import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server;

  private logger: Logger = new Logger(AppGateway.name);

  afterInit() {
    this.logger.log('CLIENT INITIALIZED');
  }

  handleConnection(client: Socket) {
    this.logger.log(`CLIENT CONNECTED : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`CLIENT DISCONNECTED : ${client.id}`);
  }
}
