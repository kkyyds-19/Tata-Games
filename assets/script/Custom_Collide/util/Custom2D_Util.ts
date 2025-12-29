import { Rect, Vec2, v2 } from "cc";
import { ConvexPartition } from "./polygon-partition";

export default class Custom2D_Util {
    /**
     * 点是否在直线上
     * @param point 点
     * @param line_point_1 直线上点1 
     * @param line_point_2 直线上点2
     */
    static pointOnLine(point: Vec2, line_point_1: Vec2, line_point_2: Vec2): boolean {
        const a = line_point_1.y - line_point_2.y;
        const b = line_point_2.x - line_point_1.x;
        const c = line_point_1.x * line_point_2.y - line_point_1.y * line_point_2.x;
        return Math.abs(a * point.x + b * point.y + c) <= 0.000001;
    }

    /**
     * 点是否在线段上
     * @param point 点
     * @param line_point_1 线段端点1 
     * @param line_point_2 线段端点2
     */
    static pointOnLineSegment(point: Vec2, line_point_1: Vec2, line_point_2: Vec2): boolean {
        return Math.abs(point.clone().subtract(line_point_1.clone()).length() + point.clone().subtract(line_point_2.clone()).length() - line_point_1.clone().subtract(line_point_2.clone()).length()) <= 0.000001;
    }

    /**
     * 点到直线的距离
     * @param point 点
     * @param line_point_1 直线上点1 
     * @param line_point_2 直线上点2
     */
    static pointToLineDistance(point: Vec2, line_point_1: Vec2, line_point_2: Vec2): number {
        const a = line_point_1.y - line_point_2.y;
        const b = line_point_2.x - line_point_1.x;
        const c = line_point_1.x * line_point_2.y - line_point_1.y * line_point_2.x;
        return Math.abs(a * point.x + b * point.y + c) / Math.sqrt(a * a + b * b);
    }

    /**
     * 点是否在多边形内
     * @param point 点
     * @param polygonPoints 多边形
     */
    static pointInPolygon(point: Vec2, polygonPoints: Vec2[]) {
        let result: boolean = false;
        let len: number = polygonPoints?.length;
        for (let i = 0, j = len - 1; i < len; j = i++) {
            const point_a = polygonPoints[i],
                point_b = polygonPoints[j];
            // 点在多边形边上
            if (Custom2D_Util.pointOnLineSegment(point, point_a, point_b)) return true;

            // 判断点是否在边的左边，在左边则会产生交点（交点数为奇数则在多边形内，偶数则在多边形外（排除点在边上））
            if ((point_a.y - point.y > 0 !== point_b.y - point.y > 0) && ((point.x - (point.y - point_a.y) * (point_a.x - point_b.x) / (point_a.y - point_b.y) - point_a.x) < 0)) {
                result = !result;
            }
        }
        return result;
    }

    /**
     * 圆与线段是否相交
     * @param circleCenter 圆心坐标
     * @param circleRadius 圆的半径
     * @param line_point_1 线段端点1
     * @param line_point_2 线段端点2
     */
    static lineSegmentIntersectsCircle(circleCenter: Vec2, circleRadius: number, line_point_1: Vec2, line_point_2: Vec2): boolean {
        const lensqr_1 = circleCenter.clone().subtract(line_point_1.clone()).lengthSqr(), lensqr_2 = circleCenter.clone().subtract(line_point_2.clone()).lengthSqr();
        if (lensqr_1 <= circleRadius * circleRadius || lensqr_2 <= circleRadius * circleRadius) return true;
        const lensqr_3 = line_point_1.clone().subtract(line_point_2.clone()).lengthSqr();

        const cos1 = (lensqr_2 + lensqr_3 - lensqr_1) / (2 * Math.sqrt(lensqr_2) * Math.sqrt(lensqr_3));
        const cos2 = (lensqr_1 + lensqr_3 - lensqr_2) / (2 * Math.sqrt(lensqr_1) * Math.sqrt(lensqr_3));

        if (cos1 > 0 && cos2 > 0) {
            return Custom2D_Util.pointToLineDistance(circleCenter, line_point_1, line_point_2) <= circleRadius;
        }
        return false;
    }

