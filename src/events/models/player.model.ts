import { position } from './board.model';

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
  code: String;
  score: number;

  constructor(id: number, code: String, x: number, y: number) {
    this.id = id;
    this.code = code;
    this.x = x;
    this.y = y;
    this.width = 15;
    this.height = 120;
    this.score = 0;
  }

  get position(): position {
    return {
      x: this.x,
      y: this.y,
    };
  }

  get halfHeight():number {
    return Math.floor(this.height / 2) 
  }

  get middleYPosition() {
    return this.y + Math.floor(this.height / 2);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  resetScore() {
    this.score = 0;
  }

  toResponse() {
    return {
      id: this.id,
      code: this.code,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      score: this.score,
    };
  }

  addPoint() {
    this.score++;
  }
}
