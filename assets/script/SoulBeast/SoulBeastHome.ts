import { _decorator, Component, Node, sp, resources, UITransform, Vec3, Button, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoulBeastHome')
export class SoulBeastHome extends Component {
    @property(Node)
    public homePage: Node = null;

    @property(Node)
    public mainPage: Node = null;

    @property(Node)
    public soulBeastContainer: Node = null;

    @property([Button])
    public toMainButtons: Button[] = [];

    @property
    public moveSpeedMin: number = 20;

    @property
    public moveSpeedMax: number = 50;

    @property
    public borderPadding: number = 20;

   
}


