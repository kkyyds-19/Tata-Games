import { _decorator, Component, AudioClip, AudioSource, Button ,Node} from 'cc';
import { MusicManager } from '../music/MusicManager';
const { ccclass, property } = _decorator;

@ccclass('AutoButtonSoundInitializer')
export class AutoButtonSoundInitializer extends Component {
  
    onLoad() {
        // 查找所有 Button 子节点
        this.addClickListenerRecursively(this.node);
    }

    private addClickListenerRecursively(node: Node) {
        for (const child of node.children) {
            const button = child.getComponent(Button);
            if (button) {
                child.on(Button.EventType.CLICK, this.playClickSound, this);
            }
            this.addClickListenerRecursively(child); // 递归子节点
        }
    }

    private playClickSound() {
        MusicManager.getInstance().playButtonClickSound();
    }
} 