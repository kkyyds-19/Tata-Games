export class Cfgs {
    public static mapDic: Map<any, String> = new Map<any, String>();
    public constructor() { }

    public static CfgMap: Map<number, CfgMap> = new Map<number, CfgMap>();
    public static CfgWorld: Map<number, CfgWorld> = new Map<number, CfgWorld>();

    public static GetCfg<V, K>(map: Map<K, V>, key: K) {
        const typename = Cfgs.mapDic.get(map);
        if (!typename) throw new Error(`!GetCfg !map:${map}`);
        if (map.has(key)) {
            return map.get(key);
        }
        console.error(`! Configs [${typename}] get key:[${JSON.stringify(key)}]`);
        return undefined;
    }

}