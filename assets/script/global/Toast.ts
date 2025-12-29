import { director, game } from 'cc';

/**
 * 显示一个全局的Toast提示
 * @param message 要显示的消息
 */
export function ShowToast(message: string) {
    if (!message) {
        console.warn('ShowToast called with an empty message.');
        return;
    }
    director.emit(game.gameEvent.GAME_TOAST_SHOW, message);
} 