import { _decorator, Component, Node, Button } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BattleGate')
export class BattleGate extends Component {



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