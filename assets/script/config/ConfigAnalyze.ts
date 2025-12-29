import { _decorator, Component, Node, js, JsonAsset } from 'cc';
import { Singleton } from '../utils/Singleton';
import { Cfgs as Cfgs } from './Cfgs';
import { resManager } from '../utils/resManager';
import { GlobalVariable } from '../global/GlobalVariable';
const { ccclass, property } = _decorator;

@ccclass('ConfigAnalyze')
export class ConfigAnalyze extends Singleton<ConfigAnalyze>() {
    private iszip;
    private cfgCount: number;
    private isloaded: boolean;
    private constructor() {
        super();
        this.isloaded = false;
    }

    public async loadData(): Promise<void> {
        if (this.isloaded) { // 已加载
            return;
        }
        this.iszip = false;
        await this.loadConfig();
        this.isloaded = true;
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    protected async loadConfig(): Promise<void> {
        var keys = Object.getOwnPropertyNames(Cfgs);
        this.cfgCount = keys.length;
        console.log("loadConfig-----------" + this.cfgCount);
        await this.loadCfg1();
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    private async loadCfg1(): Promise<void> {
        await this.GenericConfig(Cfgs.CfgMap, "CfgMap");
        await this.GenericConfig(Cfgs.CfgWorld, "CfgWorld");
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    private async GenericConfig<K, V>(hashMap: Map<K, V>, confName: string, key = "id"): Promise<void> {
        this.analyGenericConfig(hashMap, confName, key);
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    /**
       * 解析json
       * @param hashMap
       * @param confName 
       * @param key 
       */
    private async analyGenericConfig<K, V>(hashMap: Map<K, V>, confName: string, key = "id"): Promise<void> {
        const confs = await resManager.asyncloadAsset(GlobalVariable.bundleCfg, confName, JsonAsset) as JsonAsset;
        if (confs != undefined) {
            const json = confs.json as any[];
            const len: number = json.length;
            for (let i = 0; i < len; ++i) {
                const temp: any = json[i];
                if (temp[key] == undefined) {
                    console.log(key + " Key is error!")
                }
                else {
                    if (hashMap.has(temp[key])) {
                        console.warn(key + " Key is exist!")
                    } else {
                        hashMap.set(temp[key], temp);
                    }
                }
            }
            Cfgs.mapDic.set(hashMap, confName);
            console.log(`${confName} > ${hashMap.size}`);
        } else {
            console.error(confName + " is error!");
        }

        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    private async GenericConstantConfig<V>(confName: string): Promise<V> {
        let ret = this.analyGenericConstantConfig<V>(confName);
        return new Promise<V>((resolve, reject) => {
            if (ret) resolve(ret);
            else {
                reject();
            }
        });
    }

    private async analyGenericConstantConfig<V>(confName: string): Promise<V> {
        const confs = await resManager.asyncloadAsset(GlobalVariable.bundleCfg, confName, JsonAsset) as JsonAsset;
        return new Promise<V>((resolve, reject) => {
            if (confs) {
                resolve(confs.json as unknown as V);
            } else {
                console.error(confName + " is error!");
                reject();
            }
        });
    }
}