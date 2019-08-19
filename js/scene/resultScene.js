import Background from "../runtime/background";
import Sprite from "../base/Sprite";
import DataStore from "../base/DataStore";
import Main from '../../main'

import {
  remarks
} from '../data/questions';
import {
  drawText
} from '../utils/index';

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;
const scale = 750 / screenWidth;

export default class ResultScene {
  constructor(ctx) {
    console.log("切换至结果页");
    this.ranking = false; //不打开排行榜
    this.ctx = ctx;
    this.score = DataStore.getInstance().score;
    this.saveUserCloadStorage();
    this.loop();
  }

  loop() {
    this.background = new Background(this.ctx, scale);
    this.drawEle();
    if (this.ranking == true) {
      // 子域canvas 放大绘制，这里必须限制子域画到上屏的宽高是screenWidth， screenHeight
      this.background = new Background(this.ctx, scale);
      this.drawEle();
      DataStore.getInstance().ctx.drawImage(DataStore.getInstance().resultCanvas, 0, 0, screenWidth, screenHeight);
      DataStore.getInstance().ctx.drawImage(DataStore.getInstance().sharedCanvas, 0, 0, screenWidth, screenHeight);
    } else {
      DataStore.getInstance().ctx.drawImage(DataStore.getInstance().resultCanvas, 0, 0, screenWidth, screenHeight);
    }
    this.requestId = requestAnimationFrame(this.loop.bind(this));
  }

  drawEle() {
    //绘制标题
    let titleImg = Sprite.getImage('title');
    let titleSprite = new Sprite(titleImg, (750 - titleImg.width * 3 / 5) / 2, 150, titleImg.width * 3 / 5, titleImg.height * 3 / 5);
    titleSprite.draw(this.ctx);

    //绘制结果背景
    let resultBgImg = Sprite.getImage('result_bg');
    let resultBgSprite = new Sprite(resultBgImg, (750 - resultBgImg.width) / 2, titleSprite.height + 210, resultBgImg.width, resultBgImg.height);
    resultBgSprite.draw(this.ctx);

    //绘制分数信息
    this.ctx.fillStyle = '#1b282c';
    this.ctx.font = '30px Arial';
    this.ctx.fillText('你的分数', resultBgSprite.x + 100, resultBgSprite.y + 190);
    this.ctx.fillText('分', (750 - resultBgSprite.x) - 120, resultBgSprite.y + 190);
    this.ctx.save();
    this.ctx.font = '24px Arial';
    drawText(remarks[this.score], resultBgSprite.x + 100, resultBgSprite.y + 240, resultBgSprite.width - 200, this.ctx, ratio);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '76px Arial';
    this.ctx.fillText(this.score, (750 - resultBgSprite.x) - 300, resultBgSprite.y + 170);
    this.ctx.save();

    //绘制排行版按钮
    this.rankBtnImg = Sprite.getImage('rank_btn');
    this.rankBtnSprite = new Sprite(this.rankBtnImg, (750 - this.rankBtnImg.width) / 2, resultBgSprite.y + resultBgSprite.height + 40,
      this.rankBtnImg.width, this.rankBtnImg.height);
    this.rankBtnSprite.draw(this.ctx);

    //绘制保存成绩单
    this.printReportBtnImg = Sprite.getImage('report_btn');
    this.printReportBtnSprite = new Sprite(this.printReportBtnImg, (750 - this.printReportBtnImg.width) / 2, this.rankBtnSprite.y + this.rankBtnSprite.height + 40, this.printReportBtnImg.width, this.printReportBtnImg.height);
    this.printReportBtnSprite.draw(this.ctx);

    //绘制返回游戏主页
    this.backBtnImg = Sprite.getImage('return_btn');
    this.backBtnSprite = new Sprite(this.backBtnImg, (750 - this.backBtnImg.width) / 2, this.printReportBtnSprite.y + this.printReportBtnSprite.height + 40, this.backBtnImg.width, this.backBtnImg.height);
    this.backBtnSprite.draw(this.ctx);

    this.bindEvent();
  }

