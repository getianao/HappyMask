import QuestionPage from './questionScene'
import Background from '../runtime/background'
import DataStore from '../base/DataStore';
import Sprite from '../base/Sprite';

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const ratio = wx.getSystemInfoSync().pixelRatio; //设备像素比=物理像素/设备独立像素

export default class HomeScene {
  constructor(ctx) {
    this.isMusic = true;
    this.ranking = false;
    this.ctx = ctx;
    this.playMusic();
    this.loop();
  }

  loop() {
   // this.ctx.clearRect(0, 0, screenWidth, screenHeight);

    this.background = new Background(this.ctx); //绘制背景
    this.drawCharactor();
    this.drawLogo();
    this.drawButton();
    if (this.isMusic == true) {
      this.drawMusic();
    } else {
      this.drawPauseMusic();
    }

    // if (DataStore.getInstance().shareTicket && !this.showGroup) {
    //   this.showGroup = true;
    //   this.messageSharecanvas('group', DataStore.getInstance().shareTicket);
    // }
    
    if (this.ranking) {
      // 子域canvas 放大绘制，这里必须限制子域画到上屏的宽高是screenWidth， screenHeight
      DataStore.getInstance().ctx.drawImage(DataStore.getInstance().mainCanvas, 0, 0, screenWidth, screenHeight);
      DataStore.getInstance().ctx.drawImage(DataStore.getInstance().sharedCanvas, 0, 0, screenWidth, screenHeight);
    }else{
      DataStore.getInstance().ctx.drawImage(DataStore.getInstance().mainCanvas, 0, 0, screenWidth, screenHeight);
    }
    this.requestId = requestAnimationFrame(this.loop.bind(this));
  }


  //绘制logo
  drawLogo() {
    this.logoImg = Sprite.getImage('title');
    this.logoSprite = new Sprite(this.logoImg, screenWidth / 2 - this.logoImg.width / 5, 100, this.logoImg.width * 2 / 5, this.logoImg.height * 2 / 5);
    this.logoSprite.draw(this.ctx);
  }

  //绘制音乐
  drawMusic() {
    let musicImg = Sprite.getImage('music1');
    this.music1Sprite = new Sprite(musicImg, 10, screenHeight - 50, 40, 40);
    this.music1Sprite.draw(this.ctx);
  }

  //绘制暂停音乐
  drawPauseMusic() {

    let musicImg = Sprite.getImage('music');
    this.musicSprite = new Sprite(musicImg, 10, screenHeight - 50, 40, 40);
    this.musicSprite.draw(this.ctx);
  }

  //绘制主页人物
  drawCharactor() {
    this.charactor1Img = Sprite.getImage('character1');
    this.charactor1Sprite = new Sprite(this.charactor1Img, screenWidth / (100), screenHeight / (1.4) - this.charactor1Img.height / 2, this.charactor1Img.width / 2, this.charactor1Img.height / 2); /**根据左下角对齐 */
    this.charactor1Sprite.draw(this.ctx);

    this.charactor2Img = Sprite.getImage('character2');
    this.charactor2Sprite = new Sprite(this.charactor2Img, screenWidth / (1.8), screenHeight / (1.4) - this.charactor2Img.height / 6, this.charactor2Img.width / 6, this.charactor2Img.height / 6); /**根据左下角对齐 */
    this.charactor2Sprite.draw(this.ctx);
  }

  //绘制主页按键
  drawButton() {
    //闯关模式按键，居中
    this.btnLevelImg = Sprite.getImage('level_btn');
    this.btnLevelSprite = new Sprite(this.btnLevelImg, screenWidth / 2 - this.btnLevelImg.width / 4, screenHeight - 4.5 * this.btnLevelImg.height / 2, this.btnLevelImg.width / 2, this.btnLevelImg.height / 2);
    this.btnLevelSprite.draw(this.ctx);
    //自由模式按键，向上对齐
    this.btnFreeImg = Sprite.getImage('free_btn');
    this.btnFreeSprite = new Sprite(this.btnFreeImg, screenWidth / 2 - this.btnFreeImg.width / 4, this.btnLevelSprite.y + this.btnLevelSprite.height + this.btnLevelSprite.height / 2, this.btnFreeImg.width / 2, this.btnFreeImg.height / 2);
    this.btnFreeSprite.draw(this.ctx);
    //排行榜按键，向上对齐
    this.btnRankImg = Sprite.getImage('rank_btn');
    this.btnRankSprite = new Sprite(this.btnRankImg, screenWidth / 2 - this.btnRankImg.width / 4, this.btnLevelSprite.y + this.btnLevelSprite.height + this.btnLevelSprite.height + this.btnFreeSprite.height, this.btnRankImg.width / 2, this.btnRankImg.height / 2);

    this.btnRankSprite.draw(this.ctx);

    this.bindEvent();
  }


