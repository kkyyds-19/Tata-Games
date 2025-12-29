import { _decorator, Component, Node, Label, Color, UITransform, Graphics, ScrollView, Mask, Vec3, LabelOutline } from 'cc';
import { ChallengeLog } from './ChallengeLog';

const { ccclass } = _decorator;

@ccclass('ChallengeLogDialog')
export class ChallengeLogDialog extends Component {
    static showOn(parent: Node): Node {
        const overlay = new Node('ChallengeLogDialog');
        overlay.layer = parent.layer;
        parent.addChild(overlay);

        // 根据父节点尺寸全屏覆盖
        const parentUI = parent.getComponent(UITransform);
        const w = parentUI ? parentUI.width : 1080;
        const h = parentUI ? parentUI.height : 1920;
        const overlayUI = overlay.addComponent(UITransform);
        overlayUI.setContentSize(w, h);
        overlay.setPosition(new Vec3(0, 0, 0));

        // 半透明遮罩背景（全屏）
        const shade = new Node('shade');
        const shadeUI = shade.addComponent(UITransform);
        shadeUI.setContentSize(w, h);
        const shadeG = shade.addComponent(Graphics);
        shadeG.fillColor = new Color(0, 0, 0, 180);
        // 以中心为原点绘制全屏遮罩，避免只覆盖部分区域
        shadeG.rect(-w / 2, -h / 2, w, h);
        shadeG.fill();
        overlay.addChild(shade);

        // 主面板背景
        const panel = new Node('panel');
        const panelUI = panel.addComponent(UITransform);
        const panelW = Math.min(900, w - 120);
        const panelH = Math.min(1100, h - 240);
        panelUI.setContentSize(panelW, panelH);
        panel.setPosition(new Vec3(0, 0, 0));
        const panelG = panel.addComponent(Graphics);
        panelG.fillColor = new Color(30, 45, 110, 220);
        panelG.roundRect(-panelW / 2, -panelH / 2, panelW, panelH, 16);
        panelG.fill();

        // 面板虚线边框
        const border = new Node('border');
        const borderG = border.addComponent(Graphics);
        borderG.lineWidth = 3;
        borderG.strokeColor = new Color(210, 210, 210, 200);
        const dash = 10;
        const gap = 6;
        const leftX = -panelW / 2 + 2;
        const rightX = panelW / 2 - 2;
        const topY = panelH / 2 - 2;
        const bottomY = -panelH / 2 + 2;
        const drawDashedLine = (g: Graphics, x1: number, y1: number, x2: number, y2: number, d: number, ggap: number) => {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const vx = dx / len;
            const vy = dy / len;
            let dist = 0;
            let cx = x1;
            let cy = y1;
            while (dist + d <= len) {
                g.moveTo(cx, cy);
                cx += vx * d;
                cy += vy * d;
                g.lineTo(cx, cy);
                dist += d;
                if (dist + ggap > len) break;
                cx += vx * ggap;
                cy += vy * ggap;
                dist += ggap;
            }
            g.stroke();
        };
        drawDashedLine(borderG, leftX, topY, rightX, topY, dash, gap);
        drawDashedLine(borderG, rightX, topY, rightX, bottomY, dash, gap);
        drawDashedLine(borderG, rightX, bottomY, leftX, bottomY, dash, gap);
        drawDashedLine(borderG, leftX, bottomY, leftX, topY, dash, gap);
        panel.addChild(border);
        overlay.addChild(panel);

        // 标题（居中、加大字号）
        const titleNode = new Node('title');
        const titleUI = titleNode.addComponent(UITransform);
        titleUI.setContentSize(panelW, 72);
        const titleLabel = titleNode.addComponent(Label);
        titleLabel.string = '挑战记录';
        titleLabel.color = new Color(255, 230, 120);
        titleLabel.fontSize = 54;
        const titleOutline = titleNode.addComponent(LabelOutline);
        titleOutline.color = new Color(255, 180, 60);
        titleOutline.width = 4;
        titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        titleLabel.verticalAlign = Label.VerticalAlign.CENTER;
        titleLabel.overflow = Label.Overflow.CLAMP;
        titleNode.setPosition(new Vec3(0, panelH / 2 - 50, 0));
        panel.addChild(titleNode);

        // ScrollView 容器
        const scrollNode = new Node('scroll');
        const scrollUI = scrollNode.addComponent(UITransform);
        // 增加标题与列表的间距（高度稍减）
        scrollUI.setContentSize(panelW - 40, panelH - 160);
        // 将滚动区域整体下移一点，避免与标题过近
        scrollNode.setPosition(new Vec3(0, -24, 0));
        const mask = scrollNode.addComponent(Mask);
        // 默认类型为矩形裁剪，无需显式设置，避免不同版本枚举差异导致报错
        const scrollView = scrollNode.addComponent(ScrollView);
        scrollView.horizontal = false;
        scrollView.vertical = true;
        panel.addChild(scrollNode);

        // 列表区域深色背景
        const scrollBg = new Node('scroll_bg');
        const scrollBgUI = scrollBg.addComponent(UITransform);
        scrollBgUI.setContentSize(scrollUI.width, scrollUI.height);
        const scrollBgG = scrollBg.addComponent(Graphics);
        scrollBgG.fillColor = new Color(15, 25, 60, 180);
        scrollBgG.roundRect(-scrollBgUI.width / 2, -scrollBgUI.height / 2, scrollBgUI.width, scrollBgUI.height, 12);
        scrollBgG.fill();
        scrollNode.addChild(scrollBg);

        // 内容节点
        const content = new Node('content');
        const contentUI = content.addComponent(UITransform);
        contentUI.setContentSize(scrollUI.width, scrollUI.height);
        scrollNode.addChild(content);
        scrollView.content = content;

        // 渲染记录
        const records = ChallengeLog.getRecords(50);
        const rowHeight = 140;
        const margin = 12;
        let contentHeight = Math.max(records.length * rowHeight, scrollUI.height);
        contentUI.setContentSize(scrollUI.width, contentHeight);
        for (let i = 0; i < records.length; i++) {
            const r = records[i];
            const row = new Node(`row_${i}`);
            const rowUI = row.addComponent(UITransform);
            const rowW = scrollUI.width - margin * 2;
            rowUI.setContentSize(rowW, rowHeight);

            // 行内背景（圆角深色）
            const rowBg = new Node('row_bg');
            const rowBgUI = rowBg.addComponent(UITransform);
            rowBgUI.setContentSize(rowW, rowHeight - 6);
            const rowBgG = rowBg.addComponent(Graphics);
            rowBgG.fillColor = new Color(20, 35, 85, 140);
            rowBgG.roundRect(-rowBgUI.width / 2, -rowBgUI.height / 2, rowBgUI.width, rowBgUI.height, 10);
            rowBgG.fill();
            row.addChild(rowBg);
            const date = `${r.dateKey.slice(0,4)}-${r.dateKey.slice(4,6)}-${r.dateKey.slice(6,8)}`;
            const resultText = r.result === 'win' ? '胜利' : '失败';
            const resultColor = r.result === 'win' ? new Color(40, 220, 120) : new Color(240, 80, 80);

            // 第一行：日期（左对齐）
            const dateNode = new Node('date');
            const dateUI = dateNode.addComponent(UITransform);
            dateUI.setContentSize(rowW - 16, Math.floor(rowHeight / 2) - 10);
            const dateLabel = dateNode.addComponent(Label);
            dateLabel.string = date;
            dateLabel.fontSize = 44;
            dateLabel.color = resultColor;
            dateLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
            dateLabel.verticalAlign = Label.VerticalAlign.TOP;
            dateLabel.overflow = Label.Overflow.CLAMP;
            dateLabel.enableWrapText = false;
            dateNode.setPosition(new Vec3(-rowW / 2 + 16 + (dateUI.width / 2), +32, 0));
            row.addChild(dateNode);

            // 第二行左侧：对手（左对齐）
            const oppNode = new Node('opponent');
            const oppUI = oppNode.addComponent(UITransform);
            oppUI.setContentSize(Math.floor(rowW * 0.62), Math.floor(rowHeight / 2) - 10);
            const oppLabel = oppNode.addComponent(Label);
            oppLabel.string = `对手：${r.opponentName}`;
            oppLabel.fontSize = 44;
            oppLabel.color = resultColor;
            oppLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
            oppLabel.verticalAlign = Label.VerticalAlign.BOTTOM;
            oppLabel.overflow = Label.Overflow.CLAMP;
            oppLabel.enableWrapText = false;
            oppNode.setPosition(new Vec3(-rowW / 2 + 16 + (oppUI.width / 2), -32, 0));
            row.addChild(oppNode);

            // 第二行右侧：结果（右对齐）
            const resNode = new Node('result');
            const resUI = resNode.addComponent(UITransform);
            resUI.setContentSize(Math.floor(rowW * 0.32), Math.floor(rowHeight / 2) - 10);
            const resLabel = resNode.addComponent(Label);
            resLabel.string = `结果：${resultText}`;
            resLabel.fontSize = 44;
            resLabel.color = resultColor;
            resLabel.horizontalAlign = Label.HorizontalAlign.RIGHT;
            resLabel.verticalAlign = Label.VerticalAlign.BOTTOM;
            resLabel.overflow = Label.Overflow.CLAMP;
            resLabel.enableWrapText = false;
            resNode.setPosition(new Vec3(rowW / 2 - 16 - (resUI.width / 2), -32, 0));
            row.addChild(resNode);

            // 行底部虚线分隔
            const sep = new Node('separator');
            const sepG = sep.addComponent(Graphics);
            sepG.lineWidth = 3;
            sepG.strokeColor = new Color(170, 190, 220, 230);
            let sx = -rowW / 2;
            const sy = -rowHeight / 2 + 1;
            const ex = rowW / 2;
            const dashLen = 18;
            const gapLen = 8;
            while (sx + dashLen <= ex) {
                sepG.moveTo(sx, sy);
                sepG.lineTo(sx + dashLen, sy);
                sx += dashLen + gapLen;
            }
            sepG.stroke();
            row.addChild(sep);

            // 内容从上向下排布，保持居中
            const y = contentHeight / 2 - (i + 0.5) * rowHeight;
            row.setPosition(new Vec3(0, y, 0));
            content.addChild(row);
        }

        // 提示 & 点击关闭：点击遮罩关闭，不影响面板内的滚动与交互
        const tipNode = new Node('tip');
        const tipLabel = tipNode.addComponent(Label);
        tipLabel.string = '点击背景关闭';
        tipLabel.fontSize = 26;
        tipLabel.color = new Color(230, 230, 230);
        tipNode.setPosition(new Vec3(panelW / 2 - 120, -panelH / 2 + 20, 0));
        panel.addChild(tipNode);

        shade.on(Node.EventType.TOUCH_END, () => {
            overlay.removeFromParent();
        });

        return overlay;
    }
}