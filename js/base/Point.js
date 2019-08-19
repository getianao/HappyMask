//点类
export default class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  setPoint(x, y) {
    this.x = x;
    this.y = y;
  }
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
}