    /**
     * 判断两个无旋转的矩形是否相交
     * @param rect1 无旋转矩形1
     * @param rect2 无旋转矩形2
     * @returns 
     */
    static aabbIntersectsAabb(rect1: Rect, rect2: Rect) {
        return !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x || rect1.y + rect1.height < rect2.y || rect2.y + rect2.height < rect1.y)
    }

    /**
     * 判断两个圆是否相交
     * @param circleCenter1 圆1圆心
     * @param circleRadius1 圆1半径
     * @param circleCenter2 圆2圆心
     * @param circleRadius2 圆2半径
     */
    static circleIntersectsCircle(circleCenter1: Vec2, circleRadius1: number, circleCenter2: Vec2, circleRadius2: number) {
        return circleCenter1.clone().subtract(circleCenter2.clone()).length() <= circleRadius1 + circleRadius2;
    }

    /**
     * 判断圆与不带旋转的矩形是否相交
     * @param circleCenter 圆心
     * @param circleRadius 圆半径
     * @param rect 矩形包围盒
     */
    static circleIntersectsAabb(circleCenter: Vec2, circleRadius: number, rect: Rect) {
        const relativeX = circleCenter.x - (rect.x + rect.width / 2);
        const relativeY = circleCenter.y - (rect.y + rect.height / 2);
        const dx = Math.max(Math.min(relativeX, rect.width / 2), -rect.width / 2);
        const dy = Math.max(Math.min(relativeY, rect.height / 2), -rect.height / 2);
        return (dx - relativeX) * (dx - relativeX) + (dy - relativeY) * (dy - relativeY) <= circleRadius * circleRadius;
    }

    /**
     * 判断圆与多边形是否相交
     * @param circleCenter 圆心
     * @param circleRadius 圆半径
     * @param polygonPoints 多边形顶点坐标 
     * @returns 
     */
    static circleInterectsPolygon(circleCenter: Vec2, circleRadius: number, polygonPoints: Vec2[]) {
        if (Custom2D_Util.pointInPolygon(circleCenter, polygonPoints)) return true;
        const len = polygonPoints.length;
        for (let i = 0, j = len - 1; i < len; j = i++) {
            const point_a = polygonPoints[i], point_b = polygonPoints[j];
            if (Custom2D_Util.lineSegmentIntersectsCircle(circleCenter, circleRadius, point_a, point_b)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断多边形与多边形是否相交
     * @param polygonPointsA 多边形A顶点坐标 
     * @param polygonPointsB 多边形B顶点坐标 
     */
    static polygonInterectsPolygon(polygonPointsA: Vec2[], polygonPointsB: Vec2[]) {
        // 凹多变形分成凸多边形
        const polygonPointsA_Convex = ConvexPartition(polygonPointsA);
        // 凹多变形分成凸多边形
        const polygonPointsB_Convex = ConvexPartition(polygonPointsB);

        const isInterects = (polygonPointsAA: Vec2[], polygonPointsBB: Vec2[]) => {
            const polygons = [polygonPointsAA, polygonPointsBB];
            let minA: number, maxA: number, projected: number = 0, minB: number, maxB: number, j = 0;
            for (let polygon of polygons) {
                for (let i = 0; i < polygon.length; ++i) {
                    const point_a = polygon[i];
                    const point_b = polygon[(i + 1) % polygon.length];
                    // 法向量
                    const v = v2(point_a.y - point_b.y, point_b.x - point_a.x);
                    minA = Number.MAX_SAFE_INTEGER;
                    maxA = Number.MIN_SAFE_INTEGER;

                    // 求多边形A在法向量v上的最大投影和最小投影
                    for (j = 0; j < polygonPointsAA.length; ++j) {
                        // 边在法向量上的投影
                        projected = v.x * polygonPointsAA[j].x + v.y * polygonPointsAA[j].y;
                        if (projected < minA) {
                            minA = projected;
                        }
                        if (projected > maxA) {
                            maxA = projected;
                        }
                    }

                    minB = Number.MAX_SAFE_INTEGER;
                    maxB = Number.MIN_SAFE_INTEGER;

                    // 求多边形B在法向量v上的最大投影和最小投影
                    for (j = 0; j < polygonPointsBB.length; ++j) {
                        // 边在法向量上的投影
                        projected = v.x * polygonPointsBB[j].x + v.y * polygonPointsBB[j].y;
                        if (projected < minB) {
                            minB = projected;
                        }
                        if (projected > maxB) {
                            maxB = projected;
                        }
                    }
                    // 存在分离轴将两个凸多边形分离（分离轴定理）
                    if (maxA < minB || maxB < minA) {
                        return false;
                    }
                }
            }
            return true;
        }

        // 判断polygonPointsA_Convex 与 polygonPointsB_Convex 中的凸多边形是否有相交的情况
        for (let m = 0; m < polygonPointsA_Convex.length; ++m) {
            const polygonAA = polygonPointsA_Convex[m];
            for (let n = 0; n < polygonPointsB_Convex.length; ++n) {
                const polygonBB = polygonPointsB_Convex[n];
                if (isInterects(polygonAA, polygonBB)) {
                    return true;
                }
            }
        }

        return false;
    }
}
