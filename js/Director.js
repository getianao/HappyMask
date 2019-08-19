// 控制游戏逻辑
import HomeScene from './scene/homeScene';
import QuestionScene from './scene/questionScene';
import FreeScene from './scene/freeScene';
import ResultScene from './scene/resultScene';

import Question from './player/question';
import DataStore from './base/DataStore';

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;

export default class Director {
  constructor(ctx) {
    this.currentIndex = 0; //初始问题序号为0
    this.ctx = ctx; // 主屏的ctx
  }

  static getInstance() {
    if (!Director.instance) {
      Director.instance = new Director();
    }
    return Director.instance;
  }

  //进入游戏：打开游戏，预加载问题
  run(ctx) {
   // this.showHomeScene(ctx);
    DataStore.getInstance().director.toHomeScene();
    // 预加载问题图片，减少空白时间
    Question.getInstance();
    // this.showResultScene();
  }

  // 首页场景
  showHomeScene(ctx) {
    this.homeScene = new HomeScene(ctx);
  }

  //从首页转到问题页面
  toQuestionScene() {
    let ctx = DataStore.getInstance().ctx;
    this.offScreenCanvas = wx.createCanvas(); //离屏canvas为画板
    this.offScreenCanvas.width = screenWidth * ratio;
    this.offScreenCanvas.height = screenHeight * ratio;
    let questionCtx = this.offScreenCanvas.getContext('2d'); //offScreenCanvas的上下文为questionCtx
    questionCtx.scale(ratio, ratio);
    let scales = screenWidth / 750; /*将横坐标最大值变为了750*/
    questionCtx.scale(scales, scales);
    DataStore.getInstance().offScreenCanvas = this.offScreenCanvas;
    ctx.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
    this.questionScene = new QuestionScene(questionCtx, Question.getInstance().currentList[this.currentIndex], this.currentIndex);
    ctx.drawImage(this.offScreenCanvas, 0, 0, screenWidth, screenHeight); //绘制初始questionCtx：将离屏canvas绘制在主屏ctx上
    DataStore.getInstance().currentCanvas = 'questionCanvas';
  }


  // 下一个问题场景
  nextQuestionScene() {
    if (this.currentIndex == 4) {
      this.showResultScene();
      return;
    }
    this.currentIndex++;
    if (this.offScreenCanvas) {
      this.offScreenCanvas = null;
    }
    this.toQuestionScene();
  }

  // 结果场景
  showResultScene() {
    let ctx = DataStore.getInstance().ctx;
    this.resultCanvas = wx.createCanvas();
    let resultCtx = this.resultCanvas.getContext('2d');
    this.resultCanvas.width = screenWidth * ratio;
    this.resultCanvas.height = screenHeight * ratio;
    let scales = screenWidth / 750;
    resultCtx.scale(ratio, ratio);
    resultCtx.scale(scales, scales);
    DataStore.getInstance().resultCanvas = this.resultCanvas;
    this.resultScene = new ResultScene(resultCtx);
    // ctx.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
    // ctx.drawImage(this.resultCanvas, 0, 0, screenWidth, screenHeight); //绘制初始questionCtx：将离屏canvas绘制在主屏ctx上
    DataStore.getInstance().currentCanvas = 'resultCanvas';
  }


  //从首页转到自由模式
  toFreeScene() {
    let ctx = DataStore.getInstance().ctx;
    this.freeCanvas = wx.createCanvas(); //离屏canvas为画板
    this.freeCanvas.width = screenWidth * ratio;
    this.freeCanvas.height = screenHeight * ratio;
    let freeCtx = this.freeCanvas.getContext('2d'); //offScreenCanvas的上下文为questionCtx
    freeCtx.scale(ratio, ratio);
    let scales = screenWidth / 750; /*将横坐标最大值变为了750*/
    freeCtx.scale(scales, scales);
    DataStore.getInstance().freeCanvas = this.freeCanvas;
    ctx.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
    this.freeScene = new FreeScene(freeCtx);
    ctx.drawImage(this.freeCanvas, 0, 0, screenWidth, screenHeight); //绘制初始questionCtx：将离屏canvas绘制在主屏ctx上
    DataStore.getInstance().currentCanvas = 'freeCanvas';
  }


  //返回游戏主界面
  toHomeScene() {
    DataStore.getInstance().score = 0;
    this.currentIndex = 0;
    Question.getNewInstance();

    let ctx = DataStore.getInstance().ctx;
    let homeCanvas = wx.createCanvas();
    let homeCtx = homeCanvas.getContext('2d'); //上下文
    homeCanvas.width = screenWidth * ratio;
    homeCanvas.height = screenHeight * ratio;
    homeCtx.scale(ratio, ratio);
    let homeScene = new HomeScene(homeCtx);
    DataStore.getInstance().mainCanvas = homeCanvas;
    ctx.clearRect(0, 0, screenWidth * ratio, screenHeight * ratio);
    ctx.drawImage(homeCanvas, 0, 0, screenWidth, screenHeight); //绘制初始questionCtx：将离屏canvas绘制在主屏ctx上
    console.log("返回游戏主界面");
  }
}