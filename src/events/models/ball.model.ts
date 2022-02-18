import { position } from "./board.model";

export class Ball {
  x: number;
  y: number;
  xVel: number;
  yVel: number;
  maxVel: number;
  radius: number;
  constructor(x: number, y: number, radius: number, maxVelocity: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.xVel = maxVelocity;
    this.yVel = 0;
    this.maxVel = maxVelocity;
  }

  get position(): ballPosition {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
    };
  }

  move() {
    this.x += this.xVel;
    this.y += this.yVel;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toResponse() {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
      xVel: this.xVel,
      yVel: this.yVel,
      maxVel: this.maxVel,
    };
  }
}

export type ballPosition = {
  x: number;
  y: number;
  radius: number;
};
