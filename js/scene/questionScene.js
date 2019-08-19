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
export default class QuestionScene {
  constructor(ctx, question, index) { //ctx：传入的离屏上下文
    this.background = new Background(ctx, scale);
    this.question = question; //问题数据
    this.index = index; //问题序号
    this.ctx = ctx; //上下文
    this.selected = false; //是否已选择
    this.imgChanged = false;
    this.init(this.question);
    this.drawProgress();
    this.drawPic();
    this.drawTitle();
    this.drawChoice();
    this.drawNext("提交", "select_bg");
    this.drawTip();
    this.addTouch();
  }

  //装载问题信息
  init(data) {
    //this.img = data.pic;
    this.img = "images/1.png";
    this.title = data.title;
    this.answer = data.answer;
    this.help = data.help;
  }

  //绘制进度条
  drawProgress() {
    let barImg = Sprite.getImage('progress_bar');
    //距离上20，居中
    let barSprite = new Sprite(barImg, (750 - barImg.width) / 2, 20, barImg.width, barImg.height);
    barSprite.draw(this.ctx);
    let percent = (this.index + 1) / 5;
    this.ctx.fillStyle = '#fed443';
    this.ctx.fillRect(barSprite.x + 4, barSprite.y + 82, (barSprite.width - 8) * percent, 16);
    this.bar = barSprite;
  }

  //绘制画板背景和画板
  drawPic() {
    let _this = this;
    let bgImg = Sprite.getImage('question_bg');
    this.offset = (750 - bgImg.width) / 2; /**左偏移量 */
    //进度条下方40，居中
    let bgSprite = new Sprite(bgImg, this.offset, 40 + this.bar.height, bgImg.width, bgImg.height);
    bgSprite.draw(this.ctx);
    this.bg = bgSprite;
    let pic = new Image();
    pic.src = this.img;
    pic.onload = () => {
      if (this.imgChanged == true) {
        return;
      }
      _this.centerImg(pic, this.bg.x + 20, this.bg.y + 20, this.bg.width - 40, this.bg.height - 40);
      _this.reDrawCanvas(); //加载好后绘制到主ctx，因为这是个异步操作
    }
  }

  //居中绘制画板
  centerImg(pic, x, y, limitW, limitH) {
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
    this.ctx.drawImage(pic, this.drawX, this.drawY, this.drawWidth, this.drawHeight);
  }


  //绘制题目文本
  drawTitle() {
    drawText(this.title, this.offset, this.bg.y + this.bg.height + 20, 750 - 2 * this.bg.x, this.ctx, ratio);
  }


  //绘制提示
  drawTip() {
    let tipImg = Sprite.getImage('tip');
    this.tipSprite = new Sprite(tipImg, 10 * scale, screenHeight * scale - 50 * scale, 40 * scale, 40 * scale);
    this.tipSprite.draw(this.ctx);
  }

  //绘制所有选项
  drawChoice(ctx) {
    this.ctx.font = '24px Arial';
    for (let i = 0; i < 6; i++) {
      this.drawChoiceItem(i);
    }
  }

  //绘制下一题选项
  drawNext(text, bgURL) {
    let nextBgImg = Sprite.getImage(bgURL);
    let nextBgX = 750 * 3 / 4 - nextBgImg.width / 2;
    let nextBgY = screenHeight * scale - nextBgImg.height - 20 * scale;
    this.nextBgSprite = new Sprite(nextBgImg, nextBgX, nextBgY, NEXT_WIDTH, NEXT_HEIGHT);
    this.nextBgSprite.draw(this.ctx);
    this.ctx.fillStyle = '#654e01';
    this.ctx.fillText(text, nextBgX + 80, nextBgY + 50);
  }

  //确定选项位置，绘制单个选项
  drawChoiceItem(index) {
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
    this.secondY = this.firstY + 10 * ratio + 2 * CIRCLE_R;
    let y = index < 3 ? this.firstY : this.secondY;
    this.drawCircle(this.ctx, x, y, index, chart[index]);
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
    DataStore.getInstance().ctx.drawImage(DataStore.getInstance().offScreenCanvas, 0, 0, screenWidth, screenHeight);
  }

