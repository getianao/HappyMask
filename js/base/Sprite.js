import DataStore from "./DataStore";
// 精灵基类

export default class Sprite {

  constructor(img, x = 0, y = 0, width = 0, height = 0) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  //从预加载数据中读取资源
  static getImage(key) {
    return DataStore.getInstance().res.get(key);
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
}