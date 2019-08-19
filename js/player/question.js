/**
 * 问题处理类
 */
import {
  questionList
} from '../data/questions.js'
import ResourceLoader from "../base/ResourceLoader";

export default class Question {
  constructor() {
    this.currentList = this.getRandomQuestions(); //随机的问题信息
    ResourceLoader.create(this.loaders); //对应的图片路径
  }

  static getInstance() {
    if (!Question.instance) {
      Question.instance = new Question();
    }
    return Question.instance;
  }

  static getNewInstance() {
    Question.instance = new Question();
    return Question.instance;
  }

  // 随机获取5个问题，存防至
  getRandomQuestions() {
    let questions = [], //{题目信息}
      randoms = [], //产生过的随机数
      loaders = []; //[题目序号, 对应图片路径]
    let count = 0;

    while (count < 5) {
      let random = parseInt(Math.random() * questionList.length);
      if (randoms.indexOf(random) === -1) { //没有出现过
        questions.push(questionList[random]);
        loaders.push([random, questionList[random].pic]);
        randoms.push(random);
        count++;
      }
    }
    this.loaders = loaders;
    return questions;
  }
}