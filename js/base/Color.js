//颜色类
export default class Color {
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
  setColor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
  getA() {
    return this.a;
  }
  getB() {
    return this.b;
  }
  getC() {
    return this.c;
  }
  getD() {
    return this.d;
  }

  isSame(compColor) {

    let a1 = compColor.getA();
    if (
      Math.abs(this.a - compColor.getA()) < 20 &&
      Math.abs(this.b - compColor.getB()) < 20 &&
      Math.abs(this.c - compColor.getC()) < 50) {
      return true;
    } else {
      return false;
    }
  }
}