import questionList from '../data/questions.js';
import {
  drawText
} from '../utils/index.js';
import Background from '../runtime/background';
import Sprite from '../base/Sprite';
import DataStore from "../base/DataStore";
import Color from "../base/Color.js"
import FillColor from "../utils/fillColor.js"
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;
const scale = 750 / screenWidth; /*横坐标最大值变为750*/

const CIRCLE_R = 50; //半径
const NEXT_WIDTH = 288;
const NEXT_HEIGHT = 88;

// 创建问题canvas, 离屏canvas
export default class freeScene {
  constructor(ctx) { //ctx：传入的离屏上下文
    this.img = "images/1.png";
    this.background = new Background(ctx, scale);
    this.ctx = ctx; //上下文
    this.imgChanged = false;
    this.drawPic(this.ctx);
    this.drawChoice(this.ctx);
    this.drawNext(this.ctx);
    this.addTouch();
  }


  //绘制画板背景和画板
  drawPic(context) {
    let _this = this;
    let bgImg = Sprite.getImage('question_bg');
    this.offset = (750 - bgImg.width) / 2; /**左偏移量 */
    //进度条下方40，居中
    let bgSprite = new Sprite(bgImg, this.offset, 40 + 50, bgImg.width, bgImg.height);
    bgSprite.draw(context);
    this.bg = bgSprite;
    let pic = new Image();
    pic.src = this.img;
    pic.onload = () => {
      if (this.imgChanged == true) {
        return;
      }
      _this.centerImg(context, pic, this.bg.x + 20, this.bg.y + 20, this.bg.width - 40, this.bg.height - 40);
      _this.reDrawCanvas(); //加载好后绘制到主ctx，因为这是个异步操作
    }
  }

  //居中绘制画板
  centerImg(context, pic, x, y, limitW, limitH) {
    this.drawWidth = parseInt(pic.width); //画板宽度
    this.drawHeight = parseInt(pic.height); //画板长度
    this.drawX = parseInt(x);
    this.drawY = parseInt(y);
    if (this.drawWidth / this.drawHeight > 1) {
      // 宽的长方形，按比例缩放
      this.drawHeight = parseInt(limitW * (this.drawHeight / this.drawWidth));
      this.drawWidth = parseInt(limitW);
      this.drawY = parseInt(y + (limitH - this.drawHeight) / 2);
    } else {
      // 窄的长方形或正方形 
      this.drawWidth = parseInt(limitH * (this.drawWidth / this.drawHeight));
      this.drawHeight = parseInt(limitH);
      this.drawX = parseInt(x + (limitW - this.drawWidth) / 2);
    }
    context.drawImage(pic, this.drawX, this.drawY, this.drawWidth, this.drawHeight);
  }


  //绘制所有选项
  drawChoice(context) {
    context.font = '24px Arial';
    for (let i = 0; i < 6; i++) {
      this.drawChoiceItem(this.ctx, i);
    }
  }

  //绘制下一题选项
  drawNext(context) {
    let nextBgImg = Sprite.getImage("select_bg");
    let nextBgX = 750 * 3 / 4 - nextBgImg.width / 2;
    let nextBgY = screenHeight * scale - nextBgImg.height - 20 * scale;
    this.nextBgSprite = new Sprite(nextBgImg, nextBgX, nextBgY, NEXT_WIDTH, NEXT_HEIGHT);
    this.nextBgSprite.draw(this.ctx);
    context.fillStyle = '#654e01';
    context.fillText("返回", nextBgX + 80, nextBgY + 50);

    let saveBgImg = Sprite.getImage("select_bg");
    let saveBgX = 750 * 1 / 4 - saveBgImg.width / 2;
    let saveBgY = screenHeight * scale - saveBgImg.height - 20 * scale;
    this.saveBgSprite = new Sprite(saveBgImg, saveBgX, saveBgY, NEXT_WIDTH, NEXT_HEIGHT);
    this.saveBgSprite.draw(this.ctx);
    context.fillStyle = '#654e01';
    context.fillText("保存至相册", saveBgX + 80, saveBgY + 50);
  }

