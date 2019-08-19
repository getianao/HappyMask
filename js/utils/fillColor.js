import Stack from "../base/Stack.js"
import Point from "../base/Point.js"

//像素数组填充类
export default class FillColor {
  /**
   * @param pixels   像素数组
   * @param w        宽度
   * @param h        高度
   * @param pixel    当前点的颜色
   * @param newColor 填充色
   * @param i        点的横坐标
   * @param j        点的纵坐标
   * 
   */
  fillColor(pixels, w, h, pixel, newColor, i, j) {
    this.hasBorderColor = false;
    //步骤1：将种子点(x, y)入栈；
    this.mStacks = new Stack();
    this.mStacks.push(new Point(i, j));
    //步骤2：判断栈是否为空，如果栈为空则结束算法，否则取出栈顶元素作为当前扫描线的种子点(x, y)， y是当前的扫描线； 
    while (!this.mStacks.isEmpty()) {
      //步骤3：从种子点(x, y)出发，沿当前扫描线向左、右两个方向填充， 直到边界。分别标记区段的左、右端点坐标为xLeft和xRight；
      let seed = this.mStacks.pop();
      let count1 = this.fillLineLeft(pixels, pixel, w, h, newColor, seed.x, seed.y);
      let left = seed.x - count1 + 1; //左边边界（加1是因为包含自己）
      let count2 = this.fillLineRight(pixels, pixel, w, h, newColor, seed.x + 1, seed.y);
      let right = seed.x + count2; //右边边界
      if (seed.x == undefined)
      console.log("种子点:（" + seed.x + "," + seed.y + ")" + " 填涂区间" + "(" + left + "," + right + ")");
      //步骤4：分别检查与当前扫描线相邻的y - 1和y + 1两条扫描线在区间[xLeft, xRight]中的像素，
      //从xRight开始向xLeft方向搜索，假设扫描的区间为AAABAAC（A为种子点颜色），那么将B和C前面的A作为种子点压入栈中，然后返回第（2）步；
      //从y-1找种子
      if (seed.y - 1 >= 0)
        this.findSeedInNewLine(pixels, pixel, w, h, seed.y - 1, left, right);
      //从y+1找种子
      if (seed.y + 1 < h)
        this.findSeedInNewLine(pixels, pixel, w, h, seed.y + 1, left, right);
    }

  }

  // 往右填色，返回填充的个数
  fillLineRight(pixels, pixel, w, h, newColor, x, y) {
    let count = 0;
    while (x < w) { //在canva内部
      //拿到索引
      let index = (y * w + x) * 4;
      if (this.needFillPixel(pixels, pixel, index)) {
        //边界内部，涂色
    
        pixels[index] = newColor.getA();
        pixels[index + 1] = newColor.getB();
        pixels[index + 2] = newColor.getC();
        pixels[index + 3] = newColor.getD();
        count++;
        x++;
      } else {
        break;
      }
    }
    return count;
  }

  // 往左填色，返回填色的数量值
  fillLineLeft(pixels, pixel, w, h, newColor, x, y) {
    let count = 0;
    while (x >= 0) {
      //计算出索引
      let index = (y * w + x) * 4;
      if (this.needFillPixel(pixels, pixel, index)) {
        pixels[index] = newColor.getA();
        pixels[index + 1] = newColor.getB();
        pixels[index + 2] = newColor.getC();
        pixels[index + 3] = newColor.getD();
        count++;
        x--;
      } else {
        break;
      }
    }
    return count;
  }

  //判断该像素点是否需要涂色
  needFillPixel(pixels, pixel, index) {
    if (this.hasBorderColor) {
      if (pixels[index] == mBorderColor)
        return pixels[index] != mBorderColor;
    } else {
      if (Math.abs(pixels[index] - pixel.getA()) < 20 &&
        Math.abs(pixels[index + 1] - pixel.getB()) < 20 &&
        Math.abs(pixels[index + 2] - pixel.getC()) < 50)
        return true;
      else {
        return false;
      }
    }
  }

  /**
   * @param pixels   像素数组
   * @param pixel    点的颜色
   * @param w        宽度
   * @param h        高度
   * @param i        所在行数
   * @param left     左侧边界
   * @param right    右侧边界
   * 
   * @desc 在新行找种子节点
   */
  findSeedInNewLine(pixels, pixel, w, h, i, left, right) {

    // 获得该行的开始索引
    let begin = i * w + left;

    // 获得该行的结束索引
    let end = i * w + right;
    let hasSeed = false; //是否存在种子
    let rx = -1,
      ry = -1;
    ry = i;
    // 从end到begin，找到种子节点入栈（AAABAAAB，则B前的A为种子节点）
    while (end >= begin) {
      if (this.needFillPixel(pixels, pixel, end * 4)) {
        if (!hasSeed) {
          rx = end % w;
          this.mStacks.push(new Point(rx, ry));
          hasSeed = true;
        }
      } else {
        hasSeed = false;
      }
      end--;
    }
  }

}