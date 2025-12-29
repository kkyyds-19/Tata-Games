import { error } from "cc";
import { resources } from "cc";
import { assetManager, AssetManager, log } from "cc";
import { Sprite, Asset, SpriteFrame } from "cc";

export class resManager {

    /**
     * 加载Asset
     * 自动释放
     * @param bundleName 
     * @param assetName 
     * @returns 
     */
    public static async asyncloadAsset(bundleName: string, assetName: string, type: typeof Asset = Asset) {
        var bundle = await resManager.getBundle(bundleName);
        return new Promise((resolve, reject) => {
            if (bundle) {
                bundle.load(assetName, type, (error, assets) => {
                    if (!!error) {
                        log(bundleName + '=Error asyncloadAsset [' + error + ']');
                        reject();
                        return;
                    }
                    resolve(assets);
                });
            };
        });
    }

    /**
     * 加载精灵纹理
     * 带自动释放
     * @param sprite 
     * @param bundleName 
     * @param assetName 
     * @param target 
     * @returns 
     */
    public static setSprite(sprite: Sprite, bundleName: string, assetName: string) {
        if (!assetName.endsWith("/spriteFrame")) {
            assetName += "/spriteFrame";
        }
        return new Promise((resolve) => {
            resManager.loadAsset(bundleName, assetName, (res: Asset) => {
                if (res && sprite.node && sprite.node.isValid) {
                    sprite.spriteFrame = res as SpriteFrame;
                }
                resolve(0);
            }, sprite);
            return;
        }
        );
    }

    /**
     * 加载资源，不加入释放逻辑
     * @param bundleName 
     * @param assetName 
     * @param compCb 
     * @param thisObject 
     * @param args 
     * @ deprecated
     */
    public static loadAsset(bundleName: string, assetName: string, compCb: Function = null, thisObject: any = null, ...args) {
        // 找到资源直接使用
        const findbundle = assetManager.getBundle(bundleName);
        if (findbundle && findbundle.get(assetName)) {
            compCb.call(thisObject, findbundle.get(assetName), [...args]);
            return;
        }
        // 加载
        resManager.getBundle(bundleName).then((bundle: AssetManager.Bundle) => {
            var asset = bundle.get(assetName);
            if (asset != null) {
                compCb?.call(thisObject, asset, [...args]);
            }
            else {
                bundle.load(assetName, (err, asset) => {
                    if (err) {
                        log('Error onLoadAssetBundle [' + err + ']');
                        return;
                    }
                    //console.log("onLoadAssetBundle="+assetName+"/"+otherargs);
                    compCb.call(thisObject, asset, [...args]);
                })
            }
        });
    }

    /**
     * 获取Bundle
     * @param name 
     * @returns 
     */
    public static getBundle(name: string): Promise<AssetManager.Bundle> {
        if (!name || name.length == 0 || name == "resources") return Promise.resolve(resources);
        const bundle = assetManager.getBundle(name)
        if (bundle) {
            return Promise.resolve(bundle);
        }
        return new Promise<AssetManager.Bundle>(resolve => {
            assetManager.loadBundle(name, (err, bundle) => {
                if (err) {
                    error("======加载bundle失败", err)
                    return resolve(null)
                }
                return resolve(bundle)
            });
        })
    }

}