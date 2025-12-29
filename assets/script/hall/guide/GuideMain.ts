import { tween } from 'cc';
import { _decorator, Component,director,Node,Sprite,UIOpacity,Vec3 } from 'cc';
import { MusicManager } from '../../music/MusicManager';
import { game } from 'cc';
import { CCFloat } from 'cc';

const { ccclass, property } = _decorator;


@ccclass('GuideMain')
export class GuideMain extends Component {
   @property(Node)
    guideNode1:Node = null;
   @property(Node)
   guideNode2:Node = null;

  @property({ type: [Node], tooltip: "需要轮播的图片节点数组（需包含Sprite和UIOpacity组件）" })
   imageNodes: Node[] = [];

  @property({ type: CCFloat, tooltip: "渐入渐出动画时长（秒）" })
  fadeDuration = 0.5;

  @property({ type: CCFloat, tooltip: "每张图片显示时长（秒）" })
  displayDuration = 0.6;

  @property({ type: Boolean, tooltip: "是否自动循环播放" })
  autoPlay = false;

  private currentIndex = 0; // 当前显示的图片索引
  private isPlaying = false; // 是否正在播放动画


  protected onLoad() {
   // 确保节点作为场景的直接子节点，实现覆盖效果
        const scene = director.getScene();
        const canvas = scene?.getChildByName('Canvas');
        if (canvas) {
            this.node.parent = canvas;
        }


    // 初始化所有图片状态（除第一张外均隐藏）
    this.imageNodes.forEach((node, index) => {
      const opacity = node.getComponent(UIOpacity);
      if (!opacity) {
        node.addComponent(UIOpacity); // 自动添加透明度组件
      }
      // 隐藏非首图
      if (index !== 0) {
        node.getComponent(UIOpacity)!.opacity = 0;
      }
    });
  }

  protected start() {
    if (this.autoPlay) {
      this.startSequence();
    }
  }

  /**
   * 开始图片轮播序列
   */
  startSequence() {
    if (this.isPlaying || this.imageNodes.length <= 1) return;
    
    this.isPlaying = true;
    this.playNextImage();
  }

  /**
   * 播放下一张图片（核心动画逻辑）
   */
  private async playNextImage() {
    if(this.currentIndex == 3)return;
    // 当前图片渐隐
    const currentNode = this.imageNodes[this.currentIndex];
    await this.fadeOut(currentNode);

    // 计算下一张图片索引（循环）
    this.currentIndex = (this.currentIndex + 1) % this.imageNodes.length;

    // 下一张图片渐显
    const nextNode = this.imageNodes[this.currentIndex];
    await this.fadeIn(nextNode);

    // 等待指定显示时长后继续
    await new Promise(resolve => setTimeout(resolve, this.displayDuration * 1000));

    // 循环播放
    if (this.isPlaying) {
      this.playNextImage();
    }
  }

  /**
   * 图片渐隐动画
   * @param node 目标节点
   * @returns 动画完成的Promise
   */
  private fadeOut(node: Node): Promise<void> {
    return new Promise(resolve => {
      const opacity = node.getComponent(UIOpacity)!;
        tween(opacity)
        .to(this.fadeDuration, { opacity: 255 })
        .call((target: any) => {
            resolve();
        })
        .start();
    });
  }

  /**
   * 图片渐显动画
   * @param node 目标节点
   * @returns 动画完成的Promise
   */
  private fadeIn(node: Node): Promise<void> {
    return new Promise(resolve => {
      const opacity = node.getComponent(UIOpacity)!;
      // 先确保节点可见（避免被隐藏）
      node.active = true;
      opacity.opacity = 0;
      // 执行渐显
        tween(opacity)
        .to(this.fadeDuration, { opacity: 255 })
        .call((target: any) => {
            resolve();
            if(this.currentIndex == 3){
                this.guideNode1.removeAllChildren();
                this.guideNode2.active = true;
            } 

        })
        .start();
    });
  }

  /**
   * 停止轮播
   */
  stopSequence() {
    this.isPlaying = false;
  }


    onStartGameClick(){
        localStorage.setItem("showGuide","2");
         MusicManager.getInstance().stopBackgroundMusic();
          
        game.myGlobal.gameInited = 0;
        // TimeManager.getInstance().pause();
        
        console.log(`开始游戏，关卡：${game.myGlobal.currentStage}`);
        // 切换到游戏场景
         director.loadScene('game');
    }

    update(deltaTime: number) {
        
    }

     public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }
}


