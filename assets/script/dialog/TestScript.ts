import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestScript')
export class TestScript extends Component {
    
    start() {
        console.log('TestScript loaded successfully');
    }
} 