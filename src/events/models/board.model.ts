import { Logger } from '@nestjs/common';
import { Ball } from './ball.model';
import { Player } from './player.model';

export class Board {
  private VELOCITY = 20;
  private MAX_BALL_VELOCITY = 15;
  private BALL_RADIUS = 30;
  private MAX_PLAYER_SCORE = 5;

  updateCallback: Function;
  width: number;
  height: number;
  isRunning: boolean;
  requiredPlayers: number;
  players: Array<Player>;
  started: boolean;
  ball?: Ball;
  gameLoop: NodeJS.Timer;

  constructor(width: number, height: number, updateCallback: Function) {
    this.isRunning = false;
    this.width = width;
    this.height = height;
    this.requiredPlayers = 2;
    this.players = [];
    this.started = false;
    this.updateCallback = updateCallback;
  }

  get getNewPlayerId(): number {
    return this.players.length > 0
      ? Math.max(...this.players.map((p) => p.id))
      : 0;
  }

  startGame(): void {
    if (this.players.length != this.requiredPlayers) return;
    Logger.log('Starting!');
    this.resetPlayerPositions();
    this.ball = new Ball(
      Math.floor(this.width / 2),
      Math.floor(this.height / 2),
      this.BALL_RADIUS,
      this.MAX_BALL_VELOCITY,
    );
    // Logger.log('Ball init')
    // Logger.log(this.ball.position);
    // Logger.log(Math.floor(this.width / 2));
    this.isRunning = true;
    this.started = true;
    this.gameLoop = setInterval(this.updateGame, 20);
  }

  updateGame = () => {
    if (!this.isRunning) return;
    if (this.ball) {
      // Logger.log('ball');
      // Logger.log(this.ball.toResponse())
      this.ball.move();
      this.handleCollision();
    }
    this.updateCallback();
  };

  resetGame() {
    this.resetPlayerScores();
    this.resetPlayerPositions();
    this.started = false;
    this.isRunning = false;
  }

  endGame() {
    clearInterval(this.gameLoop);
    this.resetGame();
    this.updateCallback();
  }

  handleCollision() {
    // CEILING AND FLOOR
    if (
      this.ball.y + this.ball.radius >= this.height ||
      this.ball.y - this.ball.radius <= 0
    )
      this.ball.yVel *= -1;

    // SIDES
    if (this.ball.x < 0) {
      this.players[1].addPoint();
      this.resetBallPosition();
      if (this.players[1].score == this.MAX_PLAYER_SCORE) this.endGame();
    } else if (this.ball.x > this.width) {
      this.players[0].addPoint();
      this.resetBallPosition();
      if (this.players[0].score == this.MAX_PLAYER_SCORE) this.endGame();
    }

    // PLAYERS
    if (this.players.length != 2) return;
    if (this.ball.xVel < 0) {
      if (
        this.ball.y >= this.players[0].y &&
        this.ball.y <= this.players[0].y + this.players[0].height
      )
        if (
          this.ball.x - this.ball.radius <=
          this.players[0].x + this.players[0].width
        ) {
          this.ball.xVel *= -1;
          let diffY = this.players[0].middleYPosition - this.ball.y;
          let reductionFactor =
            this.players[0].halfHeight / this.MAX_BALL_VELOCITY;
          this.ball.yVel = Math.floor(diffY / reductionFactor) * -1;
        }
    } else if (
      this.ball.y >= this.players[1].y &&
      this.ball.y <= this.players[1].y + this.players[1].height
    )
      if (this.ball.x + this.ball.radius >= this.players[1].x) {
        this.ball.xVel *= -1;
        let diffY = this.players[1].middleYPosition - this.ball.y;
        let reductionFactor =
          this.players[1].halfHeight / this.MAX_BALL_VELOCITY;
        this.ball.yVel = Math.floor(diffY / reductionFactor) * -1;
      }
  }

  changeRunningState() {
    Logger.log(this.isRunning ? 'PAUSED' : 'RESUMED');
    if (!this.started) this.startGame();
    else {
      this.isRunning = !this.isRunning;
      if (!this.isRunning) this.updateCallback();
    }
  }

  addPlayer(code: String): Player {
    const player = new Player(this.getNewPlayerId, code, 0, 0);
    if (this.players.length < this.requiredPlayers) {
      if (this.players.length == 0)
        player.setPosition(
          0,
          Math.floor(this.height) / 2 - Math.floor(player.height / 2),
        );
      else
        player.setPosition(
          this.width - player.width,
          Math.floor(this.height / 2) - Math.floor(player.height / 2),
        );
      this.players.push(player);
    }
    return player;
  }

  resetPlayerPositions(): void {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      if (i == 0)
        player.setPosition(
          0,
          Math.floor(this.height / 2) - Math.floor(player.height / 2),
        );
      else
        player.setPosition(
          this.width - player.width,
          Math.floor(this.height / 2) - Math.floor(player.height / 2),
        );
    }
  }

  resetBallPosition() {
    if (!this.ball) return;
    this.ball.setPosition(
      Math.floor(this.width / 2),
      Math.floor(this.height / 2),
    );
  }

  resetPlayerScores() {
    this.players.forEach((p) => p.resetScore());
  }

  movePlayer(playerCode: String, up: boolean): void {
    if (!this.isRunning && this.started) return;
    const player = this.players.find((p) => p.code == playerCode);
    if (!player) return;
    if (up) {
      if (player.y - this.VELOCITY >= 0) player.y -= this.VELOCITY;
    } else {
      if (player.y + this.VELOCITY + player.height <= this.height)
        player.y += this.VELOCITY;
    }
  }

  toResponse() {
    return {
      width: this.width,
      height: this.height,
      requiredPlayers: this.requiredPlayers,
      players: this.players.map((p) => p.toResponse()),
      isRunning: this.isRunning,
      ball: this.ball ? this.ball.toResponse() : null,
    };
  }
}

export type position = {
  x: number;
  y: number;
};
