import { Column, List, Resource, Type } from "../decorator/resource";
import { Index } from "../decorator";

@Resource
export class WeaponComponent {

    @Index
    public readonly source: string;

    public readonly name: string;

    @Type("int")
    public readonly count: number;

    @Type("float")
    @List("-")
    public readonly damage: number[];

    @Type("int")
    @Column("force on hit")
    public readonly forceOnHit: number;

    @Type("float")
    public readonly radius: number;

    @Type("float")
    public readonly dps: number;

    @Type("float")
    @Column("shoot delay")
    public readonly shootDelay: number;


    constructor(source: string, name: string, count: number, damage: number[], forceOnHit: number, radius: number, dps: number, shootDelay: number) {
        this.source = source;
        this.name = name;
        this.count = count;
        this.damage = damage;
        this.forceOnHit = forceOnHit;
        this.radius = radius;
        this.dps = dps;
        this.shootDelay = shootDelay;
    }
}
