import { Column, Resource, Type } from "../decorator/resource";
import { Index } from "../decorator";

@Resource
export class Effect {
    @Index
    public readonly source: string;

    @Type("float")
    public readonly duration: number;

    @Type("float")
    public readonly dps: number;

    @Type("float")
    @Column("total damage")
    public readonly totalDamage: number;


    constructor(source: string, duration: number, dps: number, totalDamage: number) {
        this.source = source;
        this.duration = duration;
        this.dps = dps;
        this.totalDamage = totalDamage;
    }
}
