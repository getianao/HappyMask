// 资源文件加载
import {Resources} from './Resources.js';
export default class ResourceLoader {
  
  //默认时加载图片资源
	constructor (res = Resources) {
	    this.map = new Map(res);
        for (let [key, value] of this.map) {
            const image = wx.createImage();//创建一个图片对象
            image.src = value;
            this.map.set(key, image);
        }
    }

    onLoaded (callback) {
        let loadedCount = 0;
        for (let value  of this.map.values()) {
            value.onload = () => {
                loadedCount++;
                //加载完成
                if (loadedCount >= this.map.size) {
                    callback(this.map);
                }
            }
        }
    }

    static create (res) {
        return new ResourceLoader(res);
    }
}