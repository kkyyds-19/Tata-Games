import { director } from 'cc';
import { game } from 'cc';
import { EventTouch } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ShowToast } from '../global/Toast';
const { ccclass, property } = _decorator;

@ccclass('RichTextClick')
export class RichTextClick extends Component {
    onClick(ev: EventTouch, data) {
        director.emit(game.gameEvent.RICHTEXT_CLICK, ev, data);
        ShowToast(`点击了超文本:${data}`);
    }
}