  //确定选项位置，绘制单个选项
  drawChoiceItem(context, index) {
    //this.ctx.globalCompositeOperation = 'source-over';
    let chart = ['红', '蓝', '紫', '绿', "黄", "白"];
    //判定选项位置
    let x;
    switch (index % 3) {
      case 0:
        {
          x = 750 / 4;
          break;
        }
      case 1:
        {
          x = 750 / 2;
          break;
        }
      case 2:
        {
          x = 750 * 3 / 4;
          break;
        }
    }
    this.firstY = this.bg.y + this.bg.height + 50 * ratio + 90;
    this.secondY = this.firstY + 20 * ratio + 2 * CIRCLE_R;
    let y = index < 3 ? this.firstY : this.secondY;
    this.drawCircle(context, x, y, index, chart[index]);
  }

  //绘制单个选项
  drawCircle(ctx, x, y, index, text) {
    //确定绘制颜色
    switch (index) {
      case 0: //红
        {
          ctx.fillStyle = "#DC143C";
          break;
        }
      case 1: //蓝
        {
          ctx.fillStyle = "#4169E1";
          break;
        }
      case 2: //紫
        {
          ctx.fillStyle = "#FF00FF";
          break;
        }
      case 3: //绿
        {
          ctx.fillStyle = "#32CD32";
          break;
        }
      case 4: //黄
        {
          ctx.fillStyle = "#FFFF00";
          break;
        }
      case 5: //白
        {
          ctx.fillStyle = "#F8F8FF";
          break;
        }
    }
    ctx.beginPath();
    ctx.arc(x, y, CIRCLE_R, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    //绘制选项内文本
    ctx.fillStyle = "#654e01"
    ctx.font = '36px Arial';
    ctx.fillText(text, x - 18, y);
  }

  // 将离屏canvas重新绘制到主屏cxt上，使之生效
  reDrawCanvas() {
    DataStore.getInstance().ctx.drawImage(DataStore.getInstance().freeCanvas, 0, 0, screenWidth, screenHeight);
  }

  //清除主屏canvas和离屏canvas，然后重绘为初始状态，注意：需要调用reDrawCanvas()使之生效
  reNewCanvas() {
    DataStore.getInstance().ctx.clearRect(0, 0, screenWidth * scale, screenHeight * scale);
    this.ctx.clearRect(0, 0, screenWidth * scale, screenHeight * scale);
    this.background = new Background(this.ctx, scale);
    this.drawPic(this.ctx);
    this.drawChoice(this.ctx);
    this.drawNext(this.ctx);
    if (this.imgChanged == true) {
      this.ctx.putImageData(this.imageData, this.dataX, this.dataY);
    }
  }

  //监听触摸事件
  addTouch() {
    let _this = this;
    wx.offTouchStart();
    wx.onTouchStart((e) => {
      //按照750缩放
      let x = parseInt(e.touches[0].clientX * scale);
      let y = parseInt(e.touches[0].clientY * scale);
      console.log("触摸点：(" + x + "," + y + ")");

      //颜色涂色方法
      if (this.selected == true) { //已选择颜色
        if (x >= this.drawX && x <= this.drawX + this.drawWidth &&
          y >= this.drawY && y <= this.drawY + this.drawHeight) {
          //画板范围内
          console.log("画板范围内，画笔颜色：" + this.selectedColor);

          //恢复原始比例截取，暂存画板数据
          this.dataHeight = parseInt(this.drawHeight * ratio / scale);
          this.dataWidth = parseInt(this.drawWidth * ratio / scale);
          this.dataX = parseInt(this.drawX * ratio / scale);
          this.dataY = parseInt(this.drawY * ratio / scale);
          if (this.imgChanged == false) {
            this.imageData = this.ctx.getImageData(this.dataX, this.dataY, this.dataWidth, this.dataHeight);
            this.imgChanged = true;
          }

          //触摸点在像素数据中的位置
          let clickX = parseInt((x - this.drawX) * ratio / scale);
          let clickY = parseInt((y - this.drawY) * ratio / scale);
          let startPoint = (clickY * this.dataWidth + clickX) * 4;
          console.log("触摸点:(" + x + "," + y + ") " + startPoint);
          let color1 = new Color(this.imageData.data[startPoint], this.imageData.data[startPoint + 1], this.imageData.data[startPoint + 2], this.imageData.data[startPoint + 3]); //选定的颜色

          console.log(color1);
          let color2;
          switch (this.selectedColor) {
            case "red":
              {
                color2 = new Color(220, 20, 60, 255); //填涂色
                break;
              }
            case "blue":
              {
                color2 = new Color(65, 105, 225, 255); //填涂色
                break;
              }
            case "purple":
              {
                color2 = new Color(255, 0, 255, 255); //填涂色
                break;
              }
            case "green":
              {
                color2 = new Color(50, 205, 50, 255); //填涂色
                break;
              }
            case "yellow":
              {
                color2 = new Color(255, 255, 0, 255); //填涂色
                break;
              }
            case "white":
              {
                color2 = new Color(248, 248, 255, 255); //填涂色
                break;
              }
          }
          let colorOper = new FillColor();
          if (color1.isSame(color2)) {
            return;
          }
          colorOper.fillColor(this.imageData.data, this.dataWidth, this.dataHeight, color1, color2, clickX, clickY);
          this.ctx.putImageData(this.imageData, this.dataX, this.dataY);
          this.reDrawCanvas();
        }
      }

      //处理画笔选择事件
      if (y > this.firstY - CIRCLE_R && y < this.firstY + CIRCLE_R) {
        //处于第一行 
        this.ctx.lineWidth = 5; //注意：不能使用字符串（会导致模拟器正常，但真机不显示）
        if (x > (750 / 4 - CIRCLE_R) && x < (750 / 4 + CIRCLE_R)) /**0 红 */ {
          console.log("0.选择了红色");
          this.selected = true;
          this.selectedColor = "red";
          this.reNewCanvas();
          this.ctx.strokeStyle = '#DC143C';
          this.ctx.beginPath();
          this.ctx.arc(750 / 4, this.firstY, CIRCLE_R + 10, 0, Math.PI * 2, true);
        } else if (x > (750 / 2 - CIRCLE_R) && x < (750 / 2 + CIRCLE_R)) /**1 蓝 */ {
          console.log("1.选择了蓝色");
          this.selected = true;
          this.selectedColor = "blue";
          this.reNewCanvas();
          this.ctx.strokeStyle = '#4169E1';
          this.ctx.beginPath();
          this.ctx.arc(750 / 2, this.firstY, CIRCLE_R + 10, 0, Math.PI * 2, true);
        } else if (x > (750 * 3 / 4 - CIRCLE_R) && x < (750 * 3 / 4 + CIRCLE_R)) /**2 紫 */ {
          console.log("2.选择了紫色");
          this.selected = true;
          this.selectedColor = "purple";
          this.reNewCanvas();
          this.ctx.strokeStyle = '#FF00FF';
          this.ctx.beginPath();
          this.ctx.arc(750 * 3 / 4, this.firstY, CIRCLE_R + 10, 0, Math.PI * 2, true);
        } else {
          //不在选项区域内
          return;
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.reDrawCanvas(); //生效
      } else if (y > this.secondY - CIRCLE_R && y < this.secondY + CIRCLE_R) {
        //处于第二行
        this.ctx.lineWidth = 5; //注意：不能使用字符串（会导致模拟器正常，但真机不显示）
        if (x > (750 / 4 - CIRCLE_R) && x < (750 / 4 + CIRCLE_R)) /**3 绿 */ {
          console.log("3.选择了绿色");
          this.selected = true;
          this.selectedColor = "green";
          this.reNewCanvas();
          this.ctx.strokeStyle = '#32CD32';
          this.ctx.beginPath();
          this.ctx.arc(750 / 4, this.secondY, CIRCLE_R + 10, 0, Math.PI * 2, true);
        } else if (x > (750 / 2 - CIRCLE_R) && x < (750 / 2 + CIRCLE_R)) /**4 黄 */ {
          console.log("4.选择了黄色");
          this.selected = true;
          this.selectedColor = "yellow";
          this.reNewCanvas();
          this.ctx.strokeStyle = '#FFFF00';
          this.ctx.beginPath();
          this.ctx.arc(750 / 2, this.secondY, CIRCLE_R + 10, 0, Math.PI * 2, true);
        } else if (x > (750 * 3 / 4 - CIRCLE_R) && x < (750 * 3 / 4 + CIRCLE_R)) /**5 白 */ {
          console.log("5.选择了白色");
          this.selected = true;
          this.selectedColor = "white";
          this.reNewCanvas();
          this.ctx.strokeStyle = '#F8F8FF';
          this.ctx.beginPath();
          this.ctx.arc(750 * 3 / 4, this.secondY, CIRCLE_R + 10, 0, Math.PI * 2, true);
        } else {
          //不在选项区域内
          console.log("不在选项区域内")
          return;
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.reDrawCanvas(); //生效
      }
      //返回主页
      if (x >= this.nextBgSprite.x && x <= this.nextBgSprite.x + this.nextBgSprite.width &&
        y >= this.nextBgSprite.y && y <= this.nextBgSprite.y + this.nextBgSprite.y + this.nextBgSprite.height) {
        DataStore.getInstance().director.toHomeScene();
      }
      //保存
      if (x >= this.saveBgSprite.x && x <= this.saveBgSprite.x + this.saveBgSprite.width &&
        y >= this.saveBgSprite.y && y <= this.saveBgSprite.y + this.saveBgSprite.y + this.saveBgSprite.height) {
        this.save()
      }
    });
  }

  //生成分享截图
  save() {
    let _this = this;
    let saveCanvas = wx.createCanvas();
    let saveCtx = saveCanvas.getContext('2d');
    saveCanvas.width = screenWidth * ratio;
    saveCanvas.height = screenHeight * ratio;
    saveCtx.scale(ratio, ratio);
    saveCtx.scale(screenWidth / 750, screenWidth / 750);
    this.background = new Background(saveCtx, scale);
    this.drawPic(saveCtx);
    this.dataHeight = parseInt(this.drawHeight * ratio / scale);
    this.dataWidth = parseInt(this.drawWidth * ratio / scale);
    this.dataX = parseInt(this.drawX * ratio / scale);
    this.dataY = parseInt(this.drawY * ratio / scale);
    let saveData = this.ctx.getImageData(this.dataX, this.dataY, this.dataWidth, this.dataHeight);
    saveCtx.putImageData(saveData, this.dataX, this.dataY);

    //打印截图
    saveCanvas.toTempFilePath({
      x: 0,
      y: 0,
      width: screenWidth * ratio,
      height: screenHeight * ratio,
      destWidth: screenWidth * ratio,
      destHeight: screenHeight * ratio,
      success: (response) => {
        wx.getSetting({
          success: res => {
            let authSetting = res.authSetting;
            if (authSetting['scope.writePhotosAlbum'] === false) {
              wx.showModal({
                title: '提示',
                content: '您拒绝了保存到相册到权限，请手动到设置页面打开授权开关',
                showCancel: false,
                confirmText: '知道了',
                success: res => {}
              });
            } else {
              wx.saveImageToPhotosAlbum({
                filePath: response.tempFilePath,
                success: res => {
                  console.log(res);
                  wx.showModal({
                    title: '提示',
                    content: '保存成功，请前往相册查看',
                    showCancel: false,
                    confirmText: '知道了',
                    success: res => {}
                  });
                },
                fail: res => {
                  console.log(res.errMsg);
                  if (res.errMsg.indexOf('deny')) {}
                }
              });
            }
          }
        });
      }
    });
  }

}