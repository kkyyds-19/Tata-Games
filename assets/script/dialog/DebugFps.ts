import { _decorator, cclegacy, Color, Component, Director, director, dynamicAtlasManager, game, Label, macro, profiler, Sprite, Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DebugFps')
export class DebugFps extends Component {
    @property(Label)
    drawcall!:Label;
    onLoad(){   
        profiler.hideStats();
        director.on(game.gameEvent.DEBUG_FPS_SHOW_HIDE,this.onDebugFpsShowHide,this)
        this.hide();
    }
    show(){
        this.node.active = true;
    }
    hide(){
        this.node.active = false;
    }
    onDebugFpsShowHide(){
        if(profiler.isShowingStats()){
            profiler.hideStats();
        }else{
            profiler.showStats();
        }
        // this.node.active = !this.node.active;
    }

   lateUpdate(dt:number){
        if(!this.node.active) return;
        let state = null;
        if(profiler.stats){
            state = profiler.stats;
        }else{
            return
        }

        let dc = state.draws.counter._value;
        let tris = state.tricount.counter._value;
        let fps =  state.fps.counter._averageValue;
        let render =  state.render.counter._averageValue;

const  text = `
  DC: ${dc} \n
  FPS: ${fps.toFixed(2)} \n
  三角形: ${tris} \n
  渲染: ${render.toFixed(2)}ms`

     this.drawcall.string = text;
    }

}

