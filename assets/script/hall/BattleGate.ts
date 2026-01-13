import { _decorator, Component, Animation, AnimationClip, AnimationState } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BattleGate')
export class BattleGate extends Component {

    @property(Animation)
    anim: Animation | null = null;

    private standbyRepeatCount: number = 0;

    start(){
        if (!this.anim) {
            return;
        }

        const playOnce = (clip: string) => {
            if (!this.anim) return;
            const state = this.anim.getState(clip);
            if (state) {
                state.wrapMode = AnimationClip.WrapMode.Normal;
                state.repeatCount = 1;
            }
            this.anim.play(clip);
        };

        this.anim.on(Animation.EventType.FINISHED, (_type: string, state?: AnimationState) => {
            if (!this.anim || !state) return;
            if (state.name === 'dance') {
                this.standbyRepeatCount = 0;
                playOnce('standby');
            } else if (state.name === 'standby') {
                this.standbyRepeatCount++;
                if (this.standbyRepeatCount < 2) {
                    playOnce('standby');
                } else {
                    this.standbyRepeatCount = 0;
                    playOnce('dance');
                }
            }
        }, this);

        playOnce('dance');
    }


    onLoad() {
      
    }

   
    public show() {
        this.node.active = true;
    }

    /**
     * Hides the entire shop interface.
     */
    public hide() {
        this.node.active = false;
    }



   

  
} 
