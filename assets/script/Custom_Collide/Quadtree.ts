import { Rect, rect } from "cc";
import { Custom2D_Collide } from "./Custom2D_Collide";

export default class Quadtree {
    public max_objects: number; // 每块区域object最大数量
    public max_levels: number;  // 四叉树最大深度
    public level: number;       // 当前深度
    public bounds: Rect;         // 视图属性
    public objects: Array<Custom2D_Collide> = [];
    public nodes: Array<Quadtree> = [];

    /**
     * Quadtree Constructor
     * @class Quadtree
     * @param {Rect} bounds                 bounds of the node ({ x：左下, y：右下, width, height })
     * @param {number} [max_objects=10]     (optional) max objects a node can hold before splitting into 4 subnodes (default: 10)
     * @param {number} [max_levels=4]       (optional) total max levels inside root Quadtree (default: 4) 
     * @param {number} [level=0]            (optional) depth level, required for subnodes (default: 0)
     */
    constructor(bounds: Rect, max_objects?: number, max_levels?: number, level?: number) {
        this.max_objects = max_objects || 10;
        this.max_levels = max_levels || 4;

        this.level = level || 0;
        this.bounds = bounds;

        this.objects = [];
        this.nodes = [];
    };

    /**
     * Split the node into 4 subnodes
     * @memberof Quadtree
     */
    split() {
        let nextLevel = this.level + 1,
            subWidth = this.bounds.width / 2,
            subHeight = this.bounds.height / 2,
            x = this.bounds.x,
            y = this.bounds.y;

        //right bottom node
        this.nodes[3] = new Quadtree(rect(x + subWidth, y, subWidth, subHeight), this.max_objects, this.max_levels, nextLevel);
        //left bottom node
        this.nodes[2] = new Quadtree(rect(x, y, subWidth, subHeight), this.max_objects, this.max_levels, nextLevel);
        //left top node
        this.nodes[1] = new Quadtree(rect(x, y + subHeight, subWidth, subHeight), this.max_objects, this.max_levels, nextLevel);
        //right top node
        this.nodes[0] = new Quadtree(rect(x + subWidth, y + subHeight, subWidth, subHeight), this.max_objects, this.max_levels, nextLevel);
    };

    /**
     * Determine which node the object belongs to
     * @param {Custom2D_Collide} collide
     * @return {number[]}       an array of indexes of the intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
     * @memberof Quadtree
     */
    getIndex(collide: Custom2D_Collide) {
        const pRect = collide.worldAABB;
        let indexes: Array<number> = [],
            boundsCenterX = this.bounds.x + this.bounds.width / 2,
            boundsCenterY = this.bounds.y + this.bounds.height / 2;

        // const isNorth = pRect.y + pRect.height / 2 > boundsCenterY,
        //     isWest = pRect.x - pRect.width / 2 < boundsCenterX,
        //     isEast = pRect.x + pRect.width / 2 > boundsCenterX,
        //     isSouth = pRect.y - pRect.height / 2 < boundsCenterY;

        const isNorth = pRect.y + pRect.height > boundsCenterY,
            isWest = pRect.x < boundsCenterX,
            isEast = pRect.x + pRect.width > boundsCenterX,
            isSouth = pRect.y < boundsCenterY;
        // right top
        if (isEast && isNorth) {
            indexes.push(0);
        }
        // left top
        if (isNorth && isWest) {
            indexes.push(1);
        }
        // left bottom
        if (isWest && isSouth) {
            indexes.push(2);
        }
        // right bottom
        if (isSouth && isEast) {
            indexes.push(3);
        }

        return indexes;
    };

    /**
     * Insert the object into the node. If the node
     * exceeds the capacity, it will split and add all
     * objects to their corresponding subnodes.
     * @param {Custom2D_Collide} object
     * @memberof Quadtree
     */
    insert(object: Custom2D_Collide) {
        let i = 0,
            indexes;

        //if we have subnodes, call insert on matching subnodes
        if (this.nodes.length) {
            indexes = this.getIndex(object);

            for (i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].insert(object);
            }
            return;
        }

        //otherwise, store object here
        this.objects.push(object);

        //max_objects reached
        if (this.objects.length > this.max_objects && this.level < this.max_levels) {
            //split if we don't already have subnodes
            if (!this.nodes.length) {
                this.split();
            }

            //add all objects to their corresponding subnode
            for (i = 0; i < this.objects.length; i++) {
                indexes = this.getIndex(this.objects[i]);
                for (var k = 0; k < indexes.length; k++) {
                    this.nodes[indexes[k]].insert(this.objects[i]);
                }
            }
            this.objects = [];
        }
    };


    /**
     * Return all objects that could collide with the given object
     * @param {Custom2D_Collide} collide
     * @return {ReCustom2D_Collidect[]}  array with all detected objects
     * @memberof Quadtree
     */
    retrieve(collide: Custom2D_Collide) {
        let indexes = this.getIndex(collide),
            returnObjects = this.objects;

        //if we have subnodes, retrieve their objects
        if (this.nodes.length) {
            for (let i = 0, len = indexes.length; i < len; i++) {
                returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(collide));
            }
        }

        //remove duplicates
        returnObjects = returnObjects.filter((item, index) => {
            return returnObjects.indexOf(item) >= index;
        });

        return returnObjects;
    };


    /**
     * Clear the quadtree
     * @memberof Quadtree
     */
    clear() {
        this.objects = [];

        for (let i = 0, len = this.nodes.length; i < len; i++) {
            if (this.nodes.length) {
                this.nodes[i].clear();
            }
        }

        this.nodes = [];
    };
}
