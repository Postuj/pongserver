import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { EventsService, GameEvent } from './events.service';

@WebSocketGateway()
export class EventsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(private readonly eventsService: EventsService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    Logger.log('Socket initialized');
    this.eventsService.setServer(server);
  }

  handleConnection(client: Socket, ...args: any[]): void {
    Logger.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('boardEvent')
  handleBoardEvent(@MessageBody() event: GameEvent): void {
    // Logger.log('boardEvent');
    const response = this.eventsService.handleBoardEvent(event.data);
    // Logger.log(response);
    if (response) this.server.emit('boardEvent', { data: response });
  }

  @SubscribeMessage('playerEvent')
  handlePlayerEvent(@MessageBody() event: GameEvent): void {
    // Logger.log('playerEvent');
    const response = this.eventsService.handlePlayerEvent(event.data);
    if (response) this.server.emit('playerEvent', { data: response });
  }
}
