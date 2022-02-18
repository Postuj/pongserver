import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { Board } from './models/board.model';

@Injectable()
export class EventsService {
  board?: Board;
  server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  handleBoardEvent(event: GameEvent): ServerResponse | void {
    if (event.type == 'create') return this.createBoard(event);
    else if (event.type == 'changeRunningState')
      return this.changeBoardRunningState();
    else if (event.type == 'quit') return this.quitGame();
    else return { ...event, success: false };
  }

  handlePlayerEvent(event: GameEvent): ServerResponse | void {
    if (event.type == 'join') return this.onPlayerJoinEvent(event);
    else if (event.type == 'move') return this.onPlayerMoveEvent(event);
    else if (event.type == 'changeRunningState')
      return this.changeBoardRunningState();
    else return { ...event, success: false };
  }

  createBoard(event: GameEvent): ServerResponse {
    Logger.log('Creating new board');
    const board = new Board(
      event.content.width,
      event.content.height,
      this.updateBoard,
    );
    this.board = board;
    // Logger.log(board.toResponse());
    return {
      type: 'create',
      name: 'board',
      success: true,
      content: {
        board: board.toResponse(),
      },
    };
  }

  changeBoardRunningState(): void {
    if (!this.board) return;
    this.board.changeRunningState();
  }

  quitGame() {
    if (this.board) this.board.endGame();
  }

  updateBoard = (): void => {
    this.server.emit('boardEvent', {
      data: {
        type: 'update',
        name: 'board',
        success: true,
        content: {
          board: this.board.toResponse(),
        },
      },
    });
  };

  onPlayerJoinEvent(event: GameEvent): ServerPlayerResponse {
    Logger.log('join event');
    if (!this.board) {
      Logger.log('no board');
      return {
        type: 'join',
        name: 'player',
        success: false,
        code: null,
        content: {
          success: false,
        },
      };
    }
    const newPlayer = this.board.addPlayer(event.content.code);
    this.updateBoard();
    return {
      type: 'join',
      name: 'player',
      success: true,
      code: newPlayer.code,
      content: {
        player: newPlayer.toResponse(),
      },
    };
  }

  onPlayerMoveEvent(event: PlayerGameEvent): void {
    if (!this.board) return;
    this.board.movePlayer(event.playerCode, event.content.up);
    if (!this.board.isRunning) this.updateBoard();
  }
}

export type GameEvent = {
  type: String;
  name: String;
  content?: any;
  data?: GameEvent;
};

export type PlayerGameEvent = {
  type: String;
  name: String;
  content?: any;
  data?: GameEvent;
  playerCode?: String;
};

export type ServerResponse = {
  type: String;
  name: String;
  success: boolean;
  content?: any;
};

export type ServerPlayerResponse = {
  type: String;
  name: String;
  success: boolean;
  code?: String;
  content?: any;
};
