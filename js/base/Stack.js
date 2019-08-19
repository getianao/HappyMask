//用数组实现的栈类
export default class Stack {
  constructor() {
    this.item = [];
  }

  push(element) {//压栈
    this.item.push(element)
  }

  pop() { // 移除元素
    return this.item.pop()
  }

  peek() { // 查看栈顶元素(最后一个元素)
    return this.item[item.length - 1]
  }

  isEmpty() { // 检查栈是否为空
  if(this.item)
    return this.item.length==0;
  }

  size() { // 查看栈的长度
    return this.item.length
  }

  clear() { // 清空栈
    this.item.length = 0
  }

  print() { //打印栈所有元素
    console.log(this.item.toString())
  }

  toString() {
    return this.item.toString()
  }
}