  //清除主屏canvas和离屏canvas，然后重绘为初始状态，注意：需要调用reDrawCanvas()使之生效
  reNewCanvas() {
    DataStore.getInstance().ctx.clearRect(0, 0, screenWidth * scale, screenHeight * scale);
    this.ctx.clearRect(0, 0, screenWidth * scale, screenHeight * scale);
    this.background = new Background(this.ctx, scale);
    this.drawProgress();
    this.drawPic();
    this.drawTitle();
    this.drawChoice();
    this.drawNext("提交", "select_bg");
    this.drawTip();
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
          console.log("不在选项区域内");
          return;
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.reDrawCanvas(); //生效
      }
      //下一题
      if (x >= this.nextBgSprite.x && x <= this.nextBgSprite.x + this.nextBgSprite.width &&
        y >= this.nextBgSprite.y && y <= this.nextBgSprite.y + this.nextBgSprite.y + this.nextBgSprite.height) {
        this.jumpToNext();
      }
      //提示
      else if (x >= this.tipSprite.x && x <= this.tipSprite.x + this.tipSprite.width &&
        y >= this.tipSprite.y && y <= this.tipSprite.y + this.tipSprite.y + this.tipSprite.height) {
        this.showTip();
        this.reDrawCanvas(); //生效
      }
    });
  }

  //提交
  jumpToNext() {
    let time = 1000;
    let checkColor;
    if (this.imgChanged == false) {
      return;
    }
    switch (this.answer) {
      case "red":
        {
          checkColor = new Color(220, 20, 60, 255); //填涂色
          break;
        }
      case "blue":
        {
          checkColor = new Color(65, 105, 225, 255); //填涂色
          break;
        }
      case "purple":
        {
          checkColor = new Color(255, 0, 255, 255); //填涂色
          break;
        }
      case "green":
        {
          checkColor = new Color(50, 205, 50, 255); //填涂色
          break;
        }
      case "yellow":
        {
          checkColor = new Color(255, 255, 0, 255); //填涂色
          break;
        }
      case "white":
        {
          checkColor = new Color(248, 248, 255, 255); //填涂色
          break;
        }
    }
    let isRight = this.judgeAnswer(checkColor);
    console.log('结果: ' + isRight);
    if (isRight == true) {
      DataStore.getInstance().score += 20;
      this.drawNext("正确", 'select_right');
      this.reDrawCanvas();
    } else {
      this.drawNext("错误", 'select_error');
      this.reDrawCanvas();
      // time += 800;
      // setTimeout(() => {
      //   this.drawChoiceItem(this.answer, 'right_choice', this.reDrawCanvas);
      // }, 800);
    }
    setTimeout(() => {
      DataStore.getInstance().director.nextQuestionScene();
    }, time);
  }


  // 判断答案是否正确
  judgeAnswer(checkColor) {
    //判断三个主要信息，优先关系：脸颊>脑门>下巴
    //脑门：(311,240)
    //脸颊：(253, 517)
    //下巴：(376, 669) 
    let whiteColor = new Color(255, 248, 248, 255);

    let checkLianjiaX = parseInt((253 - this.drawX) * ratio / scale);
    let checkLianjiaY = parseInt((517 - this.drawY) * ratio / scale);
    let startCheckLianjiaPoint = (checkLianjiaY * this.dataWidth + checkLianjiaX) * 4;
    let lianjiaColor = new Color(this.imageData.data[startCheckLianjiaPoint], this.imageData.data[startCheckLianjiaPoint + 1], this.imageData.data[startCheckLianjiaPoint + 2], this.imageData.data[startCheckLianjiaPoint + 3]);

    let checkNaomenX = parseInt((311 - this.drawX) * ratio / scale);
    let checkNaomenY = parseInt((240 - this.drawY) * ratio / scale);
    let startCheckNaomenPoint = (checkNaomenY * this.dataWidth + checkNaomenX) * 4;
    let naomenColor = new Color(this.imageData.data[startCheckNaomenPoint], this.imageData.data[startCheckNaomenPoint + 1], this.imageData.data[startCheckNaomenPoint + 2], this.imageData.data[startCheckNaomenPoint + 3]);

    let checkXiabaX = parseInt((376 - this.drawX) * ratio / scale);
    let checkXiabaY = parseInt((669 - this.drawY) * ratio / scale);
    let startCheckXiabaPoint = (checkXiabaY * this.dataWidth + checkXiabaX) * 4;
    let xiabaColor = new Color(this.imageData.data[startCheckXiabaPoint], this.imageData.data[startCheckXiabaPoint + 1], this.imageData.data[startCheckXiabaPoint + 2], this.imageData.data[startCheckXiabaPoint + 3]);

    if (!lianjiaColor.isSame(whiteColor)) {
      if (lianjiaColor.isSame(checkColor))
        return true;
      else
        return false;
    } else {
      if (!naomenColor.isSame(whiteColor)) {
        if (naomenColor.isSame(checkColor))
          return true;
        else
          return false;
      } else {
        if (!xiabaColor.isSame(whiteColor)) {
          if (xiabaColor.isSame(checkColor))
            return true;
          else
            return false;
        } else {
          return false;
        }
      }
    }
  }

  //展示提示信息
  showTip() {
    let tipMesImg = Sprite.getImage('report_tip');
    this.tipMesSprite = new Sprite(tipMesImg, this.tipSprite.x, this.tipSprite.y - tipMesImg.height - 21, tipMesImg.width, tipMesImg.height);
    this.tipMesSprite.draw(this.ctx);
    this.ctx.fillText(this.help, this.tipMesSprite.x + 70, this.tipMesSprite.y + 30);
  }
}