  //监听触摸事件
  bindEvent() {
    let _this = this;
    wx.offTouchStart();

    //从排行榜返回主页事件
    if (this.ranking==true) {
      wx.onTouchStart((e) => {
        let x = e.touches[0].clientX,
          y = e.touches[0].clientY;
        console.log(x + " " + 80 / scale + " " + 180 / scale);
        console.log(y + " " + 1120 / scale + " " + 1220 / scale);

        if (x >= 80 / scale && x <= 180 / scale && y >= 1120 / scale && y <= 1220 / scale) {
          // 返回按钮
          _this.ranking = false;

          // setTimeout(() => {
          //   cancelAnimationFrame(_this.requestId);
          // }, 20);
        }
      });
      return;
    }

    //没有进入排行榜
    wx.onTouchStart((e) => {
      let x = e.touches[0].clientX * scale,
        y = e.touches[0].clientY * scale;
      //排行榜点击事件
      if (x >= _this.rankBtnSprite.x && x <= _this.rankBtnSprite.x + _this.rankBtnSprite.width &&
        y >= _this.rankBtnSprite.y && y <= _this.rankBtnSprite.y + _this.rankBtnSprite.height) {
        console.log("点击排行榜");
        _this.messageSharecanvas();
        wx.offTouchStart(); // 在分享canvas还是会响应事件，所以先解除事件绑定
      } //导出成绩单点击事件
      else if (x >= _this.printReportBtnSprite.x && x <= _this.printReportBtnSprite.x + _this.printReportBtnSprite.width &&
        y >= _this.printReportBtnSprite.y && y <= _this.printReportBtnSprite.y + _this.printReportBtnSprite.height) {
        console.log("点击分享");
        _this.report();
      } //返回游戏主页
      else if (x >= _this.backBtnSprite.x && x <= _this.backBtnSprite.x + _this.backBtnSprite.width &&
        y >= _this.backBtnSprite.y && y <= _this.backBtnSprite.y + _this.backBtnSprite.height) {
        console.log("点击返回");
        _this.back();
      }
    });
  }

  messageSharecanvas(type, text) {
    let openDataContext = wx.getOpenDataContext();
    openDataContext.postMessage({ //向开放数据域发送消息
      type: type || 'friends',
      text: text,
    });
    this.ranking = true;
  }

  //生成分享截图
  report() {
    let _this = this;
    let reportCanvas = wx.createCanvas();
    let reportCtx = reportCanvas.getContext('2d');
    reportCanvas.width = screenWidth * ratio;
    reportCanvas.height = screenHeight * ratio;
    reportCtx.scale(ratio, ratio);
    reportCtx.scale(screenWidth / 750, screenWidth / 750);
    new Background(reportCtx, scale);


    //绘制标题
    let titleImg = Sprite.getImage('title');
    let titleSprite = new Sprite(titleImg, (750 - titleImg.width * 3 / 5) / 2, 150, titleImg.width * 3 / 5, titleImg.height * 3 / 5);
    titleSprite.draw(reportCtx);

    //绘制结果背景
    let resultBgImg = Sprite.getImage('result_bg');
    let resultBgSprite = new Sprite(resultBgImg, (750 - resultBgImg.width) / 2, titleSprite.height + 210, resultBgImg.width, resultBgImg.height);
    resultBgSprite.draw(reportCtx);

    //绘制分数信息
    reportCtx.fillStyle = '#1b282c';
    reportCtx.font = '30px Arial';
    reportCtx.fillText('你的分数', resultBgSprite.x + 100, resultBgSprite.y + 190);
    reportCtx.fillText('分', (750 - resultBgSprite.x) - 120, resultBgSprite.y + 190);
    reportCtx.save();
    reportCtx.font = '24px Arial';
    drawText(remarks[this.score], resultBgSprite.x + 100, resultBgSprite.y + 240, resultBgSprite.width - 200, reportCtx, ratio);
    reportCtx.fillStyle = '#fff';
    reportCtx.font = '76px Arial';
    reportCtx.fillText(this.score, (750 - resultBgSprite.x) - 300, resultBgSprite.y + 170);
    reportCtx.save();

    //打印截图
    reportCanvas.toTempFilePath({
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

  //保存用户分数
  saveUserCloadStorage() {
    let score = '' + this.score; //字符串
    wx.setUserCloudStorage({
      KVDataList: [{
        key: 'score',
        value: score
      }],
      success: res => {
        console.log("保存分数成功");
        console.log(res);
        //更新最大分数
        let openDataContext = wx.getOpenDataContext();
        openDataContext.postMessage({
          type: 'updateMaxScore',
        });
      },
      fail: res => {
        console.log("保存分数失败");
        console.log(res);
      }
    });
  }

  //返回主页
  back() {
    cancelAnimationFrame(this.requestId);
    DataStore.getInstance().director.toHomeScene();
  }
}