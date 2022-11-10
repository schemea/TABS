import { Resource, Type } from "../decorator/resource";
import { Index } from "../decorator/indexing";

@Resource
export class Effect {
    @Index
    public readonly source: string;

    @Type("float")
    public readonly duration: number;

    @Type("float")
    public readonly dps: number;

    @Type("float")
    public readonly damage: number;


    constructor(source: string, duration: number, dps: number, damage: number) {
        this.source = source;
        this.duration = duration;
        this.dps = dps;
        this.damage = damage;
    }
}