  messageSharecanvas(type, text) {
    // 排行榜也应该是实时的，所以需要sharedCanvas 绘制新的排行榜
    let openDataContext = wx.getOpenDataContext();
    openDataContext.postMessage({
      type: type || 'friends',
      text: text,
    });
    this.ranking = true;
  }

  playMusic() {
    this.audio = wx.createInnerAudioContext();
    this.audio.src = "audios/music.mp3";
    this.audio.autoplay = true;
    this.audio.loop = true;
    this.isMusic = true;
  }

  pauseMusic() {
    this.isMusic = false;
    this.audio.destroy();
  }

  //事件绑定
  bindEvent() {
    let _this = this;
    wx.offTouchStart(); //取消监听开始触摸事件


    if (this.ranking == true) {
      wx.onTouchStart((e) => {

        let x = e.touches[0].clientX,
          y = e.touches[0].clientY;
        let scale = screenWidth / 750;
        console.log(x + " " + 80 * scale + " " + 180 * scale);
        console.log(y + " " + 1120 * scale + " " + 1220 * scale);

        if (x >= 80 * scale && x <= 180 * scale && y >= 1120 * scale && y <= 1220 * scale) { // 返回按钮
          _this.ranking = false;
          // setTimeout(() => {
          //   cancelAnimationFrame(_this.requestId);
          // }, 20);
        }
      });
      return;
    }

    wx.onTouchStart((e) => {
      let x = e.touches[0].clientX,
        y = e.touches[0].clientY; //触摸数据和Sprite.x是不乘ratio的
      if (x >= _this.btnLevelSprite.x && x <= _this.btnLevelSprite.x + _this.btnLevelSprite.width &&
        y >= _this.btnLevelSprite.y && y <= _this.btnLevelSprite.y + _this.btnLevelSprite.height) { //关卡模式
        console.log("点击了关卡模式");
        cancelAnimationFrame(_this.requestId); //取消由 requestAnimationFrame 添加到计划中的动画帧请求
        DataStore.getInstance().director.toQuestionScene(_this.ctx);
      } else if (x >= _this.btnFreeSprite.x && x <= _this.btnFreeSprite.x + _this.btnFreeSprite.width &&
        y >= _this.btnFreeSprite.y && y <= _this.btnFreeSprite.y + _this.btnFreeSprite.height) { //自由模式
        console.log("点击了自由模式");
        cancelAnimationFrame(_this.requestId);
        DataStore.getInstance().director.toFreeScene();

      } else if (x >= _this.btnRankSprite.x && x <= _this.btnRankSprite.x + _this.btnRankSprite.width &&
        y >= _this.btnRankSprite.y && y <= _this.btnRankSprite.y + _this.btnRankSprite.height) { //排行榜
        console.log("点击了排行榜");
        // 排行榜也应该是实时的，所以需要sharedCanvas 绘制新的排行榜
        _this.messageSharecanvas();
        wx.offTouchStart(); // 在分享canvas还是会响应事件，所以先解除事件绑定
      } else if (x >= 10 && x <= 50 &&
        y >= screenHeight - 50 && y <= screenHeight - 10) { //音乐
        console.log("点击了音乐");
        if (this.isMusic == true) {
          this.isMusic = false;
          this.pauseMusic();
        } else {
          this.isMusic = true;
          this.playMusic();
        }
        DataStore.getInstance().ctx.drawImage(DataStore.getInstance().mainCanvas, 0, 0, screenWidth, screenHeight);
      }
    });
  }
}